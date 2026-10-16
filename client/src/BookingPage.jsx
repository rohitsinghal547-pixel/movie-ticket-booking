import { useEffect, useState } from "react";
import {
    useParams,
    Link,
    useNavigate
} from "react-router-dom";
import API_URL from "./api";

const movieDetails = {
    "Interstellar": {
        genre: "Sci-Fi | Adventure",
        rating: 8.7,
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
    },
    "Oppenheimer": {
        genre: "Drama | History",
        rating: 8.3,
        poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg"
    },
    "Avengers: Endgame": {
        genre: "Action | Adventure",
        rating: 8.4,
        poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
    },
    "Parasite": {
        genre: "Thriller | Drama",
        rating: 8.5,
        poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"
    }
};

const cinemas = [
    { id: 1, name: "PVR Cinemas", location: "Dehradun" },
    { id: 2, name: "INOX", location: "Dehradun" },
    { id: 3, name: "Cinepolis", location: "Dehradun" }
];

const showtimes = ["10:00 AM", "1:30 PM", "6:00 PM", "9:30 PM"];

const seatRows = ["A", "B", "C", "D", "E"];
const seatsPerRow = 8;

function BookingPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [quantity, setQuantity] = useState(1);
    const [selectedCinema, setSelectedCinema] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [selectedShowtime, setSelectedShowtime] = useState("");
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [savingBooking, setSavingBooking] = useState(false);
    const [bookingError, setBookingError] = useState("");
    const [occupiedSeats, setOccupiedSeats] = useState([]);
    const [loadingSeats, setLoadingSeats] = useState(false);
    const [seatError, setSeatError] = useState("");

    // Fetch the selected movie from the backend.
    useEffect(() => {
        let cancelled = false;

        async function fetchMovie() {
            try {
                setLoading(true);
                setError("");

                const response = await fetch(`${API_URL}/api/movies`)

                if (!response.ok) {
                    throw new Error("Unable to fetch movies.");
                }

                const movies = await response.json();

                const selectedMovie = movies.find(
                    (item) => item._id === id
                );

                if (!selectedMovie) {
                    throw new Error("Movie not found in the database.");
                }

                const details = movieDetails[selectedMovie.name] || {};

                if (!cancelled) {
                    setMovie({
                        ...selectedMovie,
                        genre: selectedMovie.genre || details.genre || "Genre unavailable",
                        rating: selectedMovie.rating ?? details.rating ?? "N/A",
                        poster: selectedMovie.poster || details.poster || ""
                    });
                }
            } catch (err) {
                console.error("Error loading movie:", err);

                if (!cancelled) {
                    setError(err.message || "Unable to load this movie.");
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        fetchMovie();

        return () => {
            cancelled = true;
        };
    }, [id]);

    // Fetch occupied seats whenever the screening selection changes.
useEffect(() => {
    const cinema = cinemas.find(
        (item) => item.id === selectedCinema
    );

    // Wait until the cinema, date, and showtime are selected.
    if (!movie?._id || !cinema || !selectedDate || !selectedShowtime) {
        setOccupiedSeats([]);
        setSeatError("");
        setLoadingSeats(false);
        return;
    }

    const controller = new AbortController();

    async function fetchOccupiedSeats() {
        setLoadingSeats(true);
        setSeatError("");
        setOccupiedSeats([]);

        try {
            const params = new URLSearchParams({
                movieId: movie._id,
                cinemaName: cinema.name,
                date: selectedDate,
                showtime: selectedShowtime
            });

            const response = await fetch(
                `http://localhost:5000/api/bookings/occupied-seats?${params.toString()}`,
                {
                    signal: controller.signal
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to check seat availability."
                );
            }

            const occupied = data.occupiedSeats || [];

            setOccupiedSeats(occupied);

            // Remove selected seats that are now occupied.
            setSelectedSeats((previousSeats) =>
                previousSeats.filter(
                    (seat) => !occupied.includes(seat)
                )
            );
        } catch (error) {
            if (error.name !== "AbortError") {
                console.error("Error fetching occupied seats:", error);

                setOccupiedSeats([]);
                setSeatError(
                    error.message || "Unable to check seat availability."
                );
            }
        } finally {
            if (!controller.signal.aborted) {
                setLoadingSeats(false);
            }
        }
    }

    fetchOccupiedSeats();

    return () => {
        controller.abort();
    };
}, [movie?._id, selectedCinema, selectedDate, selectedShowtime]);
    const today = new Date();

    const localToday = new Date(
        today.getTime() - today.getTimezoneOffset() * 60000
    )
        .toISOString()
        .split("T")[0];

    const totalPrice = movie
        ? movie.ticketPrice * quantity
        : 0;

    function increaseQuantity() {
        if (quantity < 10) {
            setQuantity(quantity + 1);
            setSelectedSeats([]);
        }
    }

    function decreaseQuantity() {
        if (quantity > 1) {
            setQuantity(quantity - 1);
            setSelectedSeats([]);
        }
    }

    function toggleSeat(seatId) {
        if (occupiedSeats.includes(seatId)) {
            return;
        }

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(
                selectedSeats.filter((seat) => seat !== seatId)
            );
            return;
        }

        if (selectedSeats.length >= quantity) {
            alert(`You can select only ${quantity} seat(s).`);
            return;
        }

        setSelectedSeats([...selectedSeats, seatId]);
    }

const canContinue =
    Boolean(movie) &&
    selectedCinema !== "" &&
    selectedDate !== "" &&
    selectedShowtime !== "" &&
    selectedSeats.length === quantity &&
    !loadingSeats &&
    !seatError &&
    selectedSeats.every(
        (seat) => !occupiedSeats.includes(seat)
    );

    if (loading) {
        return (
            <main className="booking-page">
                <p className="status-message">Loading movie details...</p>
            </main>
        );
    }

    if (error || !movie) {
        return (
            <main className="booking-page">
                <h2>{error || "Movie not found"}</h2>
                <p>We couldn't load this movie from the database.</p>
                <Link to="/">Return to Home</Link>
            </main>
        );
    }

    return (
        <main className="booking-page">
            <Link to="/" className="back-link">
                ← Back to Movies
            </Link>

            <div className="booking-card">
                <img
                    src={movie.poster}
                    alt={`${movie.name} movie poster`}
                    className="booking-poster"
                />

                <div className="booking-details">
                    <p className="section-label">YOUR MOVIE</p>

                    <h1>{movie.name}</h1>
                    <p>{movie.genre}</p>
                    <p>★ {movie.rating}/10</p>

                    <p className="booking-price">
                        Price per ticket: ₹{movie.ticketPrice}
                    </p>

                    <section className="booking-section">
                        <h3>1. Select Cinema</h3>

                        <div className="cinema-options">
                            {cinemas.map((cinema) => (
                                <button
                                    key={cinema.id}
                                    type="button"
                                    className={
                                        selectedCinema === cinema.id
                                            ? "cinema-option selected"
                                            : "cinema-option"
                                    }
                                    onClick={() => {
                                        setSelectedCinema(cinema.id);
                                        setSelectedSeats([]);
                                        setBookingError("");
                                    }}
                                >
                                    <strong>{cinema.name}</strong>
                                    <span>{cinema.location}</span>
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="booking-section">
                        <h3>2. Select Date</h3>

                        <input
                            type="date"
                            className="date-input"
                            min={localToday}
                            value={selectedDate}
                            onChange={(event) => {
                                setSelectedDate(event.target.value);
                                setSelectedSeats([]);
                                setBookingError("");
                            }}
                        />
                    </section>

                    <section className="booking-section">
                        <h3>3. Select Showtime</h3>

                        <div className="showtime-options">
                            {showtimes.map((time) => (
                                <button
                                    key={time}
                                    type="button"
                                    className={
                                        selectedShowtime === time
                                            ? "showtime-option selected"
                                            : "showtime-option"
                                    }
                                    onClick={() => {
                                        setSelectedShowtime(time);
                                        setSelectedSeats([]);
                                        setBookingError("");
                                    }}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </section>

                    <section className="booking-section">
                        <h3>4. Select Tickets</h3>

                        <div className="quantity-controls">
                            <button
                                type="button"
                                onClick={decreaseQuantity}
                                disabled={quantity === 1}
                                aria-label="Decrease ticket quantity"
                            >
                                −
                            </button>

                            <span>{quantity}</span>

                            <button
                                type="button"
                                onClick={increaseQuantity}
                                disabled={quantity === 10}
                                aria-label="Increase ticket quantity"
                            >
                                +
                            </button>
                        </div>

                        <p className="quantity-hint">
                            Select between 1 and 10 tickets.
                        </p>
                    </section>

                    <section className="booking-section seat-section">
                        <h3>5. Select Your Seats</h3>
                        
                        {/* Seat availability status */}
                        {!selectedCinema || !selectedDate || !selectedShowtime ? (
                            <p className="quantity-hint">
                                Select a cinema, date, and showtime to check seat availability.
                            </p>
                        ) : loadingSeats ? (
                            <p className="status-message" role="status">
                                Checking seat availability...
                            </p>
                        ) : seatError ? (
                            <p className="status-message" role="alert">
                                {seatError}
                            </p>
                        ) : (
                            <p className="quantity-hint">
                                Seat availability updated.
                            </p>
                        )}

                        <div className="screen">SCREEN</div>

                        <div className="seat-legend">
                            <span>
                                <i className="legend-seat available"></i>
                                Available
                            </span>

                            <span>
                                <i className="legend-seat chosen"></i>
                                Selected
                            </span>

                            <span>
                                <i className="legend-seat occupied"></i>
                                Occupied
                            </span>
                        </div>

                        <div className="seat-layout">
                            {seatRows.map((row) => (
                                <div className="seat-row" key={row}>
                                    <span className="row-label">{row}</span>

                                    {Array.from(
                                        { length: seatsPerRow },
                                        (_, index) => {
                                            const seatId = `${row}-${index + 1}`;

                                            const isOccupied =
                                                occupiedSeats.includes(seatId);

                                            const isSelected =
                                                selectedSeats.includes(seatId);

                                            let seatClass = "seat";

                                            if (isOccupied) {
                                                seatClass += " occupied";
                                            } else if (isSelected) {
                                                seatClass += " selected";
                                            }

                                            return (
                                                <button
                                                    key={seatId}
                                                    type="button"
                                                    className={seatClass}
                                                    disabled={
                                                        isOccupied ||
                                                        loadingSeats ||
                                                        Boolean(seatError) ||
                                                        !selectedCinema ||
                                                        !selectedDate ||
                                                        !selectedShowtime
                                                    }
                                                    aria-label={`Seat ${seatId}`}
                                                    aria-pressed={isSelected}
                                                    onClick={() =>
                                                        toggleSeat(seatId)
                                                    }
                                                >
                                                    {index + 1}
                                                </button>
                                            );
                                        }
                                    )}
                                </div>
                            ))}
                        </div>

                        <p className="seat-count">
                            Selected seats:{" "}
                            {selectedSeats.length > 0
                                ? selectedSeats.join(", ")
                                : "None"}
                        </p>

                        <p className="quantity-hint">
                            Select exactly {quantity} seat(s) to continue.
                        </p>
                    </section>

                    <div className="total-section">
                        <p>Total Price</p>
                        <h2>₹{totalPrice}</h2>
                    </div>

                    <div className="booking-summary">
                        <h3>Booking Summary</h3>

                        <p>
                            <strong>Movie:</strong> {movie.name}
                        </p>

                        <p>
                            <strong>Cinema:</strong>{" "}
                            {cinemas.find(
                                (cinema) => cinema.id === selectedCinema
                            )?.name || "Not selected"}
                        </p>

                        <p>
                            <strong>Date:</strong>{" "}
                            {selectedDate || "Not selected"}
                        </p>

                        <p>
                            <strong>Showtime:</strong>{" "}
                            {selectedShowtime || "Not selected"}
                        </p>

                        <p>
                            <strong>Tickets:</strong> {quantity}
                        </p>

                        <p>
                            <strong>Seats:</strong>{" "}
                            {selectedSeats.length > 0
                                ? selectedSeats.join(", ")
                                : "Not selected"}
                        </p>

                        <p>
                            <strong>Total:</strong> ₹{totalPrice}
                        </p>
                    </div>
{bookingError && (
    <p className="status-message" role="alert">
        {bookingError}
    </p>
)}
                    <button
                        type="button"
                        className="continue-button"
                        disabled={!canContinue || savingBooking}
                        onClick={async () => {
                            const token = sessionStorage.getItem("movietime_token");
                                                
                            // Require login before booking.
                            if (!token) {
                                navigate("/login");
                                return;
                            }
                        
                            const cinema = cinemas.find(
                                (item) => item.id === selectedCinema
                            );
                        
                            if (!cinema) {
                                setBookingError("Please select a valid cinema.");
                                return;
                            }
                        
                            setSavingBooking(true);
                            setBookingError("");
                        
                            try {
                                const bookingData = {
                                    movieId: movie._id,
                                    cinemaName: cinema.name,
                                    date: selectedDate,
                                    showtime: selectedShowtime,
                                    quantity,
                                    seats: selectedSeats
                                };
                            
                                const response = await fetch(
                                    "http://localhost:5000/api/bookings",
                                    {
                                        method: "POST",
                                        headers: {
                                            "Content-Type": "application/json",
                                            Authorization: `Bearer ${token}`
                                        },
                                        body: JSON.stringify(bookingData)
                                    }
                                );
                            
                                const data = await response.json();
                            
                                if (!response.ok) {
                                    throw new Error(
                                        data.message || "Unable to save your booking."
                                    );
                                }
                            
                                navigate("/confirmation", {
                                    state: {
                                        movieId: data.booking.movieId,
                                        movieName: data.booking.movieName,
                                        cinemaName: data.booking.cinemaName,
                                        date: data.booking.bookingDate,
                                        showtime: data.booking.showtime,
                                        quantity: data.booking.quantity,
                                        seats: data.booking.seats,
                                        totalPrice: data.booking.totalPrice,
                                        bookingReference: data.booking.bookingReference,
                                        bookingId: data.booking._id
                                    }
                                });
                            } catch (error) {
                                console.error("Booking error:", error);
                            
                                setBookingError(
                                    error.message || "Something went wrong. Please try again."
                                );
                            } finally {
                                setSavingBooking(false);
                            }
                        }}
                    >
                        {savingBooking
                            ? "Saving Booking..."
                            : "Continue to Booking Confirmation"}
                    </button>
                </div>
            </div>
        </main>
    );
}

export default BookingPage;
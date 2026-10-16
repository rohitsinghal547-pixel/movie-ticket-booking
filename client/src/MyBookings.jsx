import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";

import API_URL from "./api";

function MyBookings() {
    const navigate = useNavigate();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchBookings() {
            const token = sessionStorage.getItem("movietime_token");

            if (!token) {
                navigate("/login", { replace: true });
                return;
            }

            try {
                setLoading(true);
                setError("");

                const response = await fetch(
                    '${API_URL}/api/bookings/my-bookings',
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        },
                        signal: controller.signal
                    }
                );

                const data = await response.json();

                if (response.status === 401) {
                    sessionStorage.removeItem("movietime_token");
                    sessionStorage.removeItem("movietime_user");

                    navigate("/login", { replace: true });
                    return;
                }

                if (!response.ok) {
                    throw new Error(
                        data.message || "Unable to load your bookings."
                    );
                }

                setBookings(data.bookings || []);
            } catch (err) {
                if (err.name !== "AbortError") {
                    console.error("Error fetching bookings:", err);

                    setError(
                        err.message || "Unable to load your bookings."
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setLoading(false);
                }
            }
        }

        fetchBookings();

        return () => controller.abort();
    }, [navigate]);

            async function handleCancelBooking(bookingId) {
                const confirmed = window.confirm(
                  "Are you sure you want to cancel this booking?"
                );
            
                if (!confirmed) return;
            
                const token = sessionStorage.getItem("movietime_token");
            
                if (!token) {
                  navigate("/login");
                  return;
                }
            
                try {
                  const response = await fetch(
                    `${API_URL}/api/bookings/${bookingId}`,
                    {
                      method: "DELETE",
                      headers: {
                        Authorization: `Bearer ${token}`
                      }
                    }
                  );
              
                  const data = await response.json();
              
                  if (!response.ok) {
                    throw new Error(data.message || "Unable to cancel booking.");
                  }
              
                  // Update the booking status on the page immediately
                  setBookings((previousBookings) =>
                    previousBookings.map((booking) =>
                      booking._id === bookingId
                        ? { ...booking, status: "CANCELLED" }
                        : booking
                    )
                  );
              
                  window.alert("Your booking has been cancelled successfully!");
              
                } catch (error) {
                  console.error("Cancellation error:", error);
                    window.alert(error.message || "Something went wrong.");
                  }
                }
    
    return (
        <main className="my-bookings-page">
            <div className="my-bookings-container">
                <Link to="/" className="back-link">
                    ← Back to Movies
                </Link>

                <header className="my-bookings-header">
                    <p className="section-label">YOUR MOVIETIME ACCOUNT</p>
                    <h1>My Bookings</h1>
                    <p>All your movie tickets in one place.</p>
                </header>

                {loading && (
                    <p className="status-message" role="status">
                        Loading your bookings...
                    </p>
                )}

                {!loading && error && (
                    <div className="my-bookings-message" role="alert">
                        <p>{error}</p>

                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                        >
                            Try Again
                        </button>
                    </div>
                )}

                {!loading && !error && bookings.length === 0 && (
                    <div className="my-bookings-empty">
                        <h2>No bookings yet</h2>

                        <p>
                            You haven't booked any movie tickets yet.
                            Find a movie and plan your next cinema visit!
                        </p>

                        <Link to="/" className="explore-button">
                            Explore Movies
                        </Link>
                    </div>
                )}

                {!loading && !error && bookings.length > 0 && (
                    <>
                        <p className="my-bookings-count">
                            {bookings.length} booking
                            {bookings.length !== 1 ? "s" : ""} found
                        </p>

                        <div className="my-bookings-list">
                            {bookings.map((booking) => (
                                <article
                                    className="my-booking-card"
                                    key={booking._id}
                                >
                                    <div className="my-booking-top">
                                        <div>
                                            <p className="section-label">
                                                MOVIE
                                            </p>

                                            <h2>{booking.movieName}</h2>
                                        </div>

                                        <span
                                            className={`booking-status ${
                                                booking.status === "CONFIRMED"
                                                    ? "confirmed"
                                                    : "cancelled"
                                            }`}
                                        >
                                            {booking.status}
                                        </span>

                                        {booking.status === "CONFIRMED" && (
                                        <button
                                            type="button"
                                            onClick={() => handleCancelBooking(booking._id)}
                                            style={{
                                              padding: "10px 16px",
                                              backgroundColor: "#dc2626",
                                              color: "#ffffff",
                                              border: "none",
                                              borderRadius: "8px",
                                              cursor: "pointer",
                                              fontWeight: "600",
                                              marginTop: "12px"
                                            }}
                                        >
                                            Cancel Booking
                                        </button>
                                        )}
                                        
                                    </div>

                                    <div className="my-booking-details">
                                        <div>
                                            <span>Cinema</span>
                                            <strong>{booking.cinemaName}</strong>
                                        </div>

                                        <div>
                                            <span>Date</span>
                                            <strong>{booking.bookingDate}</strong>
                                        </div>

                                        <div>
                                            <span>Showtime</span>
                                            <strong>{booking.showtime}</strong>
                                        </div>

                                        <div>
                                            <span>Tickets</span>
                                            <strong>{booking.quantity}</strong>
                                        </div>

                                        <div>
                                            <span>Seats</span>
                                            <strong>
                                                {booking.seats.join(", ")}
                                            </strong>
                                        </div>

                                        <div>
                                            <span>Total Price</span>
                                            <strong>
                                                ₹{booking.totalPrice}
                                            </strong>
                                        </div>
                                    </div>

                                    <div className="my-booking-reference">
                                        <span>Booking Reference</span>
                                        <strong>
                                            {booking.bookingReference}
                                        </strong>
                                    </div>

                                    <p className="my-booking-created">
                                        Booked on{" "}
                                        {new Date(
                                            booking.createdAt
                                        ).toLocaleDateString("en-IN")}
                                    </p>
                                </article>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}

export default MyBookings;
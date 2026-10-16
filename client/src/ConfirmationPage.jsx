import { Link, useLocation, Navigate } from "react-router-dom";

function ConfirmationPage() {
    const location = useLocation();

    const booking = location.state;

    // If booking details are missing, return to the homepage.
    if (!booking) {
        return <Navigate to="/" replace />;
    }

    return (
        <main className="confirmation-page">
            <div className="confirmation-card">
                <div className="success-icon">✓</div>

                <h1>Booking Confirmed!</h1>

                <p className="confirmation-message">
                    Your booking has been successfully saved.
                </p>

                {/* Booking Reference */}
                <div className="booking-reference">
                    <span>Booking Reference</span>
                    <h2>{booking.bookingReference || "Unavailable"}</h2>
                    <p>Keep this reference for your records.</p>
                </div>

                {/* Booking Details */}
                <div className="confirmation-details">
                    <div className="confirmation-row">
                        <span>Movie</span>
                        <strong>{booking.movieName}</strong>
                    </div>

                    <div className="confirmation-row">
                        <span>Cinema</span>
                        <strong>{booking.cinemaName}</strong>
                    </div>

                    <div className="confirmation-row">
                        <span>Date</span>
                        <strong>{booking.date}</strong>
                    </div>

                    <div className="confirmation-row">
                        <span>Showtime</span>
                        <strong>{booking.showtime}</strong>
                    </div>

                    <div className="confirmation-row">
                        <span>Tickets</span>
                        <strong>{booking.quantity}</strong>
                    </div>

                    <div className="confirmation-row">
                        <span>Seats</span>
                        <strong>
                            {Array.isArray(booking.seats)
                                ? booking.seats.join(", ")
                                : "Unavailable"}
                        </strong>
                    </div>

                    <div className="confirmation-total">
                        <span>Total Price</span>
                        <strong>₹{booking.totalPrice}</strong>
                    </div>
                </div>

                <p className="demo-notice">
                    Your booking details have been saved to our database.
                    Payment processing and confirmed seat reservation are
                    not yet available.
                </p>

                <Link to="/" className="home-button">
                    Back to Home
                </Link>
            </div>
        </main>
    );
}

export default ConfirmationPage;
import { Link } from "react-router-dom";

function MovieCard({ id, name, genre, ticketPrice, poster, rating }) {
    return (
        <article className="movie-card">
            <img
                className="movie-poster"
                src={poster}
                alt={`${name} movie poster`}
                onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src =
                      "https://placehold.co/300x450/151c30/ffffff?text=Movie";
                    }}
            />

            <div className="movie-info">
                <h3>{name}</h3>

                <p className="movie-genre">{genre}</p>

                <p className="movie-rating">
                    ★ {rating}/10
                </p>

                <p className="movie-price">
                    Ticket Price: ₹{ticketPrice}
                </p>

                <Link to={`/book/${id}`} className="book-button">
                    Book Tickets
                </Link>
            </div>
        </article>
    );
}

export default MovieCard;
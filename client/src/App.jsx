import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./App.css";
import MovieCard from "./MovieCard";
import { useAuth } from "./AuthContext.jsx";
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

function App() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchMovies() {
            try {
                const response = await fetch(
                    `${API_URL}/api/movies`
                );

                if (!response.ok) {
                    throw new Error("Failed to fetch movies.");
                }

                const data = await response.json();
                setMovies(data);
            } catch (error) {
                console.error("Error fetching movies:", error);

                setError(
                    "Unable to load movies. Please check that the backend server is running."
                );
            } finally {
                setLoading(false);
            }
        }

        fetchMovies();
    }, []);

    function handleLogout() {
        logout();
        navigate("/");
    }

    const navButtonStyle = {
        display: "inline-block",
        padding: "10px 16px",
        borderRadius: "8px",
        textDecoration: "none",
        fontWeight: "600",
        fontSize: "14px"
    };

    return (
        <div className="app">
            <header className="navbar">
                <h1 className="logo">MovieTime</h1>

                <nav className="nav-links">
                    <a href="#home">Home</a>
                    <a href="#movies">Movies</a>
                    <a href="#footer">About</a>
                </nav>

                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "12px"
                    }}
                >
                    {user ? (
                        <>
                            <span
                                style={{
                                    color: "#ffffff",
                                    fontSize: "14px"
                                }}
                            >
                                Hi, {user.name}
                            </span>

                            <Link
                                to="/my-bookings"
                                style={{
                                    display: "inline-block",
                                    padding: "10px 16px",
                                    borderRadius: "8px",
                                    color: "#ffffff",
                                    border: "1px solid #475569",
                                    textDecoration: "none",
                                    fontSize: "14px",
                                    fontWeight: "600"
                                }}
                            >
                                My Bookings
                            </Link>

                            <button
                                type="button"
                                onClick={handleLogout}
                                style={{
                                    ...navButtonStyle,
                                    border: "1px solid #f84464",
                                    background: "transparent",
                                    color: "#ffffff",
                                    cursor: "pointer"
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <>
                            <Link
                                to="/login"
                                style={{
                                    ...navButtonStyle,
                                    color: "#ffffff",
                                    border: "1px solid #475569"
                                }}
                            >
                                Log In
                            </Link>

                            <Link
                                to="/register"
                                style={{
                                    ...navButtonStyle,
                                    background: "#f84464",
                                    color: "#ffffff"
                                }}
                            >
                                Register
                            </Link>
                        </>
                    )}
                </div>
            </header>

            <main>
                <section className="hero" id="home">
                    <p className="hero-label">
                        YOUR NEXT CINEMA EXPERIENCE
                    </p>

                    <h2>
                        Discover Your Next <span>Movie</span>
                    </h2>

                    <p className="hero-description">
                        Explore incredible stories and find your
                        next favourite movie.
                    </p>

                    <a href="#movies" className="explore-button">
                        Explore Movies
                    </a>
                </section>

                <section className="movies-section" id="movies">
                    <div className="section-heading">
                        <div>
                            <p className="section-label">
                                HANDPICKED FOR YOU
                            </p>

                            <h2>Now Showing</h2>
                        </div>

                        <p className="movie-count">
                            {movies.length} movies
                        </p>
                    </div>

                    {loading && (
                        <p className="status-message">
                            Loading movies...
                        </p>
                    )}

                    {error && (
                        <p className="status-message">
                            {error}
                        </p>
                    )}

                    {!loading && !error && movies.length === 0 && (
                        <p className="status-message">
                            No movies are currently available.
                        </p>
                    )}

                    <div className="movie-grid">
                        {movies.map((movie) => {
                        const details = movieDetails[movie.name] || {};
                            return (
                                <MovieCard
                                    key={movie._id}
                                    id={movie._id}
                                    name={movie.name}
                                    genre={movie.genre || details.genre || "Genre unavailable"}
                                rating={movie.rating ?? details.rating ?? 0}
                                poster={movie.poster || details.poster || "https://placehold.co/300x450?text=Movie"}
                                    ticketPrice={movie.ticketPrice}
                                />
                            );
                        })}
                    </div>
                </section>
            </main>

            <footer id="footer" className="footer">
                <p>
                    © 2026 MovieTime. Made for movie lovers.
                </p>
            </footer>
        </div>
    );
}

export default App;
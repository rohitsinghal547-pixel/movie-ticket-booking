import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import API_URL from "./api";

const API_URL = "http://localhost:5000/api";

const EMPTY_FORM = {
    name: "",
    genre: "",
    rating: "",
    ticketPrice: "",
    poster: ""
};

const FALLBACK_POSTER =
    "https://placehold.co/300x450/151c30/ffffff?text=Poster+Unavailable";

function AdminDashboard() {
    const { token, user } = useAuth();

    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState(EMPTY_FORM);
    const [editingMovieId, setEditingMovieId] = useState(null);

    async function loadMovies() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_URL}/movies`);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to load movies."
                );
            }

            setMovies(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        loadMovies();
    }, []);

    function handleChange(event) {
        const { name, value } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: value
        }));
    }

    function resetForm() {
        setForm(EMPTY_FORM);
        setEditingMovieId(null);
    }

    function handleEdit(movie) {
        setEditingMovieId(movie._id);

        setForm({
            name: movie.name || "",
            genre: movie.genre || "",
            rating: String(movie.rating ?? ""),
            ticketPrice: String(movie.ticketPrice ?? ""),
            poster: movie.poster || ""
        });

        setError("");
        setMessage("");

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }

    async function handleSubmit(event) {
        event.preventDefault();

        setError("");
        setMessage("");
        setSubmitting(true);

        try {
            const isEditing = Boolean(editingMovieId);

            const url = isEditing
                ? `${API_URL}/movies/${editingMovieId}`
                : `${API_URL}/movies`;

            const response = await fetch(url, {
                method: isEditing ? "PUT" : "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: form.name.trim(),
                    genre: form.genre.trim(),
                    rating: Number(form.rating),
                    ticketPrice: Number(form.ticketPrice),
                    poster: form.poster.trim()
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message ||
                    `Unable to ${isEditing ? "update" : "add"} movie.`
                );
            }

            setMessage(
                isEditing
                    ? "Movie updated successfully!"
                    : "Movie added successfully!"
            );

            resetForm();

            await loadMovies();
        } catch (err) {
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    }

    async function handleDelete(movieId, movieName) {
        const confirmed = window.confirm(
            `Are you sure you want to delete "${movieName}"?`
        );

        if (!confirmed) {
            return;
        }

        setError("");
        setMessage("");

        try {
            const response = await fetch(
                `${API_URL}/movies/${movieId}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Unable to delete movie."
                );
            }

            setMessage("Movie deleted successfully!");

            if (editingMovieId === movieId) {
                resetForm();
            }

            await loadMovies();
        } catch (err) {
            setError(err.message);
        }
    }

    return (
        <div className="admin-page">
            <style>{`
                .admin-page {
                    min-height: 100vh;
                    padding: 32px 20px;
                    background: #0b1020;
                    color: #ffffff;
                }

                .admin-container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .admin-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 16px;
                    flex-wrap: wrap;
                    margin-bottom: 32px;
                }

                .admin-muted {
                    color: #aab4cc;
                }

                .admin-panel {
                    background: #151c30;
                    padding: 24px;
                    border-radius: 12px;
                    margin-bottom: 32px;
                }

                .admin-form {
                    display: grid;
                    grid-template-columns:
                        repeat(auto-fit, minmax(220px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                }

                .admin-input {
                    width: 100%;
                    min-width: 0;
                    box-sizing: border-box;
                    padding: 12px;
                    border: 1px solid #374151;
                    border-radius: 8px;
                    background: #0b1020;
                    color: #ffffff;
                    font-size: 15px;
                }

                .admin-button {
                    border: none;
                    border-radius: 8px;
                    padding: 11px 15px;
                    color: #ffffff;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                }

                .admin-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .admin-primary {
                    background: #f84464;
                }

                .admin-edit {
                    background: #2563eb;
                }

                .admin-delete {
                    background: #dc2626;
                }

                .admin-secondary {
                    background: #475569;
                }

                .admin-home {
                    display: inline-block;
                    color: #ffffff;
                    text-decoration: none;
                    border: 1px solid #475569;
                    border-radius: 8px;
                    padding: 10px 16px;
                }

                .admin-status {
                    padding: 12px;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    overflow-wrap: anywhere;
                }

                .admin-error {
                    background: #451a1a;
                    color: #fecaca;
                }

                .admin-success {
                    background: #14532d;
                    color: #bbf7d0;
                }

                .admin-movie-grid {
                    display: grid;
                    grid-template-columns:
                        repeat(auto-fit, minmax(230px, 1fr));
                    gap: 24px;
                    margin-top: 20px;
                }

                .admin-movie-card {
                    min-width: 0;
                    background: #151c30;
                    padding: 16px;
                    border-radius: 12px;
                    overflow: hidden;
                }

                .admin-poster {
                    display: block;
                    width: 100%;
                    height: 300px;
                    object-fit: contain;
                    background: #080c17;
                    border-radius: 8px;
                }

                .admin-movie-card h3 {
                    overflow-wrap: anywhere;
                }

                .admin-movie-card p {
                    overflow-wrap: anywhere;
                }

                .admin-card-actions {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 16px;
                }

                @media (max-width: 600px) {
                    .admin-page {
                        padding: 20px 12px;
                    }

                    .admin-panel {
                        padding: 16px;
                    }

                    .admin-poster {
                        height: 260px;
                    }
                }
            `}</style>

            <div className="admin-container">
                <header className="admin-header">
                    <div>
                        <h1>Admin Dashboard</h1>

                        <p className="admin-muted">
                            Welcome, {user?.name || "Admin"}
                        </p>
                    </div>

                    <Link to="/" className="admin-home">
                        Back to Home
                    </Link>
                </header>

                {error && (
                    <div
                        className="admin-status admin-error"
                        role="alert"
                    >
                        {error}
                    </div>
                )}

                {message && (
                    <div
                        className="admin-status admin-success"
                        role="status"
                    >
                        {message}
                    </div>
                )}

                <section className="admin-panel">
                    <h2>
                        {editingMovieId ? "Edit Movie" : "Add a Movie"}
                    </h2>

                    <form
                        className="admin-form"
                        onSubmit={handleSubmit}
                    >
                        <input
                            className="admin-input"
                            name="name"
                            placeholder="Movie name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            maxLength={150}
                        />

                        <input
                            className="admin-input"
                            name="genre"
                            placeholder="Genre"
                            value={form.genre}
                            onChange={handleChange}
                            required
                            maxLength={100}
                        />

                        <input
                            className="admin-input"
                            name="rating"
                            type="number"
                            placeholder="Rating (0–10)"
                            value={form.rating}
                            onChange={handleChange}
                            min="0"
                            max="10"
                            step="0.1"
                            required
                        />

                        <input
                            className="admin-input"
                            name="ticketPrice"
                            type="number"
                            placeholder="Ticket price (₹)"
                            value={form.ticketPrice}
                            onChange={handleChange}
                            min="1"
                            step="1"
                            required
                        />

                        <input
                            className="admin-input"
                            name="poster"
                            type="url"
                            placeholder="Poster image URL"
                            value={form.poster}
                            onChange={handleChange}
                            required
                        />

                        <button
                            className="admin-button admin-primary"
                            type="submit"
                            disabled={submitting}
                        >
                            {submitting
                                ? "Saving..."
                                : editingMovieId
                                    ? "Save Changes"
                                    : "Add Movie"}
                        </button>

                        {editingMovieId && (
                            <button
                                className="admin-button admin-secondary"
                                type="button"
                                onClick={resetForm}
                                disabled={submitting}
                            >
                                Cancel Editing
                            </button>
                        )}
                    </form>

                    <p className="admin-muted">
                        Poster tip: use a direct image URL ending in
                        .jpg, .jpeg, .png, or .webp when possible.
                        Some image hosts block external embedding.
                    </p>
                </section>

                <section>
                    <h2>Manage Movies</h2>

                    {loading && <p>Loading movies...</p>}

                    {!loading && movies.length === 0 && (
                        <p>No movies found.</p>
                    )}

                    <div className="admin-movie-grid">
                        {movies.map((movie) => (
                            <article
                                className="admin-movie-card"
                                key={movie._id}
                            >
                                <img
                                    className="admin-poster"
                                    src={movie.poster || FALLBACK_POSTER}
                                    alt={`${movie.name} poster`}
                                    onError={(event) => {
                                        event.currentTarget.onerror = null;
                                        event.currentTarget.src =
                                            FALLBACK_POSTER;
                                    }}
                                />

                                <h3>{movie.name}</h3>

                                <p>{movie.genre}</p>

                                <p>
                                    Rating: {movie.rating}/10
                                </p>

                                <p>
                                    Ticket price: ₹{movie.ticketPrice}
                                </p>

                                <div className="admin-card-actions">
                                    <button
                                        className="admin-button admin-edit"
                                        type="button"
                                        onClick={() => handleEdit(movie)}
                                    >
                                        Edit Movie
                                    </button>

                                    <button
                                        className="admin-button admin-delete"
                                        type="button"
                                        onClick={() =>
                                            handleDelete(
                                                movie._id,
                                                movie.name
                                            )
                                        }
                                    >
                                        Delete Movie
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}

export default AdminDashboard;
// 1. Store our movie data

const movies = [
    {
        id: 1,
        name: "Interstellar",
        genre: "Sci-Fi | Adventure",
        rating: 8.7,
        ticketPrice: 250,
        poster: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg"
    },
    {
        id: 2,
        name: "Oppenheimer",
        genre: "Drama | History",
        rating: 8.3,
        ticketPrice: 220,
        poster: "https://image.tmdb.org/t/p/w500/ptpr0kGAckfQkJeJIt8st5dglvd.jpg"
    },
    {
        id: 3,
        name: "Avengers: Endgame",
        genre: "Action | Adventure",
        rating: 8.4,
        ticketPrice: 280,
        poster: "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg"
    },
    {
        id: 4,
        name: "Parasite",
        genre: "Thriller | Drama",
        rating: 8.5,
        ticketPrice: 200,
        poster: "https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg"
    }
];


// 2. Find the movie container in HTML

const movieGrid = document.querySelector("#movie-grid");


// 3. Generate and display the movie cards

function displayMovies() {

    movieGrid.innerHTML = "";

    movies.forEach(function(movie) {

        const movieCard = `
            <article class="movie-card">

                <img
                    src="${movie.poster}"
                    alt="${movie.name} movie poster"
                >

                <div class="movie-info">

                    <h3>${movie.name}</h3>

                    <p>${movie.genre}</p>

                    <p class="rating">
                        ★ ${movie.rating}/10
                    </p>

                    <p>
                        Ticket Price: ₹${movie.ticketPrice}
                    </p>

                    <button
                        type="button"
                        class="book-button"
                        data-movie-id="${movie.id}"
                    >
                        Book Tickets
                    </button>

                </div>

            </article>
        `;

        movieGrid.insertAdjacentHTML("beforeend", movieCard);

    });

}


// 4. Handle booking-button clicks

movieGrid.addEventListener("click", function(event) {

    const button = event.target.closest(".book-button");

    if (!button) {
        return;
    }

    const movieId = Number(button.dataset.movieId);

    const selectedMovie = movies.find(function(movie) {
        return movie.id === movieId;
    });

    if (selectedMovie) {
        alert(
            "You selected: " + selectedMovie.name +
            "\nTicket Price: ₹" + selectedMovie.ticketPrice
        );
    }

});


// 5. Display movies when the page loads

displayMovies();
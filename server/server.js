require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Booking = require("./models/Booking");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

const app = express();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`MovieTime server running on port ${PORT}`);
});

const authMiddleware = require("./middleware/authMiddleware");
const adminMiddleware = require("./middleware/adminMiddleware");

// Middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://movie-ticket-booking-eight-snowy.vercel.app"
  ]
}));

function isValidDate(date) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return false;
    }

    const parsedDate = new Date(`${date}T00:00:00.000Z`);

    return !Number.isNaN(parsedDate.getTime()) &&
        parsedDate.toISOString().slice(0, 10) === date;
}

function isFutureOrToday(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const bookingDate = new Date(`${date}T00:00:00`);

    return bookingDate >= today;
}

app.use(express.json());

// Movie schema
const movieSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true
        },
        genre: {
            type: String,
            required: true
        },
        rating: {
            type: Number,
            default: 0
        },
        ticketPrice: {
            type: Number,
            required: true
        },
        poster: {
            type: String,
            default: ""
        }
    },
    {
        timestamps: true
    }
);

// Movie model
const Movie = mongoose.model("Movie", movieSchema);

// Home route
app.get("/", (req, res) => {
    res.send("MovieTime API is running!");
});

// Get all movies
app.get("/api/movies", async (req, res) => {
    try {
        const movies = await Movie.find().sort({ name: 1 });

        res.json(movies);
    } catch (error) {
        console.error("Error fetching movies:", error.message);

        res.status(500).json({
            message: "Failed to fetch movies"
        });
    }
});

// Get one movie
app.get("/api/movies/:id", async (req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found"
            });
        }

        res.json(movie);
    } catch (error) {
        res.status(400).json({
            message: "Invalid movie ID"
        });
    }
});

// Get occupied seats for a specific movie screening
app.get("/api/bookings/occupied-seats", async (req, res) => {
    try {
        const { movieId, cinemaName, date, showtime } = req.query;

        const validCinemas = [
            "PVR Cinemas",
            "INOX",
            "Cinepolis"
        ];

        const validShowtimes = [
            "10:00 AM",
            "1:30 PM",
            "6:00 PM",
            "9:30 PM"
        ];

        // Validate the screening details
        if (
            !movieId ||
            !mongoose.isValidObjectId(movieId) ||
            !validCinemas.includes(cinemaName) ||
            typeof date !== "string" ||
            !isValidDate(date) ||
            !isFutureOrToday(date) ||
            !validShowtimes.includes(showtime)
        ) {
            return res.status(400).json({
                message: "Invalid screening details."
            });
        }

        // Verify that the movie exists
        const movie = await Movie.findById(movieId);

        if (!movie) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }

        // Find confirmed bookings for this exact screening
        const bookings = await Booking.find({
            movieId: movie._id,
            cinemaName,
            bookingDate: date,
            showtime,
            status: "CONFIRMED"
        }).select("seats");

        // Combine the seats from all matching bookings
        const occupiedSeats = [
            ...new Set(
                bookings.flatMap((booking) => booking.seats)
            )
        ];

        return res.json({ occupiedSeats });
    } catch (error) {
        console.error("Error fetching occupied seats:", error);

        return res.status(500).json({
            message: "Unable to fetch occupied seats."
        });
    }
});

// Get bookings belonging to the logged-in user
app.get("/api/bookings/my-bookings", authMiddleware, async (req, res) => {
    try {
        const bookings = await Booking.find({
            userId: req.user.userId
        }).sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Bookings retrieved successfully.",
            bookings
        });
    } catch (error) {
        console.error("Error fetching user bookings:", error);

        return res.status(500).json({
            message: "Unable to fetch your bookings."
        });
    }
});

// Cancel a booking belonging to the logged-in user
app.delete("/api/bookings/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Find the booking and verify that it belongs to this user
    const booking = await Booking.findOne({
      _id: id,
      userId: req.user.userId
    });

    // Booking not found or does not belong to this user
    if (!booking) {
      return res.status(404).json({
        message: "Booking not found."
      });
    }

    // Prevent cancelling an already cancelled booking
    if (booking.status === "CANCELLED") {
      return res.status(400).json({
        message: "This booking has already been cancelled."
      });
    }

    // Update the booking status
    booking.status = "CANCELLED";

    await booking.save();

    return res.status(200).json({
      message: "Booking cancelled successfully.",
      booking
    });

  } catch (error) {
    console.error("Error cancelling booking:", error);

    return res.status(500).json({
      message: "Unable to cancel the booking."
    });
  }
});

// Add a movie - Admin only
app.post(
    "/api/movies",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { name, genre, rating, ticketPrice, poster } = req.body;

            // Validate movie details
            if (
                typeof name !== "string" ||
                !name.trim() ||
                typeof genre !== "string" ||
                !genre.trim() ||
                typeof ticketPrice !== "number" ||
                !Number.isFinite(ticketPrice) ||
                ticketPrice <= 0 ||
                (rating !== undefined &&
                    (typeof rating !== "number" ||
                     !Number.isFinite(rating) ||
                     rating < 0 ||
                     rating > 10)) ||
                (poster !== undefined && typeof poster !== "string")
            ) {
                return res.status(400).json({
                    message: "Please provide valid movie details."
                });
            }

            const movie = await Movie.create({
                name: name.trim(),
                genre: genre.trim(),
                rating: rating ?? 0,
                ticketPrice,
                poster: poster ?? ""
            });

            return res.status(201).json({
                message: "Movie added successfully!",
                movie
            });

        } catch (error) {
            console.error("Error adding movie:", error);

            return res.status(500).json({
                message: "Unable to add movie."
            });
        }
    }
);

// Update a movie - Admin only
app.put(
    "/api/movies/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    message: "Invalid movie ID."
                });
            }

            const allowedFields = [
                "name",
                "genre",
                "rating",
                "ticketPrice",
                "poster"
            ];

            const updates = {};

            for (const field of allowedFields) {
                if (Object.prototype.hasOwnProperty.call(req.body, field)) {
                    updates[field] = req.body[field];
                }
            }

            if (Object.keys(updates).length === 0) {
                return res.status(400).json({
                    message: "No valid movie fields provided."
                });
            }

            if (
                (updates.name !== undefined &&
                    (typeof updates.name !== "string" ||
                     !updates.name.trim())) ||
                (updates.genre !== undefined &&
                    (typeof updates.genre !== "string" ||
                     !updates.genre.trim())) ||
                (updates.rating !== undefined &&
                    (typeof updates.rating !== "number" ||
                     !Number.isFinite(updates.rating) ||
                     updates.rating < 0 ||
                     updates.rating > 10)) ||
                (updates.ticketPrice !== undefined &&
                    (typeof updates.ticketPrice !== "number" ||
                     !Number.isFinite(updates.ticketPrice) ||
                     updates.ticketPrice <= 0)) ||
                (updates.poster !== undefined &&
                    typeof updates.poster !== "string")
            ) {
                return res.status(400).json({
                    message: "Invalid movie details."
                });
            }

            if (updates.name !== undefined) {
                updates.name = updates.name.trim();
            }

            if (updates.genre !== undefined) {
                updates.genre = updates.genre.trim();
            }

            const movie = await Movie.findByIdAndUpdate(
                id,
                { $set: updates },
                {
                    new: true,
                    runValidators: true
                }
            );

            if (!movie) {
                return res.status(404).json({
                    message: "Movie not found."
                });
            }

            return res.status(200).json({
                message: "Movie updated successfully!",
                movie
            });

        } catch (error) {
            console.error("Error updating movie:", error);

            return res.status(500).json({
                message: "Unable to update movie."
            });
        }
    }
);

// Delete a movie - Admin only
app.delete(
    "/api/movies/:id",
    authMiddleware,
    adminMiddleware,
    async (req, res) => {
        try {
            const { id } = req.params;

            if (!mongoose.isValidObjectId(id)) {
                return res.status(400).json({
                    message: "Invalid movie ID."
                });
            }

            const movie = await Movie.findById(id);

            if (!movie) {
                return res.status(404).json({
                    message: "Movie not found."
                });
            }

            // Protect booking history
            const existingBooking = await Booking.exists({
                movieId: movie._id
            });

            if (existingBooking) {
                return res.status(409).json({
                    message:
                        "This movie has booking history and cannot be deleted."
                });
            }

            await Movie.deleteOne({
                _id: movie._id
            });

            return res.status(200).json({
                message: "Movie deleted successfully!"
            });

        } catch (error) {
            console.error("Error deleting movie:", error);

            return res.status(500).json({
                message: "Unable to delete movie."
            });
        }
    }
);

// Register a new user
app.post("/api/auth/register", async (req, res) => {
    try {
        const name =
            typeof req.body.name === "string"
                ? req.body.name.trim()
                : "";

        const email =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const password = req.body.password;

        // Validate the submitted information
        if (
            name.length < 2 ||
            name.length > 60 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
            typeof password !== "string" ||
            password.length < 8 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message:
                    "Enter a valid name and email. Your password must contain at least 8 characters."
            });
        }

        // Check whether the email is already registered
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        // Hash the password before saving it
        const passwordHash = await bcrypt.hash(password, 12);

        const user = await User.create({
            name,
            email,
            passwordHash
        });

        // Generate an authentication token
        const token = jwt.sign(
            {
                userId: user._id.toString()
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.status(201).json({
            message: "Registration successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        // Handle a duplicate email created by simultaneous requests
        if (error.code === 11000) {
            return res.status(409).json({
                message: "An account with this email already exists."
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Unable to register. Please try again."
        });
    }
});

// Log in an existing user
app.post("/api/auth/login", async (req, res) => {
    try {
        const email =
            typeof req.body.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        const password = req.body.password;

        if (
            !email ||
            typeof password !== "string" ||
            password.length === 0 ||
            Buffer.byteLength(password, "utf8") > 72
        ) {
            return res.status(400).json({
                message: "Please enter your email and password."
            });
        }

        // Explicitly request the password hash
        const user = await User.findOne({ email }).select("+passwordHash");

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Compare the submitted password with the stored hash
        const passwordMatches = await bcrypt.compare(
            password,
            user.passwordHash
        );

        if (!passwordMatches) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Generate a new token after successful login
        const token = jwt.sign(
            {
                userId: user._id.toString()
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        return res.json({
            message: "Login successful!",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role || "USER"
            }
        });
    } catch (error) {
        console.error("Login error:", error);

        return res.status(500).json({
            message: "Unable to log in. Please try again."
        });
    }
});

// Create a new booking
app.post("/api/bookings", authMiddleware, async (req, res) => {    
    try {
        const {
            movieId,
            cinemaName,
            date,
            showtime,
            quantity,
            seats
        } = req.body;

        // Validate required fields
        if (
            !movieId ||
            typeof cinemaName !== "string" ||
            !["PVR Cinemas", "INOX", "Cinepolis"].includes(cinemaName) ||
            typeof date !== "string" ||
            !isValidDate(date) ||
            !isFutureOrToday(date) ||
            typeof showtime !== "string" ||
            !["10:00 AM", "1:30 PM", "6:00 PM", "9:30 PM"].includes(showtime) ||
            !Number.isInteger(quantity) ||
            quantity < 1 ||
            quantity > 10 ||
            !Array.isArray(seats) ||
            seats.length !== quantity ||
            new Set(seats).size !== seats.length ||
            !seats.every(seat => /^[A-E]-[1-8]$/.test(seat))
        ) {
            return res.status(400).json({
                message: "Invalid booking details."
            });
        }

        // Validate MongoDB movie ID
        if (!mongoose.isValidObjectId(movieId)) {
            return res.status(400).json({
                message: "Invalid movie ID."
            });
        }

        // Find the movie in MongoDB
        const movie = await Movie.findById(movieId);
        if (!movie) {
            return res.status(404).json({
                message: "Movie not found."
            });
        }

        // Check whether any selected seats are already booked
        const existingBooking = await Booking.findOne({
            movieId: movie._id,
            cinemaName,
            bookingDate: date,
            showtime,
            status: "CONFIRMED",
            seats: { $in: seats }
        });
        
        if (existingBooking) {
            const conflictingSeats = existingBooking.seats.filter(
                seat => seats.includes(seat)
            );
        
            return res.status(409).json({
                message: "Some selected seats are no longer available.",
                occupiedSeats: conflictingSeats
            });
        }

        // Calculate the price on the server
        const totalPrice = movie.ticketPrice * quantity;

        // Generate a unique booking reference
        const bookingReference =
            "MT-" + require("crypto").randomBytes(4).toString("hex").toUpperCase();

        // Save booking in MongoDB
        const booking = await Booking.create({
            userId: req.user.userId,
            bookingReference,
            movieId: movie._id,
            movieName: movie.name,
            cinemaName,
            bookingDate: date,
            showtime,
            quantity,
            seats,
            totalPrice
        });

        return res.status(201).json({
            message: "Booking saved successfully!",
            booking
        });
    } catch (error) {
        // MongoDB error code 11000 means a unique index was violated.
        if (error?.code === 11000 && error?.keyPattern?.seats) {
            return res.status(409).json({
                message:
                    "One or more selected seats have just been booked. Please refresh seat availability and choose different seats."
            });
        }
    
        console.error("Create booking error:", error);
    
        return res.status(500).json({   
        message: "Unable to save booking."
        });
    }
});

// Connect to MongoDB and start server
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI is missing from the .env file");
        }

        if (
            !process.env.JWT_SECRET ||
            process.env.JWT_SECRET.length < 32
        ) {
            throw new Error(
                "JWT_SECRET must be set to a secret of at least 32 characters."
            );
        }

        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "movietime",
            serverSelectionTimeoutMS: 15000
        });

        console.log("MongoDB connected successfully!");

        // Ensure the booking indexes exist before accepting requests.
        await Booking.init();

        console.log("Booking indexes ready!");
        await User.init();

        console.log("User indexes ready!");

        // Insert sample movies if the collection is empty
        const movieCount = await Movie.countDocuments();

        if (movieCount === 0) {
            await Movie.insertMany([
                {
                    name: "Interstellar",
                    genre: "Sci-Fi",
                    rating: 8.7,
                    ticketPrice: 250,
                    poster: ""
                },
                {
                    name: "Oppenheimer",
                    genre: "Biography",
                    rating: 8.3,
                    ticketPrice: 220,
                    poster: ""
                },
                {
                    name: "Avengers: Endgame",
                    genre: "Action",
                    rating: 8.4,
                    ticketPrice: 200,
                    poster: ""
                },
                {
                    name: "Parasite",
                    genre: "Thriller",
                    rating: 8.5,
                    ticketPrice: 180,
                    poster: ""
                }
            ]);

            console.log("Sample movies inserted successfully!");
        }

        app.listen(PORT, () => {
            console.log(
                `MovieTime server running on http://localhost:${PORT}`
            );
        });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);

        process.exit(1);
    }
}

startServer();
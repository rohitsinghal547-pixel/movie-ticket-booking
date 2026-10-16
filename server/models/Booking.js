const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        // The user who made this booking
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true
        },

        bookingReference: {
            type: String,
            required: true,
            unique: true
        },

        movieId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Movie",
            required: true
        },

        movieName: {
            type: String,
            required: true
        },

        cinemaName: {
            type: String,
            required: true
        },

        bookingDate: {
            type: String,
            required: true
        },

        showtime: {
            type: String,
            required: true
        },

        quantity: {
            type: Number,
            required: true,
            min: 1,
            max: 10
        },

        seats: {
            type: [String],
            required: true,
            validate: {
                validator: function (seats) {
                    return (
                        seats.length === this.quantity &&
                        new Set(seats).size === seats.length
                    );
                },
                message:
                    "The number of unique seats must match the ticket quantity."
            }
        },

        totalPrice: {
            type: Number,
            required: true,
            min: 0
        },

        status: {
            type: String,
            enum: ["CONFIRMED", "CANCELLED"],
            default: "CONFIRMED"
        }
    },
    {
        timestamps: true
    }
);

// Prevent the same seat from being confirmed twice
// for the same movie screening.
bookingSchema.index(
    {
        movieId: 1,
        cinemaName: 1,
        bookingDate: 1,
        showtime: 1,
        seats: 1
    },
    {
        unique: true,
        partialFilterExpression: {
            status: "CONFIRMED"
        },
        name: "unique_confirmed_seat_per_screening"
    }
);

module.exports = mongoose.model("Booking", bookingSchema);
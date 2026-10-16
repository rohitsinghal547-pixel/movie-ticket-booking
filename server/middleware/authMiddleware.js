const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Please log in to continue."
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userId) {
            return res.status(401).json({
                message: "Invalid authentication token."
            });
        }

        // Retrieve the user's current information from MongoDB.
        const user = await User.findById(decoded.userId).select("role");

        if (!user) {
            return res.status(401).json({
                message: "User account not found."
            });
        }

        // Attach the verified user's ID and role to the request.
        req.user = {
            userId: user._id.toString(),
            role: user.role || "USER"
        };

        next();

    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "Your session has expired. Please log in again."
            });
        }

        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TypeError"
        ) {
            return res.status(401).json({
                message: "Your session is invalid. Please log in again."
            });
        }

        console.error("Authentication error:", error);

        return res.status(500).json({
            message: "Authentication failed due to a server error."
        });
    }
}

module.exports = authMiddleware;
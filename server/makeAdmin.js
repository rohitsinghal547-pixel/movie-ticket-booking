require("dotenv").config();

const mongoose = require("mongoose");
const User = require("./models/User");

async function makeAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            dbName: "movietime"
        });

        const email = "rohitsinghal547@gmail.com";

        const user = await User.findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            console.log("User not found.");
            return;
        }

        user.role = "ADMIN";
        await user.save();

        console.log("Admin role assigned successfully!");
        console.log("Email:", user.email);
        console.log("Role:", user.role);

    } catch (error) {
        console.error("Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

makeAdmin();
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../database");

// User Registration
router.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate inputs
    if (!name || !email || !password || !role) {
        return res.status(400).json({ error: "All fields are required." });
    }

    //bycrpt password hashing
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run("INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)", 
        [name, email, hashedPassword, role], (err) => {
            if (err) {
                // Log the error for debugging
                console.error("Error inserting user:", err.message);
                return res.status(400).json({ error: "User already exists or invalid data." });
            }
            // User registration successful
            res.json({ message: "User registered successfully" });
        });
});



//User Login    
router.post("/login", (req, res) => {
    // Validate request body
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required." });
    }

    // Query the database for the user
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
        if (err) {
            console.error("Database error:", err.message);
            return res.status(500).json({ error: "Database error." });
        }
        // Check if user exists and password matches
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Compare the provided password with the hashed password in the database
        // Use bcrypt to compare the password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: "Invalid credentials." });
        }

        // Generate JWT token   
        // Ensure JWT_SECRET is set in your environment variables
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET || "your_jwt_secret",
            { expiresIn: "1h" }
        );

        // Respond with the token and user details
        res.json({ token, role: user.role, username: user.name, user_id: user.id });
    });
});

//  Ensure router is correctly exported
module.exports = router;

import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", isAuthenticated, (req, res) => {
    res.json({ user: req.session.user });
});

router.post("/profile/update", isAuthenticated, async (req, res) => {
    const { name, email, password } = req.body;
    const userId = req.session.user.id; // Fix: Extract from session

    try {
        let query = "UPDATE users SET name = $1, email = $2 WHERE id = $3";
        let values = [name, email, userId];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = "UPDATE users SET name = $1, email = $2, password = $3 WHERE id = $4";
            values = [name, email, hashedPassword, userId];
        }

        // Update the database and get the updated user data
        const { rows } = await pool.query(query, values);
        const updatedUser = rows[0];

        // Update the session with new user details
        req.session.user = updatedUser;
        req.session.save(); // Save the session update

        res.json({ message: "Profile updated successfully!", user: updatedUser });

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});



export default router; 
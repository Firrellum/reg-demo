import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/profile", isAuthenticated, (req, res) => {
    res.json({ user: req.session.user });
});

router.post("/profile/update", isAuthenticated, async (req, res) => {
    const { name, email, password, color} = req.body;
    const userId = req.session.user.id; // Get user ID from session
    const colorId = req.session.user.color; // Get user color from session

    let usedColor = color;

    if (color != colorId){
        usedColor = color;
    }

    try {
        let query = "UPDATE users SET name = $1, email = $2, color = $3 WHERE id = $4 RETURNING id, name, email, color";
        let values = [name, email, colorId, userId];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = "UPDATE users SET name = $1, email = $2, password = $3, color = $4 WHERE id = $5 RETURNING id, name, email, color";
            values = [name, email, hashedPassword, usedColor, userId];
        }

        // Update the database and get the updated user data
        const { rows } = await pool.query(query, values);
        const updatedUser = rows[0];

        // Regenerate session and update with new user details
        req.session.regenerate((err) => {
            if (err) {
                console.error("Session regeneration error:", err);
                return res.status(500).json({ error: "Session error" });
            }

            req.session.user = updatedUser;
            req.session.save((err) => {
                if (err) {
                    console.error("Session save error:", err);
                    return res.status(500).json({ error: "Session save error" });
                }
                res.json({ message: "Profile updated successfully!", user: updatedUser });
            });
        });

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
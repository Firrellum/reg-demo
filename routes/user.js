import express from "express";
import bcrypt from "bcryptjs";
import pool from "../db.js";
import { isAuthenticated } from "../middlewares/authMiddleware.js";
import { getEmail, transporter } from "./auth.js";
import crypto from "crypto";


const router = express.Router();

router.get("/profile", isAuthenticated, (req, res) => {
    res.json({ user: req.session.user });
});

router.post("/profile/update", isAuthenticated, async (req, res) => {
    const { name, email, password, color } = req.body;
    const userId = req.session.user.id;
    const currentEmail = req.session.user.email;

    const colorId = req.session.user.color; // Get user color from session
    let usedColor = color;

    if (color != colorId){
        usedColor = color;
    }

    try {
        let query = "UPDATE users SET name = $1, color = $2 WHERE id = $3 RETURNING id, name, email, color";
        let values = [name, color, userId];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query = "UPDATE users SET name = $1, password = $2, color = $3 WHERE id = $4 RETURNING id, name, email, color";
            values = [name, hashedPassword, color, userId];
        }

        if (email !== currentEmail) {
            const verificationToken = crypto.randomBytes(32).toString("hex");
            const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

            query = "UPDATE users SET name = $1, color = $2, verification_token = $3, verification_expiry = $4, email = $5 WHERE id = $6 RETURNING id, name, email, color";
            values = [name, color, verificationToken, verificationExpiry, email, userId];

            const verificationLink = `http://localhost:3000/verify.html?token=${verificationToken}`;
            const verifyEmail = getEmail('verify', { name: name, link: verificationLink });

            const mailOptions = {
                from: "Firrel Software <no-reply@firrelsoftware.com>",
                to: email,
                subject: "Email Verification",
                html: verifyEmail
            };

            await transporter.sendMail(mailOptions);
        }

        const { rows } = await pool.query(query, values);
        const updatedUser = rows[0];

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
                res.json({ message: "Profile updated successfully! Please verify your new email address.", user: updatedUser });
            });
        });

    } catch (error) {
        console.error("Profile update error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

export default router;
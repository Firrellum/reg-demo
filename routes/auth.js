import express from "express";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import crypto from "crypto"; 
import pool from "../db.js";
import nodemailer from "nodemailer";

dotenv.config();

const router = express.Router(); 



function generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Register User
router.post("/register", async (req, res) => {
    const { name, email, password, color } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" });
        }

        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        const color = generateRandomColor();
        console.log(color);

        await pool.query(
            "INSERT INTO users (name, email, password, color) VALUES ($1, $2, $3, $4)",
            [name, email, hashedPassword, color]
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Login
router.post("/login", async (req, res) => {
    const { email, password, } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userResult.rows.length === 0) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        const user = userResult.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Invalid email or password" });
        }

        req.session.user = { id: user.id, name: user.name, email: user.email, color: user.color };
        req.session.save();


        res.json({ message: "Login successful", user: req.session.user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
});

// Logout
router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: "Logout failed" });
        }
        res.clearCookie("connect.sid");
        res.json({ message: "Logged out successfully" });
    });
});

// Check session
router.get("/check-session", (req, res) => {
    if (req.session.user) {
        res.json({ loggedIn: true, user: req.session.user });
    } else {
        res.json({ loggedIn: false });
    }
});

const transporter = nodemailer.createTransport({
    service: "gmail",   
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// console.log(`User: ${process.env.EMAIL_USER}`);
// console.log(`Pass: '${process.env.EMAIL_PASS}'`);

// Forgot Password (Generate Reset Token)
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    console.log(user.rows[0].name);
    if (!user.rows.length) return res.status(400).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    await pool.query(
        "UPDATE users SET reset_token = $1, reset_expiry = NOW() + INTERVAL '1 hour' WHERE email = $2",
        [token, email]
    );

    const resetLink = `http://localhost:3000/reset.html?token=${token}`;

    const mailOptions = {
        from: "Firrel Software <no-reply@firrelsoftware.com>",
        to: email,
        subject: "Password Reset Request",
        html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; background: linear-gradient(-32deg, #1c003a, #070707, #17003a); border: 1px solid #ff6600; border-radius: 10px;">
                <h2 style="color: #ff6600; text-align: center;">Password Reset Request</h2>
                <p style="color: rgb(148, 146, 146);">Hello, <span style="color: #ff6600;">${user.rows[0].name}</span></p>
                <p style="color:rgb(148, 146, 146);">
                You requested a password reset for your Firrel Software account. Click the button below to reset your password:</p>
                <div style="text-align: center; margin: 20px 0;">
                <a href="${resetLink}" style="background-color: #ff6600; color:rgb(33, 0, 36); padding: 12px 20px; text-decoration: none; border-radius: 16px; font-size: 16px; display: inline-block;">Reset Password</a>
                </div>
                <p style="color: rgb(148, 146, 146);">If you didn’t request this, you can ignore this email. Your password will remain the same.</p>
                <p style="color: rgb(148, 146, 146); font-size: 12px;">If the button above doesn't work, copy and paste the following link in your browser:</p>
                <p style="word-wrap: break-word; font-size: 12px; color: rgb(148, 146, 146);"><span style="text-decoration:none; color: #ff6600;">${resetLink}</span></p>
                <hr style="border: none; border-top: 1px solid #ccc;">
                <p style="text-align: center; color: rgb(148, 146, 146); font-size: 12px;">© ${new Date().getFullYear()} Firrel Software. All rights reserved.</p>
                </div>
        `
    };
    

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Reset link sent to email" });
    } catch (error) {
        console.error("Email Error:", error);
        res.status(500).json({ message: "Failed to send email" });
    }
});

router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
        return res.status(400).json({ message: "Token and new password required" });
    }

    const user = await pool.query("SELECT * FROM users WHERE reset_token = $1 AND reset_expiry > NOW()", [token]);

    if (!user.rows.length) {
        return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1, reset_token = NULL, reset_expiry = NULL WHERE reset_token = $2", [hashedPassword, token]);

    res.json({ message: "Password updated successfully" });
});

export default router; // ✅ Corrected export syntax

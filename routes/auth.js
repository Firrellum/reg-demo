// This file contains authentication routes for the application. 
// It includes routes for registering, logging in, verifying email, and resetting passwords. 
// The routes use bcryptjs for password hashing, crypto for generating random tokens, and nodemailer for sending emails. 
// The routes also interact with the database using the pool object from db.js.

//#region Imports
import express from "express"; // import express framework
import bcrypt from "bcryptjs"; // import bcrypt for password hashing
import dotenv from "dotenv"; // import dotenv for environment variable management
import crypto from "crypto"; // import crypto for generating random tokens
import pool from "../db.js"; // import pool for database connection
import nodemailer from "nodemailer"; // import nodemailer for sending emails
//#endregion

// Load environment variables from .env file
dotenv.config();

// Create a new router to handle authentication routes
const router = express.Router();

//#region Register, Login, Logout and Check Sessopm Routes

// Register a new user endpoint 
// This route registers a new user with a name, email, and password.
// It hashes the password, generates a random color, and sends a verification email.
router.post("/register", async (req, res) => {
    const { name, email, password } = req.body; // destruct name, email, and password from the request body

    if (!name || !email || !password) { // check if any of the fields are missing
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]); // check if user exists with the provided email
        if (userExists.rows.length > 0) {
            return res.status(400).json({ error: "Email already registered" }); // User already exists message
        }

        const saltRounds = parseInt(process.env.SALT_ROUNDS) || 10; // get the number of salt rounds from environment variables
        const hashedPassword = await bcrypt.hash(password, saltRounds); // hash the password using bcryptjs
        const color = generateRandomColor(); // generate a random color for the user
        const verificationToken = crypto.randomBytes(32).toString("hex"); // generate a verification token
        const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // set the verification expiry to 24 hours from now

        await pool.query( // insert the new user into the database
            "INSERT INTO users (name, email, password, color, verification_token, verification_expiry) VALUES ($1, $2, $3, $4, $5, $6)",
            [name, email, hashedPassword, color, verificationToken, verificationExpiry]
        );

        const verifyEmail = getEmail('verify', { name, link: `https://reg-demo.onrender.com/verify.html?token=${verificationToken}`}); // get email template for verification

        const mailOptions = { // create email options
            from: "Firrel Software <no-reply@firrelsoftware.com>",
            to: email,
            subject: "Email Verification",
            html: verifyEmail
        };

        await transporter.sendMail(mailOptions); // send the verification email

        res.status(201).json({ message: "User registered successfully. Please check your email to verify your account." }); // success message
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" }); // error message
    }
});

// User login route
// This route logs in a user with an email and password.
// It checks the user's credentials and updates the session with user details.
router.post("/login", async (req, res) => {
    // console.log('login request')
    const { email, password } = req.body; // destruct email and password from the request body

    if (!email || !password) { // check if email or password is missing
        return res.status(400).json({ error: "All fields are required" }); // missing fields message
    }

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]); // select user with the provided email
        if (userResult.rows.length === 0) {
            // console.log('no users with that email found')
            return res.status(400).json({ error: "Invalid email" }); // invalid email or password message
        }

        const user = userResult.rows[0]; // get the user from the result
        if (!user.is_verified) {
            console.log('user not verified')
            return res.status(400).json({ error: "Please verify your email before logging in" }); // success message
        }

        const isMatch = await bcrypt.compare(password, user.password); // compare the provided password with the hashed password
        if (!isMatch) {
            // console.log('password mismatch')
            return res.status(400).json({ error: "Invalid email or password" }); // no match message
        }

        req.session.user = { id: user.id, name: user.name, email: user.email, color: user.color }; // update session with user details
        req.session.save(); // save the session

        res.json({ message: "Login successful", user: req.session.user }); // login success message
    } catch (error) {
        console.log('Another error', error)
        console.error(error);
        res.status(500).json({ error: "Server error" }); // error message
    }
});

// Logout route
// This route logs out a user, destroys the session and clears the cookie.
router.post("/logout", (req, res) => {
    req.session.destroy((err) => { // destroy the session
        if (err) {
            return res.status(500).json({ error: "Logout failed" }); // logout fail message
        }
        res.clearCookie("connect.sid"); // clear the cookie
        res.json({ message: "Logged out successfully" }); // logout success message
    });
});

// Check session route
// This route checks if a user is logged in by checking the session.
router.get("/check-session", (req, res) => {
    if (req.session.user) { // is a user logged in
        res.json({ loggedIn: true, user: req.session.user }); // return user is logged in
    } else {
        res.json({ loggedIn: false }); // return user is not logged in
    }
});

//#endregion

//#region Email Verification, Password Reset and Forgot Password Routes

// Verify new user email route
// This route verifies a new user's email using a verification token.
// It updates the user's verification status and email in the database. 
router.get("/verify-email", async (req, res) => {
    const { token } = req.query; // destruct token from the query parameters

    if (!token) {
        return res.status(400).json({ message: "Verification token is required" }); // no token message
    }

    try {
        const userResult = await pool.query("SELECT * FROM users WHERE verification_token = $1 AND verification_expiry > NOW()", [token]); // select user with the provided token

        if (userResult.rows.length === 0) {
            return res.status(400).json({ message: "Invalid or expired verification token" }); // invalid or expired token message
        }

        const user = userResult.rows[0]; // get the user from the result

        // update updated user email when verified
        await pool.query(
            `UPDATE users 
             SET verification_token = NULL, 
                 verification_expiry = NULL, 
                 is_verified = TRUE, 
                 email = COALESCE(new_email, email), 
                 new_email = NULL 
             WHERE id = $1`, 
            [user.id]
          );

        res.json({ message: "Email verified successfully" }); // success message
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" }); // error message
    }
});

// Forgot password route (Generate Reset Token)
// This route generates a reset token for a user and sends a reset email.
router.post("/forgot-password", async (req, res) => {
    const { email } = req.body; // get email from the request body
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [email]); // select user with the provided email
    if (!user.rows.length) return res.status(400).json({ message: "User not found" }); // user not found message

    const token = crypto.randomBytes(32).toString("hex"); // generate a reset token
    await pool.query("UPDATE users SET reset_token = $1, reset_expiry = NOW() + INTERVAL '1 hour' WHERE email = $2",[token, email]); // updae the user with the reset token

    const resetEmail = getEmail('reset', { name: user.rows[0].name, link: `https://reg-demo.onrender.com/reset.html?token=${token}` }); // get email template for reset

    const mailOptions = { // create email options
        from: "Firrel Software <no-reply@firrelsoftware.com>",
        to: email,
        subject: "Password Reset Request",
        html: resetEmail
    };

    try {
        await transporter.sendMail(mailOptions); // send the reset email
        res.json({ message: "Reset link sent to email" }); // success message
    } catch (error) {
        console.error("Email Error:", error); // log error
        res.status(500).json({ message: "Failed to send email" }); // error message
    }
});

// Reset Password route
// This route resets a user's password using a reset token.
router.post("/reset-password", async (req, res) => {
    const { token, newPassword } = req.body; // destruct token and new password from the request body

    if (!token || !newPassword) { // check if token or new password is missing
        return res.status(400).json({ message: "Token and new password required" }); // missing fields message
    }

    const user = await pool.query("SELECT * FROM users WHERE reset_token = $1 AND reset_expiry > NOW()", [token]); // select user with the provided token

    if (!user.rows.length) { // check if user with tokem exists
        return res.status(400).json({ message: "Invalid or expired token" }); // invalid or expired token message
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10); // hash the new password
    await pool.query("UPDATE users SET password = $1, reset_token = NULL, reset_expiry = NULL WHERE reset_token = $2", [hashedPassword, token]); // update the user with the new hashed password

    res.json({ message: "Password updated successfully" }); // password updated succesfully message
});

//#endregion

//#region NodeMailer and Helper Functions

// Email transporter configuration
export const transporter = nodemailer.createTransport({
    service: "gmail", // set the email service
    auth: {
        user: process.env.EMAIL_USER, // get the email user from environment variables
        pass: process.env.EMAIL_PASS // get the app password from environment variables
    }
});

// Helper function to generate email content for verification and reset
export function getEmail(type, data) {
    const { name, link } = data; // destruct name and link from the data
    const isReset = type === 'reset'; // check if the type is reset

    return `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; margin: auto; background: linear-gradient(-32deg, #1c003a, #070707, #17003a); border: 1px solid #ff6600; border-radius: 10px;">
            <h2 style="color: #ff6600; text-align: center;">${isReset ? 'Password Reset Request' : 'Email Verification'}</h2>
            <p style="color: rgb(148, 146, 146);">Hello, <span style="color: #ff6600;">${name}</span></p>
            <p style="color:rgb(148, 146, 146);">
                ${isReset 
                    ? 'You requested a password reset for your Firrel Software account. Click the button below to reset your password:' 
                    : 'Please verify your email address by clicking the button below:'}
            </p>
            <div style="text-align: center; margin: 20px 0;">
                <a href="${link}" style="background-color: #ff6600; color:rgb(33, 0, 36); padding: 12px 20px; text-decoration: none; border-radius: 16px; font-size: 16px; display: inline-block;">
                    ${isReset ? 'Reset Password' : 'Verify Email'}
                </a>
            </div>
            <p style="color: rgb(148, 146, 146);">
                ${isReset 
                    ? "If you didn’t request this, you can ignore this email. Your password will remain the same."
                    : "If you didn’t request this, you can ignore this email."}
            </p>
            <p style="color: rgb(148, 146, 146); font-size: 12px;">If the button above doesn't work, copy and paste the following link in your browser:</p>
            <p style="word-wrap: break-word; font-size: 12px; color: rgb(148, 146, 146);"><span style="text-decoration:none; color: #ff6600;">${link}</span></p>
            <hr style="border: none; border-top: 1px solid #ccc;">
            <p style="text-align: center; color: rgb(148, 146, 146); font-size: 12px;">© ${new Date().getFullYear()} Firrel Software. All rights reserved.</p>
        </div>`;
}

// Utility function to generate a random color
// This function generates a random color in hexadecimal format.
function generateRandomColor() {
    const letters = '0123456789ABCDEF'; // string with color hex digits
    let color = '#'; // hash prefix for color
    for (let i = 0; i < 6; i++) { // loop for hash length
        color += letters[Math.floor(Math.random() * 16)]; // rng the color hash form the letters
    }
    return color; // return the generated color
}

//#endregion

export default router; // export the router for use elsewere in the application

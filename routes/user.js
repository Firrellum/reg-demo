// This file contains the user routes for updating the user profile.
// It includes routes for getting the user profile and updating the user profile.
// The update route updates the user's name, email, password, and color.
// It also sends a verification email if the email is changed.
// The profile route returns the user's session information.
// The routes are protected by the isAuthenticated middleware.

//#region Imports
import express from "express"; // import express framework
import bcrypt from "bcryptjs"; // import bcrypt for password hashing
import pool from "../db.js"; // imprt the pool from db.js
import { isAuthenticated } from "../middlewares/authMiddleware.js"; // import isAuthenticated middleware
import { getEmail, transporter } from "./auth.js"; // import getEmail and transporter from auth.js
import crypto from "crypto"; // import crypto for generating tokens
//#endregion

// Create a new router
const router = express.Router();

//#region Profile Authentication and Update Routes
// Get user profile route
// This route returns the user's profile information
router.get("/profile", isAuthenticated, (req, res) => {
    res.json({ user: req.session.user });
});

// Update user profile route
// This route updates the user's profile with the new name, email, password, and color.
// It also sends a verification email if the email is changed.
router.post("/profile/update", isAuthenticated, async (req, res) => {
    const { name, email, password, color } = req.body; // destruct name, email, password, and color from the request body
    const userId = req.session.user.id; // store user id from the session
    const currentEmail = req.session.user.email; // store current email from the session
    const currentColor = req.session.user.color; // store current color from the session

    try {
        let query = "UPDATE users SET name = $1, color = $2 WHERE id = $3 RETURNING id, name, email, color"; // set initial query to update users name and color
        let values = [name, color, userId]; // set initial query values

        if (password) { // if password exists update password as well update the query to include password
            const hashedPassword = await bcrypt.hash(password, 10);
            query = "UPDATE users SET name = $1, password = $2, color = $3 WHERE id = $4 RETURNING id, name, email, color";
            values = [name, hashedPassword, color, userId]; // update values to include hashed password
        }

        if (email !== currentEmail) { // if email exists and is not the same as the registered one update the query to include email
            const verificationToken = crypto.randomBytes(32).toString("hex"); // generate a verification token
            const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // set verification expiry to 24 hours 

            // update users name, color, verification token, verification expiry, and new email
            query = "UPDATE users SET name = $1, color = $2, verification_token = $3, verification_expiry = $4, new_email = $5, is_verified = NULL WHERE id = $6 RETURNING id, name, email, color"; 
            values = [name, color, verificationToken, verificationExpiry, email, userId ]; // update values to include verification token, verification expiry, and new email

            const verificationLink = `http://localhost:3000/verify.html?token=${verificationToken}`; // generate verification link
            const verifyEmail = getEmail('verify', { name: name, link: verificationLink }); // get verify email template

            const mailOptions = { // set mail options
                from: "Firrel Software <no-reply@firrelsoftware.com>",
                to: email,
                subject: "Email Verification",
                html: verifyEmail
            };

            await transporter.sendMail(mailOptions); // send verification email
        }

        const { rows } = await pool.query(query, values); // execute full update query
        const updatedUser = rows[0]; // store updated user

        req.session.regenerate((err) => { // regenerate session
            if (err) {
                console.error("Session regeneration error:", err); // session log error
                return res.status(500).json({ error: "Session error" }); // return error message and status
            }

            req.session.user = updatedUser; // Store updated user in session
            req.session.save((err) => { // save session
                if (err) {
                    console.error("Session save error:", err); // session save error log
                    return res.status(500).json({ error: "Session save error" }); // return error message and status
                }
                res.json({ message: "Profile updated successfully! Please verify your new email address.", user: updatedUser }); // success message and updated user
            });
        });

    } catch (error) {
        console.error("Profile update error:", error); // log server error
        res.status(500).json({ error: "Internal Server Error" }); // server error log and status
    }
});
//#endregion

export default router;  // export the router for use in other parts of the app


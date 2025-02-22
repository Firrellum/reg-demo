import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.js";  
import session from "express-session";
import pgSession from "connect-pg-simple";
import pool from "./db.js";
import userRoutes from "./routes/user.js"; // Ensure this line is present


dotenv.config();

const app = express();
const PORT = process.env.APP_PORT || 5000;

app.use(cors());
app.use(express.json()); // Parse JSON request body
app.use(express.static('public')); // Serve static files

const pgStore = pgSession(session);

app.use(
    session({
        store: new pgStore({ pool }),
        secret: process.env.SESSION_SECRET, // Change this to a strong secret
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 * 24 } // 1 day
    })
);

// Authentication routes
app.use("/auth", authRoutes);
app.use("/user", userRoutes); // Mount user routes

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// This file contains the setup for the express server. 
// It imports the necessary packages, sets up the server, and listens on a specified port. 
// It also sets up session management and uses the auth and user routes for authentication and user routes, respectively.

//#region Imports
import express from "express"; // import express framework
import dotenv from "dotenv";  // import dotenv for environment variables
import cors from "cors"; // import cors for cross-origin resource sharing
import authRoutes from "./routes/auth.js"; // import authRoutes for authentication routes
import session from "express-session";  // import express-session for session management
import pgSession from "connect-pg-simple"; // import connect-pg-simple for session store
import pool from "./db.js";  // import the pool from db.js
import userRoutes from "./routes/user.js";  // import userRoutes for user routes
//#endregion

// Load environment variables from .env file
dotenv.config();  

// Create an express application
const app = express();  
// Set the port to the environment variable or 5000
const PORT = process.env.APP_PORT || 5000;  
// Enable cross-origin resource sharing
app.use(cors());  
// Enable JSON parsing
app.use(express.json());
// Use the public directory for static files 
app.use(express.static('public'));  

// Create a new session store with the pool
const pgStore = pgSession(session);  

// Create a new session with the store
app.use(
    session({
        store: new pgStore({ pool }),  // store session in the pool
        secret: process.env.SESSION_SECRET, // get sessoion secret from environment variable
        resave: false, // do not save session on every request
        saveUninitialized: false, // do not save uninitialized session
        cookie: {  // set cookie options
            secure: false, // disable secure cookie 
            httpOnly: true,  // enable httpOnly cookie
            maxAge: 1000 * 60 * 60 * 24  // set cookie expiry to 24 hours
        }
    })
);

// Use the auth and user routes
app.use("/auth", authRoutes);  
app.use("/user", userRoutes); 

// Start the server on the specified port
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

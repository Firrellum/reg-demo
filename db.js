// This file contains the setup for the PostgreSQL database connection.
// It imports the necessary packages, loads environment variables, and creates a new Pool object for connecting to the database.
// It also exports the pool for use in other parts of the application.

import pkg from "pg"; // import pg for connecting to PostgreSQL
import dotenv from "dotenv";  // import dotenv for environment variables

// Load environment variables from .env file
dotenv.config();  
// Destruct a Pool object from pg
const { Pool } = pkg; 

// Create a new Pool with the connection string 
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // get the connection string from the environment variable  
    ssl: { rejectUnauthorized: false }, // disable SSL certificate verification
});

// Connect to the database
pool.connect((err) => {
    if (err) {
        console.error('not connected', err.stack); // error log message  
    } else {
        console.log('connected'); // success log message
    }
});

export default pool; // export the pool for use in other parts of the app

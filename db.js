import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for cloud-hosted DBs
});
pool.connect((err) => {
    if (err) {
        console.error('not connected', err.stack);
    } else {
        console.log('connected');
    }
});
export default pool;
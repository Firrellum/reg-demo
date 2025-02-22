import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const client = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, // Required for cloud-hosted DBs
});
client.connect((err) => {
    if (err) {
        console.error('not connected', err.stack);
    } else {
        console.log('connected');
    }
});
export default client;
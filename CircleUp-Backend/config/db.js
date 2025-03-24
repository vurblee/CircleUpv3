const { Pool } = require("pg");
require("dotenv").config();

// Create PostgreSQL connection pool using environment variables.
const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  ssl: { rejectUnauthorized: false } // For AWS RDS; adjust as needed.
});

// Log a successful connection.
pool.on("connect", () => {
  console.log("✅ Database connected successfully!");
});

// Log any connection errors.
pool.on("error", (err) => {
  console.error("❌ Database connection error:", err);
});

module.exports = pool;

const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DATABASE_USER,
  host: process.env.DATABASE_HOST,
  database: process.env.DATABASE_TITLE,
  password: process.env.DATABASE_PASSWORD,
  port: 5432,
});

const verifyConnection = async () => {
  try {
    await pool.query("SELECT NOW()");
    console.log("Database connected successfully");
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
};

verifyConnection();

module.exports = pool;

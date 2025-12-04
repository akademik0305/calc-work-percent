import { Pool } from "pg";
// dotenv config
import { configDotenv } from "dotenv";
configDotenv();

const pool = new Pool({
  // user: process.env.PG_USER,
  // password: process.env.PG_PASSWORD,
  // host: process.env.PG_HOST,
  // port: process.env.PG_PORT,
  // database: process.env.PG_DATABASE
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production"
    ? { rejectUnauthorized: false }
    : false
})


// Ulanishni tekshirish
pool.query("SELECT NOW()")
  .then(res => {
    console.log("DB ishlayapti! Vaqt:", res.rows[0].now);
  })
  .catch(err => {
    console.error("DB xato:", err.message);
  });



export default pool
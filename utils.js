import fetch from "node-fetch";
import { configDotenv } from 'dotenv';
configDotenv();

const DELAY = 1 // minutes
function autoFetch() {
  setInterval(() => {
    fetch(process.env.HOSTNAME)
      .then(res => console.log("Self-ping status:", res.status))
      .catch(err => console.error("Self-ping error:", err));
  }, DELAY * 60 * 1000);
}

export default autoFetch;

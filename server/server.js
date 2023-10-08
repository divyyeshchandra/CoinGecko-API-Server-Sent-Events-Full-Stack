const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(express.json());
app.use(cors());

let apiCallsToday = 0;
const maxApiCallsPerDay = 3000;

// Timestamp to track the last API call
let lastApiCallTimestamp = 0;

app.get("/events", async (req, res) => {
  if (apiCallsToday >= maxApiCallsPerDay) {
    res.status(429).end("API call limit exceeded for today");
    return;
  }

  const now = Date.now();

  // Calculate the time elapsed since the last API call
  const timeSinceLastCall = now - lastApiCallTimestamp;

  // If less than 5 seconds have passed since the last API call, respond with an error
  if (timeSinceLastCall < 5000) {
    res.status(429).end("API call limit exceeded");
    return;
  }

  lastApiCallTimestamp = now;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const fetchData = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false&locale=en"
      );
      const data = response.data;
      res.write(`data: ${JSON.stringify(data)}\n\n`);

      // Increment the API calls counter
      apiCallsToday += 1;
    } catch (error) {
      console.error("Error fetching data:", error.message);
    }
  };

  // Send data immediately on connection
  await fetchData();

  // Handle client disconnect
  req.on("close", () => {
    // Clean up the API call timestamp if the client disconnects
    lastApiCallTimestamp = 0;
  });
});

// Reset API calls counter at the start of each day
setInterval(() => {
  const now = new Date();
  const resetTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1
  );
  const timeUntilReset = resetTime - now;

  setTimeout(() => {
    apiCallsToday = 0;
  }, timeUntilReset);
}, 24 * 60 * 60 * 1000);

const start = async () => {
  app.listen(3001, () => {
    console.log("App Started");
  });
};

start();

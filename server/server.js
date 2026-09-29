const express = require("express");
const app = express();
const chalk = require("chalk");
const cors = require("cors");
require('dotenv').config();

const { atlasConnect } = require("./config/db")
// Global Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.CLIENT_URL
].filter(Boolean);

const PORT = process.env.PORT || 8000

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed bt CORS"))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
)

app.use(express.json());

atlasConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(
        `🚀 Server running at ${chalk.blue.underline(`http://localhost:${PORT}`)}`,
      );
    });
  })
  .catch((err) => {
    console.log(err);
    process.exit(1);
  });
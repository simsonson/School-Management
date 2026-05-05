const dotenv = require('dotenv');
const connectDB = require('./config/db');
const app = require('./app');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

/*import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import morgan from "morgan";

dotenv.config();

const app = express();

app.use(helmet());
app.use(morgan("dev"));

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

app.use(express.json());
*/

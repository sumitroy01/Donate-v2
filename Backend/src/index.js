// src/index.js
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";

import conDb from "./lib/db.js";
import userRoutes from "./routes/user.routes.js";
import profileRouter from "./routes/profile.routes.js";
import donationRouter from "./routes/donations.js";

const app = express();

const allowedOrigins = [
  process.env.FRONTEND_ORIGIN, 
].filter(Boolean);

// Dynamic CORS check
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
  ],
};

// Apply CORS globally
app.use(cors(corsOptions));

// Handle preflight safely
app.options(/.*/, cors(corsOptions));

app.use(express.json());
app.use(cookieParser());



app.use("/api/user", userRoutes);
app.use("/api/profile", profileRouter);
app.use("/api/donations", donationRouter);

// Extra safety: OPTIONS fallback
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});


const PORT = process.env.PORT || 3000;
console.log("MONGO_URI is:", process.env.MONGO_URI);

const startServer = async () => {
  try {
    await conDb();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

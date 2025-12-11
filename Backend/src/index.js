import express from "express";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import conDb from "./lib/db.js";
import userRoutes from "./routes/user.routes.js";
import cors from "cors";
import profileRouter from "./routes/profile.routes.js";
import donationRouter from "./routes/donations.js";

const app = express();

// Recommended: allow multiple origins (Render + local dev). Replace or extend as needed.
const allowedOrigins = [
  process.env.FRONTEND_ORIGIN,          // production origin (must be set in Render)
  "http://localhost:5173",              // add your local frontend origin if needed
  "http://localhost:3000"
].filter(Boolean);

// dynamic origin checker (safer than wildcard)
const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl) or from allowedOrigins
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization","X-Requested-With", "Accept"],
};

// apply CORS
app.use(cors(corsOptions));

// ensure OPTIONS preflight handled (explicit)
app.options("*", cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// your routes
app.use("/api/user/", userRoutes);
app.use("/api/profile/", profileRouter);
app.use("/api/donations", donationRouter);

const PORT = process.env.PORT || 3000;
console.log("MONGO_URI is:", process.env.MONGO_URI);

const startServer = async () => {
  try {
    await conDb();
    app.listen(PORT, () => {
      console.log(`App running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();

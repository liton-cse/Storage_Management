import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import actionRoutes from "./routes/actionRoutes.js";
import navigationButtomRoutes from "./routes/navigationButtomRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config();

// Built in middlware....
const app = express();
app.use(express.json());

// Update your static file configuration to:
// app.use(
//   "/profile_picture",
//   express.static(path.join(__dirname, "profile_picture"), {
//     setHeaders: (res) => {
//       res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
//     },
//   })
// );

// CORS Middleware
const allowedOrigins = [
  "http://localhost:5173", // For local development
  "https://storage-management-fronend.onrender.com", // Your live frontend
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // If using cookies/auth
  })
);

// app.use((req, res, next) => {
//   res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
//   res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
//   res.setHeader(
//     "Access-Control-Allow-Origin",
//     process.env.GOOGLE_REDIRECT_URI || "http://localhost:5173"
//   );
//   next();
// });

//Database Connection//
connectDB();
app.use("/uploads", express.static("uploads"));
app.use(
  "/profile_picture",
  express.static(path.join(__dirname, "profile_picture"))
);
//All App Routes..
app.use("/api/auth", authRoutes);
app.use("/api", menuRoutes);
app.use("/api", actionRoutes);
app.use("/api", navigationButtomRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

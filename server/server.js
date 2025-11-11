import express from 'express';
import dotenv from 'dotenv';
import connectDB from './db/index.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

import healthCheckRoutes from "./routes/healthCheck.route.js";
import userRoutes from "./routes/user.route.js";
import productRoutes from "./routes/product.route.js";
import newsRoutes from "./routes/news.route.js";
import otpRoutes from "./routes/otp.route.js";

// route declarations
app.use("/api/v1/health", healthCheckRoutes);
app.use("/api/v1/user", userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/news", newsRoutes);
app.use("/api/v1/otp", otpRoutes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}).catch((error) => {
    console.error("Failed to start server:", error.message);
});
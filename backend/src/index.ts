import express from "express";
import http from "http";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import { Server as SocketIOServer } from "socket.io";
import authRouter from "@/routes/auth";
import uploadRouter from "@/routes/uploadRoutes";
import profileRouter from "./routes/profileRoutes";
import chatRouter from "@/routes/chatRoutes";
import orderRouter from "@/routes/orderRoutes";
import dashboardRouter from "@/routes/dashboardRoutes";
import deliveryRouter from "@/routes/deliveryRoutes";
import applicationRouter from "@/routes/applicationRoutes";
import userRouter from "@/routes/userRoutes";
import distributionRouter from "@/routes/distributionRoutes";
import supplierRouter from "@/routes/supplierRoutes";
import vehicleRouter from "@/routes/vehicleRoutes";
import "@/config/passport";
import { setupSocketIO } from "@/socket";

dotenv.config();

const app = express();
const server = http.createServer(app);
const PgStore = connectPgSimple(session);

// Middleware
const corsOrigin = process.env.FRONTEND_URL;
if (!corsOrigin) {
  throw new Error("FRONTEND_URL environment variable is required");
}

const corsOptions = {
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

console.log(`[CORS] Allowing origin: ${corsOrigin}`);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret)
  throw new Error("SESSION_SECRET environment variable is required");

// Session middleware (Socket.IO)
const sessionMiddleware = session({
  store: new PgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
  }),
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  proxy: true, // Trust Railway's proxy for X-Forwarded-Proto
  cookie: {
    httpOnly: true,
    secure: true, // Always true for HTTPS (Railway enforces HTTPS)
    sameSite: "none", // Required for cross-origin cookie sending
    maxAge: 24 * 60 * 60 * 1000,
  },
});

console.log(`[Session] Using PgStore with database: ${process.env.DATABASE_URL?.substring(0, 50)}...`);
console.log(`[Session] Cookie settings: secure=true, sameSite=none, httpOnly=true, proxy=true`);
console.log(`[Init] Backend started - version: 2026-03-19`);

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Socket.IO
const io = new SocketIOServer(server, { cors: corsOptions });
setupSocketIO(io, sessionMiddleware);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", authenticated: !!req.user });
});

// Debug endpoint (remove in production)
app.get("/api/debug/session", (req, res) => {
  console.log(`[Debug] Session check:`);
  console.log(`  - sessionID: ${req.sessionID}`);
  console.log(`  - req.user: ${req.user ? req.user.email : "null"}`);
  console.log(`  - cookies: ${req.headers.cookie || "none"}`);
  res.json({
    authenticated: !!req.user,
    user: req.user || null,
    sessionID: req.sessionID,
    cookies: req.headers.cookie || "none",
  });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Auth routes
app.use("/api/auth", authRouter);

// Upload routes
app.use("/api/upload", uploadRouter);

// Chat routes
app.use("/api/chat", chatRouter);

// Feature-based routes
app.use("/api/profile", profileRouter);
app.use("/api/orders", orderRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/deliveries", deliveryRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/users", userRouter);
app.use("/api/distribution-centers", distributionRouter);
app.use("/api/suppliers", supplierRouter);
app.use("/api/vehicles", vehicleRouter);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

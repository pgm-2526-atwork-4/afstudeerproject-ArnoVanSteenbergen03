import express from "express";
import http from "http";
import cors, { CorsOptions } from "cors";
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
const frontendOriginsEnv = process.env.FRONTEND_URL;
if (!frontendOriginsEnv) {
  throw new Error("FRONTEND_URL environment variable is required");
}

const allowedOrigins = frontendOriginsEnv
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.length === 0) {
  throw new Error("FRONTEND_URL must contain at least one valid origin");
}

const firstOrigin = allowedOrigins[0];
let useSecureCookie = process.env.NODE_ENV === "production";

try {
  useSecureCookie = new URL(firstOrigin).protocol === "https:";
} catch {
  throw new Error(
    `FRONTEND_URL contains an invalid origin: ${firstOrigin}`,
  );
}

const cookieSameSite: "lax" | "none" = useSecureCookie ? "none" : "lax";
const sessionCookieDomain = process.env.SESSION_COOKIE_DOMAIN;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error(`[CORS] Origin not allowed: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const socketCorsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

console.log(`[CORS] Allowing origins: ${allowedOrigins.join(", ")}`);
console.log(
  `[SESSION] Cookie config: secure=${useSecureCookie}, sameSite=${cookieSameSite}`,
);

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret)
  throw new Error("SESSION_SECRET environment variable is required");

app.set("trust proxy", 1);

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
    secure: useSecureCookie,
    sameSite: cookieSameSite,
    maxAge: 24 * 60 * 60 * 1000,
    ...(sessionCookieDomain ? { domain: sessionCookieDomain } : {}),
  },
});

app.use(sessionMiddleware);
app.use(passport.initialize());
app.use(passport.session());

// Socket.IO
const io = new SocketIOServer(server, { cors: socketCorsOptions });
setupSocketIO(io, sessionMiddleware);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", authenticated: !!req.user });
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

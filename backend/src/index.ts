import express from "express";
import cors from "cors";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import passport from "passport";
import dotenv from "dotenv";
import path from "path";
import authRouter from "@/routes/auth";
import uploadRouter from "@/routes/uploadRoutes";
import "@/config/passport";
import providerRouter from "@/routes/provider/index";
import volunteerRouter from "@/routes/volunteer/index";
import adminRouter from "@/routes/admin/index";

dotenv.config();

const app = express();
const PgStore = connectPgSimple(session);

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) throw new Error("SESSION_SECRET environment variable is required");

// Session & Auth configuration
app.use(
  //doesnt log me out during development
  session({
    store: new PgStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    //
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    },
  }),
);

app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Auth routes
app.use("/api/auth", authRouter);

// Upload routes (authenticated)
app.use("/api/upload", uploadRouter);

// Role-based routes
app.use("/api/provider", providerRouter);
app.use("/api/volunteer", volunteerRouter);
app.use("/api/admin", adminRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
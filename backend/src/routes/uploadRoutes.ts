import { Router, Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { db } from "@/config/database";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

const router = Router();

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

// Ensure upload directories exist
["profiles", "goods"].forEach((dir) => {
  const fullPath = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    const subDir = (_req as any).uploadSubDir || "goods";
    cb(null, path.join(UPLOAD_DIR, subDir));
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueName = `${crypto.randomUUID()}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: MAX_SIZE } });

// Upload profile image
router.post(
  "/profile-image",
  (req: Request, _res: Response, next) => {
    (req as any).uploadSubDir = "profiles";
    next();
  },
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const userId = (req.user as any).id;
      const imageUrl = `/uploads/profiles/${req.file.filename}`;

      const currentUser = await db.query.users.findFirst({
        where: eq(users.id, userId),
      });
      if (currentUser?.profileImage) {
        const oldPath = path.join(__dirname, "../..", currentUser.profileImage);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      await db
        .update(users)
        .set({ profileImage: imageUrl, updatedAt: new Date() })
        .where(eq(users.id, userId));

      res.json({ imageUrl });
    } catch (error) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  },
);

// Upload goods image
router.post(
  "/goods-image",
  (req: Request, _res: Response, next) => {
    (req as any).uploadSubDir = "goods";
    next();
  },
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const imageUrl = `/uploads/goods/${req.file.filename}`;
      res.json({ imageUrl });
    } catch (error) {
      console.error("Goods image upload error:", error);
      res.status(500).json({ error: "Failed to upload goods image" });
    }
  },
);

export default router;

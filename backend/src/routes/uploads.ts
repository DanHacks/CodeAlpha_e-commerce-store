import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../middleware/auth.js";

export const uploadsRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only image files allowed"));
    cb(null, true);
  },
});

// POST /api/uploads/image — admin, single file under field "file"
uploadsRouter.post("/image", requireAuth, requireRole("admin"), upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file provided" });
  // TODO: push req.file.buffer to S3 / R2 and return the public URL.
  // For now we echo a data: URL so the MVP works without external storage.
  const url = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
  res.status(201).json({ url, size: req.file.size, mime: req.file.mimetype });
});

// POST /api/uploads/images — admin, multiple files under field "files" (max 5)
uploadsRouter.post("/images", requireAuth, requireRole("admin"), upload.array("files", 5), (req, res) => {
  const files = (req.files as Express.Multer.File[]) || [];
  if (!files.length) return res.status(400).json({ error: "No files provided" });
  const urls = files.map((f) => `data:${f.mimetype};base64,${f.buffer.toString("base64")}`);
  res.status(201).json({ urls });
});

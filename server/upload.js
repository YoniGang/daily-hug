import multer from "multer";

// Multer: accept a single image in memory, 2 MB max (images arrive pre-compressed)
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter(_req, file, cb) {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("רק קבצי תמונה מותרים"));
  },
});

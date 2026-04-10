const MAX_DIMENSION = 800;
const JPEG_QUALITY = 0.7;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB raw input limit

/**
 * Compresses an image File using the browser Canvas API.
 * - Resizes to fit within MAX_DIMENSION while keeping aspect ratio.
 * - Converts to JPEG at JPEG_QUALITY compression.
 * @param {File} file
 * @returns {Promise<Blob>} compressed JPEG blob
 */
export function compressImage(file) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith("image/")) {
      return reject(new Error("קובץ לא תקין – יש לבחור תמונה"));
    }
    if (file.size > MAX_FILE_SIZE) {
      return reject(new Error("התמונה גדולה מדי (עד 5MB)"));
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);

      let { width, height } = img;

      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("שגיאה בעיבוד התמונה"));
          resolve(blob);
        },
        "image/jpeg",
        JPEG_QUALITY,
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("לא ניתן לטעון את התמונה"));
    };

    img.src = url;
  });
}

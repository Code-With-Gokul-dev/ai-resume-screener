import multer from "multer";

/** @type {import("express").ErrorRequestHandler} */
export default function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const messages = {
      LIMIT_FILE_SIZE: "A file is larger than 5 MB",
      LIMIT_FILE_COUNT: "You can upload up to 20 resumes at a time",
      LIMIT_UNEXPECTED_FILE: "Too many files or wrong field name",
    };
    return res.status(400).json({ error: messages[err.code] || err.message });
  }

  if (/only PDF and DOCX/.test(err.message)) {
    return res.status(400).json({ error: err.message });
  }

  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Something went wrong" });
}

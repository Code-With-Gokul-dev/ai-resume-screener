import pdf from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

/**
 * @param {import("multer").File} file
 * @returns {Promise<string>}
 */
export default async function extractText(file) {
  const isPdf =
    file.mimetype === "application/pdf" || /\.pdf$/i.test(file.originalname);

  let text = "";
  try {
    if (isPdf) {
      text = (await pdf(file.buffer)).text;
    } else {
      text = (await mammoth.extractRawText({ buffer: file.buffer })).value;
    }
  } catch {
    throw new Error("Could not read this file. It may be corrupted or password protected.");
  }

  text = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim();

  if (text.length < 50) {
    throw new Error("No readable text found. The file may be empty or a scanned image.");
  }

  return text;
}

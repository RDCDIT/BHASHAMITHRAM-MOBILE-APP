/**
 * @file dictionaryAdminRoute.js
 * @description Express API routes routing definitions for dictionaryAdminRoute.
 */

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const {
  importManualWord,
  getWords,
  updateWord,
  deleteWord,
  uploadMedia,
} = require("../../controllers/admincontroller/dictionaryAdminController");

// Set up temporary upload directory
const uploadDir = path.join(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
const upload = multer({ dest: uploadDir });

router.post("/import-manual", importManualWord);
router.get("/words", getWords);
router.put("/words/:id", updateWord);
router.delete("/words/:id", deleteWord);

// Media upload endpoint: accepts optional image and audio files
router.post(
  "/upload-media",
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "audio", maxCount: 1 },
  ]),
  uploadMedia
);

module.exports = router;


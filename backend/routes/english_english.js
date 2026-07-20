/**
 * @file english_english.js
 * @description Express API routes routing definitions for english_english.
 */

const express = require("express");

const router = express.Router();

const {
  getAllWords,
  getWordById,
  searchWord,
  createWord,
  updateWord,
  deleteWord,
} = require("../controllers/english_englishcontroller");

router.get("/", getAllWords);

router.get("/browse-english", getAllWords);

router.get("/search", searchWord);

router.get("/:id", getWordById);

router.post("/", createWord);

router.put("/:id", updateWord);

router.delete("/:id", deleteWord);

module.exports = router;
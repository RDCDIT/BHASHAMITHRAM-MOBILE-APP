/**
 * @file english_malayalam.js
 * @description Express API routes routing definitions for english_malayalam.
 */


const express = require("express");

const router = express.Router();

const {
  browseEnglishWords,
  getWordDetails,
  createWord,
  updateWord,
  deleteWord,
} = require(
  "../controllers/english_malayalam_controller"
);

router.get(
  "/browse-english",
  browseEnglishWords
);

router.get(
  "/:id",
  getWordDetails
);

router.post(
  "/",
  createWord
);

router.put(
  "/:id",
  updateWord
);

router.delete(
  "/:id",
  deleteWord
);

module.exports = router;

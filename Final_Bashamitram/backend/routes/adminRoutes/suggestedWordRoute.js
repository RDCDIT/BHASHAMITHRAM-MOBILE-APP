/**
 * @file suggestedWordRoute.js
 * @description Express API routes routing definitions for suggestedWordRoute.
 */

const express = require("express");
const router = express.Router();

const {
  getAllSuggestions,
  getPendingSuggestions,
  approveSuggestion,
  rejectSuggestion,
  deleteSuggestion,
  getSuggestionById,
  updateSuggestion,
  checkWordDbStatus,
} = require("../../controllers/admincontroller/suggestedwordAdminController");

router.get("/", getAllSuggestions);
router.get("/pending", getPendingSuggestions);
router.get("/check-word", checkWordDbStatus);
router.get("/:id", getSuggestionById);
router.put("/:id", updateSuggestion);
router.patch("/:id", updateSuggestion);
router.put("/approve/:id", approveSuggestion);
router.put("/reject/:id", rejectSuggestion);
router.put("/:id/approve", approveSuggestion);
router.put("/:id/reject", rejectSuggestion);
router.delete("/:id", deleteSuggestion);

module.exports = router;
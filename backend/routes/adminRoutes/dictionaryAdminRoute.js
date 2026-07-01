const express = require("express");
const router = express.Router();
const { importManualWord } = require("../../controllers/admincontroller/dictionaryAdminController");

router.post("/import-manual", importManualWord);

module.exports = router;

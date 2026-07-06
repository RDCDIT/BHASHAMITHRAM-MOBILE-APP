/**
 * @file migrationRoute.js
 * @description Express API routes routing definitions for migrationRoute.
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { runMigration } = require('../../migration/index');

// Set up temporary upload directory
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.db';
    cb(null, `db-${Date.now()}${ext}`);
  }
});

const upload = multer({ storage });

router.post('/', upload.single('file'), async (req, res) => {
  let dbPath = null;
  let isUploaded = false;

  try {
    const targetDbName = req.body.targetDbName;
    if (!targetDbName || !targetDbName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A target MongoDB database name must be provided.'
      });
    }

    if (req.file) {
      dbPath = req.file.path;
      isUploaded = true;
      console.log(`Uploaded file received: ${dbPath}`);
    } else if (req.body.sqlitePath) {
      dbPath = req.body.sqlitePath;
      console.log(`Local path received: ${dbPath}`);
    } else {
      return res.status(400).json({
        success: false,
        message: 'No SQLite file uploaded and no local database path provided.'
      });
    }

    // Run migration programmatically
    const report = await runMigration(dbPath, targetDbName.trim());

    return res.status(200).json({
      success: true,
      message: 'Migration completed successfully',
      report
    });

  } catch (err) {
    console.error('Migration API Error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An error occurred during database migration.'
    });
  } finally {
    // Delete the uploaded temporary database to save server space
    if (isUploaded && dbPath && fs.existsSync(dbPath)) {
      try {
        fs.unlinkSync(dbPath);
        console.log(`Cleaned up temp upload file: ${dbPath}`);
      } catch (cleanupErr) {
        console.error('Failed to cleanup file:', cleanupErr);
      }
    }
  }
});

module.exports = router;

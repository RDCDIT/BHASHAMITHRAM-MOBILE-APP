require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const connectDB = require('../config/db');
const MigrationReporter = require('./reporter');

const MAPPING_FILE = path.join(__dirname, 'config', 'mapping.json');
const BATCH_SIZE = 10000;

// Promise wrappers for SQLite3
function openDatabase(filePath) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filePath, sqlite3.OPEN_READONLY, (err) => {
      if (err) reject(err);
      else resolve(db);
    });
  });
}

function queryAll(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

async function runMigration(sqlitePath, targetDbName) {
  if (!sqlitePath) {
    throw new Error('SQLite database or SQL script file path is required.');
  }

  let absoluteSqlitePath = path.resolve(sqlitePath);
  if (!fs.existsSync(absoluteSqlitePath)) {
    throw new Error(`File not found at: ${absoluteSqlitePath}`);
  }

  let tempDbPath = null;
  const isSqlScript = absoluteSqlitePath.endsWith('.sql');

  if (isSqlScript) {
    console.log(`📜 Detected SQL script file: ${absoluteSqlitePath}`);
    tempDbPath = path.join(path.dirname(absoluteSqlitePath), `temp-migration-${Date.now()}.db`);
    console.log(`🔨 Building temporary SQLite database at: ${tempDbPath}`);

    // Create the temporary SQLite database
    const tempDb = new sqlite3.Database(tempDbPath);
    let sqlContent = fs.readFileSync(absoluteSqlitePath, 'utf8');

    // Sanitization: Remove MySQL-specific COLLATE, CHARACTER SET, ENGINE and AUTO_INCREMENT clauses
    sqlContent = sqlContent
      .replace(/COLLATE\s+[a-zA-Z0-9_]+/gi, '')
      .replace(/CHARACTER\s+SET\s+[a-zA-Z0-9_]+/gi, '')
      .replace(/CHARSET\s*=\s*[a-zA-Z0-9_]+/gi, '')
      .replace(/ENGINE\s*=\s*[a-zA-Z0-9_]+/gi, '')
      .replace(/AUTO_INCREMENT\s*=\s*\d+/gi, '');

    // Run the SQL script execution
    try {
      await new Promise((resolve, reject) => {
        tempDb.exec(sqlContent, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log('✅ SQL script execution completed successfully.');
    } catch (sqlErr) {
      tempDb.close();
      if (fs.existsSync(tempDbPath)) {
        fs.unlinkSync(tempDbPath);
      }
      throw new Error(`Failed to execute SQL script: ${sqlErr.message}`);
    }
    tempDb.close();
    absoluteSqlitePath = tempDbPath;
  }

  console.log(`🚀 Starting migration from source: ${absoluteSqlitePath}`);

  // Connect to MongoDB
  let connection;
  try {
    const dbName = targetDbName || process.env.MIGRATION_DB_NAME || 'Imported_Dictionary';
    console.log(`📡 Connecting to MongoDB to verify database existence...`);
    connection = await connectDB(dbName);

    const mongoose = require('mongoose');
    const adminDb = mongoose.connection.client.db().admin();
    const { databases } = await adminDb.listDatabases();
    const exists = databases.some(db => db.name.toLowerCase() === dbName.toLowerCase());

    if (exists) {
      throw new Error(`Database "${dbName}" already exists. Please choose a different database name.`);
    }

    console.log(`📡 Connected to new MongoDB database: "${dbName}"`);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB / Database check failed:', err.message);
    if (connection) {
      await connection.disconnect();
    }
    throw err;
  }

  // Load configuration mapping
  let mappingConfig = { mappings: {} };
  if (fs.existsSync(MAPPING_FILE)) {
    try {
      mappingConfig = JSON.parse(fs.readFileSync(MAPPING_FILE, 'utf8'));
    } catch (err) {
      console.warn(`⚠️ Warning: Failed to parse mapping config. Using empty mappings.`, err.message);
    }
  } else {
    console.warn(`⚠️ Warning: Mapping config file not found at ${MAPPING_FILE}.`);
  }

  // Open SQLite database
  let sqliteDb;
  try {
    sqliteDb = await openDatabase(absoluteSqlitePath);
  } catch (err) {
    console.error('❌ Failed to open SQLite database:', err.message);
    if (connection) {
      await connection.disconnect();
    }
    throw err;
  }

  const reporter = new MigrationReporter();

  // Helper to parse nested SQLite fields dynamically for schemaless MongoDB import
  function transformRowSchemaless(row) {
    const doc = { ...row };
    
    // Map SQLite 'id' column to MongoDB '_id' if present
    if (row.id !== undefined && row._id === undefined) {
      doc._id = row.id;
      delete doc.id;
    }
    
    // Auto-parse any string columns that represent stringified JSON arrays or objects
    for (const key of Object.keys(doc)) {
      const val = doc[key];
      if (typeof val === 'string' && val.trim() !== '') {
        const trimmed = val.trim();
        if (
          (trimmed.startsWith('[') && trimmed.endsWith(']')) ||
          (trimmed.startsWith('{') && trimmed.endsWith('}'))
        ) {
          try {
            doc[key] = JSON.parse(val);
          } catch (e) {
            // Keep original string if JSON parsing fails
          }
        }
      }
    }
    return doc;
  }

  try {
    const mongoose = require('mongoose');
    const mongoDb = mongoose.connection.db;
    if (!mongoDb) {
      throw new Error('MongoDB database object not initialized.');
    }

    // 1. Discover all tables in SQLite
    const tablesQuery = "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'";
    const tablesResult = await queryAll(sqliteDb, tablesQuery);
    const discoveredTables = tablesResult.map(row => row.name);

    console.log(`Discovered tables in SQLite: ${discoveredTables.join(', ')}`);

    // 2. Loop over discovered tables
    for (const tableName of discoveredTables) {
      console.log(`\nProcessing table: "${tableName}"`);
      reporter.startTable(tableName);

      const collection = mongoDb.collection(tableName);

      // Read & insert in batches
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        try {
          const rows = await queryAll(
            sqliteDb,
            `SELECT * FROM "${tableName}" LIMIT ? OFFSET ?`,
            [BATCH_SIZE, offset]
          );

          if (rows.length === 0) {
            hasMore = false;
            break;
          }

          reporter.incrementRead(tableName, rows.length);

          // Transform records dynamically
          const transformedRows = [];
          for (const row of rows) {
            try {
              transformedRows.push(transformRowSchemaless(row));
            } catch (transformErr) {
              reporter.incrementFailed(tableName, 1);
              reporter.addError(tableName, new Error(`Row transformation failed: ${transformErr.message}`));
            }
          }

          // Bulk Insert into MongoDB Collection
          if (transformedRows.length > 0) {
            try {
              // Use insertMany with ordered: false to allow non-failing inserts to succeed
              await collection.insertMany(transformedRows, { ordered: false });
              reporter.incrementInserted(tableName, transformedRows.length);
            } catch (bulkErr) {
              if (bulkErr.name === 'BulkWriteError' || bulkErr.code === 11000 || bulkErr.writeErrors) {
                const writeErrors = bulkErr.writeErrors || [];
                const failedCount = writeErrors.length;
                const succeededCount = transformedRows.length - failedCount;

                reporter.incrementInserted(tableName, succeededCount);
                reporter.incrementFailed(tableName, failedCount);

                writeErrors.forEach(e => {
                  const innerError = e.err || {};
                  const errmsg = innerError.errmsg || innerError.message || e.errmsg || e.message || 'Duplicate key or validation error';
                  reporter.addError(tableName, new Error(`BulkWriteError [index ${e.index}]: ${errmsg}`));
                });
              } else {
                reporter.incrementFailed(tableName, transformedRows.length);
                reporter.addError(tableName, bulkErr);
              }
            }
          }

          offset += BATCH_SIZE;
        } catch (batchErr) {
          console.error(`❌ Error in batch processing for table "${tableName}" at offset ${offset}:`, batchErr.message);
          reporter.addError(tableName, batchErr);
          hasMore = false; // Stop this table processing on critical batch fetch error
        }
      }

      reporter.endTable(tableName);
    }

  } catch (err) {
    console.error('❌ Critical migration system error:', err.message);
  } finally {
    // Clean up connections and output summary
    if (sqliteDb) {
      sqliteDb.close();
    }
    // Generate migration summary report
    reporter.generateSummary();
    
    // Disconnect Mongoose
    if (connection) {
      await connection.disconnect();
      console.log('🔌 Disconnected from MongoDB.');
    }

    // Clean up temporary SQLite database file if it was created
    if (tempDbPath && fs.existsSync(tempDbPath)) {
      try {
        fs.unlinkSync(tempDbPath);
        console.log(`🧹 Cleaned up temporary database: ${tempDbPath}`);
      } catch (cleanupErr) {
        console.error('⚠️ Failed to delete temporary database:', cleanupErr.message);
      }
    }
  }

  return reporter.stats;
}

if (require.main === module) {
  const cliPath = process.argv[2] || process.env.SQLITE_DB_PATH;
  runMigration(cliPath).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runMigration };

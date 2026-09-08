const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// ---------------- Paths ----------------

const DB_PATH = path.join(__dirname, "../assets/dictionary.db");

const JSON_FILES = [
  {
    table: "malayalam_dictionary",
    file: "../mongo_upload/malayalam_malayalam_dictionary.json",
  },
  {
    table: "english_dictionary",
    file: "../mongo_upload/english_malayalam_dictionary.json",
  },
  {
    table: "malayalam_english",
    file: "../mongo_upload/malayalam_english_dictionary.json",
  },
  {
    table: "synonyms",
    file: "../mongo_upload/malayalam_synonyms.json",
  },
];

// ---------------- Delete old DB ----------------

if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log("Old database removed.");
}

// ---------------- Open DB ----------------

const db = new sqlite3.Database(DB_PATH);

db.serialize(() => {

  JSON_FILES.forEach(({ table, file }) => {

    // Create table
    db.run(`
      CREATE TABLE ${table}(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        word TEXT NOT NULL,
        meaning TEXT,
        category TEXT,
        json TEXT NOT NULL
      );
    `);

    // Index
    db.run(`
      CREATE INDEX idx_${table}_word
      ON ${table}(word);
    `);

    // Read JSON
    const fullPath = path.join(__dirname, file);

    const rows = JSON.parse(
      fs.readFileSync(fullPath, "utf8")
    );

    // Prepare insert
    const stmt = db.prepare(`
      INSERT INTO ${table}
      (word, meaning, category, json)
      VALUES (?, ?, ?, ?)
    `);

    rows.forEach((item) => {

      const meaning =
        item.meanings && item.meanings.length
          ? item.meanings[0].meaning
          : "";

      const category =
        item.category && item.category.length
          ? item.category.join(", ")
          : "";

      stmt.run(
        item.word || "",
        meaning,
        category,
        JSON.stringify(item)
      );

    });

    stmt.finalize();

    console.log(`${table}: ${rows.length} rows inserted`);

  });

});

db.close(() => {

  console.log("");
  console.log("SQLite database created successfully.");
  console.log(DB_PATH);

});
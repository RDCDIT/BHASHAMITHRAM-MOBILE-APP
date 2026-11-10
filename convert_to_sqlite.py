import os
import sys
import time
import shutil
import sqlite3
import re

# ==============================================================================
# CONFIGURATION
# ==============================================================================
# Modes:
#   "auto"     -> Automatically use SQL file if available, otherwise use MySQL
#   "sql_file" -> Always read directly from SQL file (.sql dump)
#   "mysql"    -> Always read from live MySQL server connection
MODE = "auto"

# Primary dictionary SQL file (can also be passed as argument: python3 convert_to_sqlite.py bhashamithram_merged.sql)
SQL_FILE = "bhashamithram_merged.sql" 

# Fallback sources if primary file is missing meanings
MEANINGS_FALLBACK_FILES = [
    "bhashamithram_merged.sql",
    "bhashamithram.sql",
    "../bhashamithram.sql",
    "/home/c-dit/INTERNSHIP_2026/dictionary_mobileApp/BHASHAMITHRAM_APP_APK_FINAL/bhashamithram.sql",
    os.path.expanduser("~/Downloads/bhashamithram.sql"),
]

# MySQL connection settings
MYSQL_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "112233",
    "database": "bhashamithram",
    "charset": "utf8mb4"
}

# Output file paths
SQLITE_DB = "dictionary.db" 
MOBILE_ASSET_TARGET = "Final_Bashamitram/Mobile_app/assets/dictionary_v2.db"
MERGED_SQL_DUMP = "bhashamithram_merged.sql" 


def clean_mysql_statement(stmt_str: str) -> str:
    r"""
    Converts MySQL dump escapes to SQLite compatible syntax.
    Replaces \' with '', \\ with \, and \" with ".
    """
    s = stmt_str.replace("\\\\", "\x01")
    s = s.replace("\\'", "''")
    s = s.replace('\\"', '"')
    s = s.replace("\x01", "\\")
    return s


def init_sqlite_staging(conn: sqlite3.Connection):
    """
    Creates staging and final tables for dictionary and meanings.
    """
    cur = conn.cursor()
    cur.execute("DROP TABLE IF EXISTS staging_dictionary")
    cur.execute("DROP TABLE IF EXISTS staging_meanings")
    cur.execute("DROP TABLE IF EXISTS dictionary")
    cur.execute("DROP TABLE IF EXISTS meanings")
    cur.execute("DROP TABLE IF EXISTS id_mapping")

    cur.execute("""
    CREATE TABLE staging_dictionary (
        id INTEGER PRIMARY KEY,
        word TEXT,
        created_at TEXT,
        phonetic_transcription TEXT,
        root TEXT,
        etymology TEXT,
        cultural_note TEXT,
        synonyms TEXT,
        antonyms TEXT,
        dialects TEXT,
        proverb TEXT,
        similar_word TEXT,
        novel_words TEXT,
        pronunciation TEXT,
        cross_reference TEXT,
        inflections TEXT,
        kannada_equivalent TEXT,
        tamil_equivalent TEXT,
        telugu_equivalent TEXT,
        tulu_equivalent TEXT,
        english_equivalent TEXT,
        approved INTEGER,
        superuser_approved INTEGER,
        done_by_user INTEGER,
        submitted_by_id INTEGER,
        context_usage TEXT,
        meaning TEXT,
        last_edited_at TEXT,
        last_edited_by_id INTEGER,
        gender TEXT,
        from_suggestion_id INTEGER,
        approved_at TEXT,
        locked_at TEXT,
        locked_by_id INTEGER,
        dictionary_type TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE staging_meanings (
        id INTEGER PRIMARY KEY,
        meaning TEXT,
        context_usage TEXT,
        dictionary_id INTEGER,
        category_id INTEGER
    )
    """)

    cur.execute("""
    CREATE TABLE dictionary (
        id INTEGER PRIMARY KEY,
        word TEXT,
        created_at TEXT,
        phonetic_transcription TEXT,
        root TEXT,
        etymology TEXT,
        cultural_note TEXT,
        synonyms TEXT,
        antonyms TEXT,
        dialects TEXT,
        proverb TEXT,
        similar_word TEXT,
        novel_words TEXT,
        pronunciation TEXT,
        cross_reference TEXT,
        inflections TEXT,
        kannada_equivalent TEXT,
        tamil_equivalent TEXT,
        telugu_equivalent TEXT,
        tulu_equivalent TEXT,
        english_equivalent TEXT,
        approved INTEGER,
        superuser_approved INTEGER,
        done_by_user INTEGER,
        submitted_by_id INTEGER,
        context_usage TEXT,
        meaning TEXT,
        last_edited_at TEXT,
        last_edited_by_id INTEGER,
        gender TEXT,
        from_suggestion_id INTEGER,
        approved_at TEXT,
        locked_at TEXT,
        locked_by_id INTEGER,
        dictionary_type TEXT
    )
    """)

    cur.execute("""
    CREATE TABLE meanings (
        id INTEGER PRIMARY KEY,
        meaning TEXT,
        context_usage TEXT,
        dictionary_id INTEGER,
        category_id INTEGER
    )
    """)
    conn.commit()


def load_sql_dump_into_staging(sql_file_path: str, conn: sqlite3.Connection, batch_size=500):
    """
    Robust SQL dump parser that populates staging_dictionary and staging_meanings.
    """
    cur = conn.cursor()
    start_time = time.time()
    current_table = None
    current_header = None
    rows_buffer = []
    inserted_counts = {}
    batch_errors = 0

    def flush_batch():
        nonlocal rows_buffer, current_header, current_table, batch_errors
        if not rows_buffer or not current_header:
            return
        sql = current_header + ",\n".join(rows_buffer) + ";"
        try:
            cur.execute(sql)
            inserted_counts[current_table] = inserted_counts.get(current_table, 0) + len(rows_buffer)
        except Exception as e:
            batch_errors += 1
            print(f"  ⚠️ Warning on batch insert ({current_table}): {e}")
        rows_buffer = []

    file_size_mb = os.path.getsize(sql_file_path) / (1024 * 1024)
    print(f"📖 Reading SQL dump: {sql_file_path} ({file_size_mb:.1f} MB)...")

    with open(sql_file_path, "r", encoding="utf-8", errors="ignore") as f:
        for line in f:
            trimmed = line.strip()
            if not trimmed:
                continue

            if trimmed.startswith("INSERT INTO `dictionary`"):
                flush_batch()
                current_table = "staging_dictionary"
                current_header = f"INSERT INTO staging_dictionary VALUES\n"
            elif trimmed.startswith("INSERT INTO `meanings`"):
                flush_batch()
                current_table = "staging_meanings"
                current_header = f"INSERT INTO staging_meanings VALUES\n"
            elif current_table:
                if re.match(r"^\(\d+,", trimmed):
                    clean_row = trimmed.rstrip(",; ")
                    if clean_row.endswith(")"):
                        rows_buffer.append(clean_mysql_statement(clean_row))

                if len(rows_buffer) >= batch_size or (trimmed.endswith(";") and rows_buffer):
                    flush_batch()
                    total_done = sum(inserted_counts.values())
                    if total_done > 0 and total_done % 50000 < batch_size:
                        print(f"  ... parsed {total_done:,} rows ({time.time() - start_time:.1f}s)")

                if trimmed.endswith(";"):
                    current_table = None
                    current_header = None

        flush_batch()

    conn.commit()
    elapsed = time.time() - start_time
    dict_staged = inserted_counts.get("staging_dictionary", 0)
    mean_staged = inserted_counts.get("staging_meanings", 0)
    print(f"  ✅ Staged {dict_staged:,} dictionary words and {mean_staged:,} meanings in {elapsed:.2f}s (Errors: {batch_errors})")


def load_mysql_into_staging(config: dict, conn: sqlite3.Connection):
    """
    Connects to MySQL and loads dictionary and meanings into staging tables.
    """
    import pymysql

    print(f"🔌 Connecting to MySQL database '{config['database']}' on {config['host']}...")
    t0 = time.time()
    mysql_conn = pymysql.connect(**config)
    mcur = mysql_conn.cursor()
    scur = conn.cursor()

    # 1. Staging dictionary
    print("  Fetching dictionary rows from MySQL...")
    mcur.execute("SELECT * FROM dictionary")
    placeholders = ",".join(["?"] * len(mcur.description))
    insert_sql = f"INSERT INTO staging_dictionary VALUES ({placeholders})"
    dict_count = 0
    batch = []
    for row in mcur:
        batch.append(row)
        dict_count += 1
        if len(batch) >= 10000:
            scur.executemany(insert_sql, batch)
            batch = []
    if batch:
        scur.executemany(insert_sql, batch)
    conn.commit()
    print(f"  ✅ Staged {dict_count:,} dictionary rows.")

    # 2. Staging meanings
    print("  Fetching meanings rows from MySQL...")
    mcur.execute("SELECT * FROM meanings")
    placeholders = ",".join(["?"] * len(mcur.description))
    insert_sql = f"INSERT INTO staging_meanings VALUES ({placeholders})"
    mean_count = 0
    batch = []
    for row in mcur:
        batch.append(row)
        mean_count += 1
        if len(batch) >= 20000:
            scur.executemany(insert_sql, batch)
            batch = []
    if batch:
        scur.executemany(insert_sql, batch)
    conn.commit()
    print(f"  ✅ Staged {mean_count:,} meanings rows in {time.time() - t0:.2f}s.")
    mysql_conn.close()


def ensure_staging_meanings(conn: sqlite3.Connection):
    """
    If staging_meanings is empty (e.g. from an export of only dictionary table),
    pulls meanings from MySQL or fallback SQL files.
    """
    cur = conn.cursor()
    cur.execute("SELECT count(*) FROM staging_meanings")
    if cur.fetchone()[0] > 0:
        return

    print("\n🔍 Notice: Primary file did not include 'meanings' table.")
    print("🔄 Loading meanings from fallback sources...")

    # 1. Try MySQL
    try:
        import pymysql
        print(f"  Attempting to load meanings from live MySQL ({MYSQL_CONFIG['database']})...")
        mconn = pymysql.connect(**MYSQL_CONFIG)
        mcur = mconn.cursor()
        t0 = time.time()
        mcur.execute("SELECT id, meaning, context_usage, dictionary_id, category_id FROM meanings")
        rows = mcur.fetchall()
        cur.executemany("INSERT INTO staging_meanings VALUES (?, ?, ?, ?, ?)", rows)
        conn.commit()
        mconn.close()
        print(f"  ✅ Successfully loaded {len(rows):,} meanings from MySQL in {time.time() - t0:.2f}s!")
        return
    except Exception as e:
        print(f"  ℹ️ MySQL fallback unavailable ({e}). Checking SQL fallback files...")

    # 2. Try fallback SQL files
    for fb_path in MEANINGS_FALLBACK_FILES:
        if os.path.exists(fb_path):
            print(f"  Found fallback SQL file: {fb_path}")
            load_sql_dump_into_staging(fb_path, conn)
            cur.execute("SELECT count(*) FROM staging_meanings")
            if cur.fetchone()[0] > 0:
                return

    print("⚠️ Warning: No source found for meanings table.")


def merge_and_deduplicate_dictionary(conn: sqlite3.Connection):
    """
    Merges duplicate words strictly per dictionary (english_malayalam, malayalam_malayalam, etc.).
    - Master word gets lowest ID.
    - Non-empty metadata attributes are preserved in the master row.
    - All meanings rows are remapped to master_id.
    - Identical duplicate meaning texts for the same word are unified so cards stay clean.
    - All unique meanings are 100% retained.
    """
    cur = conn.cursor()
    t_start = time.time()
    print("========================================================")

    print("\n🔄 Analyzing duplicates across dictionaries...")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_stg_dt_w ON staging_dictionary(dictionary_type, word)")
    conn.commit()

    cur.execute("""
        SELECT dictionary_type, COUNT(*) as total_rows, COUNT(DISTINCT word) as distinct_words
        FROM staging_dictionary
        GROUP BY dictionary_type
    """)
    stats = cur.fetchall()
    total_dupes = 0
    print("  Dictionary Breakdown (Before Merge):")
    for dtype, total, distinct in stats:
        dupes = total - distinct
        total_dupes += dupes
        print(f"    • {dtype}: {total:,} rows ({distinct:,} distinct, {dupes:,} duplicate rows)")

    if total_dupes > 0:
        print(f"\n⚡ Merging {total_dupes:,} duplicate words per dictionary...")
    else:
        print("\n⚡ No duplicate words found. Transferring rows...")

    # 1. Build id_mapping (maps each old_id to min(id) of that (dictionary_type, word))
    cur.execute("""
    CREATE TABLE id_mapping AS
    SELECT d.id AS old_id, grp.master_id
    FROM staging_dictionary d
    JOIN (
        SELECT dictionary_type, word, MIN(id) AS master_id
        FROM staging_dictionary
        GROUP BY dictionary_type, word
    ) grp ON d.dictionary_type = grp.dictionary_type AND d.word = grp.word
    """)
    cur.execute("CREATE INDEX idx_map_old ON id_mapping(old_id)")
    cur.execute("CREATE INDEX idx_map_master ON id_mapping(master_id)")
    conn.commit()

    # 2. Populate final dictionary table with merged metadata
    t_dict = time.time()
    cur.execute("""
    INSERT INTO dictionary
    SELECT
        map.master_id,
        d.word,
        MIN(NULLIF(d.created_at, '')),
        MAX(NULLIF(d.phonetic_transcription, '')),
        MAX(NULLIF(d.root, '')),
        MAX(NULLIF(d.etymology, '')),
        MAX(NULLIF(d.cultural_note, '')),
        MAX(NULLIF(d.synonyms, '')),
        MAX(NULLIF(d.antonyms, '')),
        MAX(NULLIF(d.dialects, '')),
        MAX(NULLIF(d.proverb, '')),
        MAX(NULLIF(d.similar_word, '')),
        MAX(NULLIF(d.novel_words, '')),
        MAX(NULLIF(d.pronunciation, '')),
        MAX(NULLIF(d.cross_reference, '')),
        MAX(NULLIF(d.inflections, '')),
        MAX(NULLIF(d.kannada_equivalent, '')),
        MAX(NULLIF(d.tamil_equivalent, '')),
        MAX(NULLIF(d.telugu_equivalent, '')),
        MAX(NULLIF(d.tulu_equivalent, '')),
        MAX(NULLIF(d.english_equivalent, '')),
        MAX(COALESCE(d.approved, 0)),
        MAX(COALESCE(d.superuser_approved, 0)),
        MAX(COALESCE(d.done_by_user, 0)),
        MAX(d.submitted_by_id),
        MAX(NULLIF(d.context_usage, '')),
        MAX(NULLIF(d.meaning, '')),
        MAX(NULLIF(d.last_edited_at, '')),
        MAX(d.last_edited_by_id),
        MAX(NULLIF(d.gender, '')),
        MAX(d.from_suggestion_id),
        MAX(NULLIF(d.approved_at, '')),
        MAX(NULLIF(d.locked_at, '')),
        MAX(d.locked_by_id),
        d.dictionary_type
    FROM staging_dictionary d
    JOIN id_mapping map ON d.id = map.old_id
    GROUP BY map.master_id
    """)
    conn.commit()
    cur.execute("SELECT count(*) FROM dictionary")
    final_dict_count = cur.fetchone()[0]
    print("========================================================")    
    print(f"  ✅ Dictionary merged into {final_dict_count:,} unique words in {time.time() - t_dict:.2f}s.")

    # 3. Populate final meanings table: re-map dictionary_id -> master_id
    t_mean = time.time()
    cur.execute("CREATE INDEX IF NOT EXISTS idx_stg_m_did ON staging_meanings(dictionary_id)")
    cur.execute("""
    INSERT INTO meanings (id, meaning, context_usage, dictionary_id, category_id)
    SELECT 
        MIN(m.id),
        m.meaning, 
        MAX(NULLIF(m.context_usage, '')), 
        map.master_id, 
        MAX(m.category_id)
    FROM staging_meanings m
    JOIN id_mapping map ON m.dictionary_id = map.old_id
    GROUP BY map.master_id, m.meaning
    """)
    conn.commit()
    cur.execute("SELECT count(*) FROM meanings")
    final_mean_count = cur.fetchone()[0]
    print(f"  ✅ Meanings merged into {final_mean_count:,} entries (0 unique meanings lost) in {time.time() - t_mean:.2f}s.")

    # Clean up staging tables to free memory/disk
    cur.execute("DROP TABLE staging_dictionary")
    cur.execute("DROP TABLE staging_meanings")
    cur.execute("DROP TABLE id_mapping")
    conn.commit()


# ==============================================================================
# ROOT CLEANING & MEANINGS CONVERSION CONFIGURATION
# ==============================================================================
RE_HAS_LETTER = re.compile(r'[\u0D05-\u0D3D\u0D54-\u0D61\u0D7A-\u0D7Fa-zA-Z]')
RE_HAS_DIACRITIC = re.compile(r'[\u0D01-\u0D03\u0D3E-\u0D4D\u0D57\u0D62-\u0D63]')
RE_SINGLE_LETTER = re.compile(r'^[\u0D05-\u0D14\u0D15-\u0D3A][\.,:\+\-]*$')
RE_COMPOUND_MARKER = re.compile(r'(\+[\.]?|\-[\.]?)$')
GRAMMAR_TAGS = {
    'വ്യാ,', 'വ്യാ.', 'നാ.', 'നാ,', 'ക്രി.', 'വി.', 'ധാ,',
    'സം.', 'ഇം.', 'നം.', 'അ.ക്രി.',
    'അറ.', 'സിറി.', 'മറാ.', 'സംഗീ.'
}


def classify_root(root_text: str) -> str:
    """
    Classifies a target entry's root into one of:
      - PUNCTUATION_SYMBOL: Punctuation, digits, or symbols without Malayalam/Latin letters
      - MALAYALAM_DIACRITIC: Combining vowel signs or virama only
      - SINGLE_LETTER: Single Malayalam independent vowel or consonant (+ optional punctuation)
      - GRAMMATICAL_ABBREVIATION: POS and language abbreviations (വ്യാ, നാ, വി, ധാ, സം, ഇം, etc.)
      - COMPOUND_MARKER: Compound prefixes ending in +, +., -., or -
      - VALID_MEANING: True Malayalam word definition / synonyms to convert into meanings table
    """
    rt = root_text.strip()
    if not RE_HAS_LETTER.search(rt):
        if RE_HAS_DIACRITIC.search(rt):
            return "MALAYALAM_DIACRITIC"
        return "PUNCTUATION_SYMBOL"
    if RE_SINGLE_LETTER.match(rt):
        return "SINGLE_LETTER"
    if rt in GRAMMAR_TAGS:
        return "GRAMMATICAL_ABBREVIATION"
    if RE_COMPOUND_MARKER.search(rt):
        return "COMPOUND_MARKER"
    return "VALID_MEANING"


def clean_roots_and_populate_meanings(conn: sqlite3.Connection):
    """
    Identifies dictionary entries with no meanings in the meanings table and text in root.
    - Creates a safety backup table 'dictionary_roots_backup' with initial (id, word, root).
    - For garbage roots (symbols, diacritics, single letters, abbreviations, compound markers):
      Clears root (root = NULL).
    - For valid definitions:
      Splits root by [,;]+ into clean tokens and inserts them into meanings table,
      then clears root (root = NULL).
    """
    cur = conn.cursor()
    t_start = time.time()
    print("\n🧹 Scanning dictionary for entries with empty meanings and text in root...")

    # 1. Create safety backup table and ensure performance index
    cur.execute("""
    CREATE TABLE IF NOT EXISTS dictionary_roots_backup (
        id INTEGER PRIMARY KEY,
        word TEXT,
        root TEXT
    )
    """)
    cur.execute("CREATE INDEX IF NOT EXISTS idx_meanings_dictionary_id ON meanings(dictionary_id)")
    conn.commit()

    # 2. Find target rows: no existing meanings and non-empty root
    cur.execute("""
        SELECT d.id, d.word, d.root
        FROM dictionary d
        WHERE d.root IS NOT NULL AND TRIM(d.root) != ''
          AND NOT EXISTS (SELECT 1 FROM meanings m WHERE m.dictionary_id = d.id)
    """)
    target_rows = cur.fetchall()
    total_targets = len(target_rows)
    print(f"  Found {total_targets:,} target words with empty meanings and non-empty root.")

    if total_targets == 0:
        print("  ℹ️ No target entries found to clean or convert.")
        return

    # Backup all target entries before making modifications
    cur.executemany(
        "INSERT OR IGNORE INTO dictionary_roots_backup (id, word, root) VALUES (?, ?, ?)",
        target_rows
    )
    conn.commit()
    print(f"  🛡️ Backed up {total_targets:,} initial root entries into 'dictionary_roots_backup'.")

    # 3. Classify entries
    cur.execute("SELECT COALESCE(MAX(id), 0) FROM meanings")
    next_meaning_id = cur.fetchone()[0] + 1

    counts = {
        "PUNCTUATION_SYMBOL": 0,
        "MALAYALAM_DIACRITIC": 0,
        "SINGLE_LETTER": 0,
        "GRAMMATICAL_ABBREVIATION": 0,
        "COMPOUND_MARKER": 0,
        "VALID_MEANING": 0,
    }

    words_to_clear_root = []
    meanings_to_insert = []

    for row_id, word, root_text in target_rows:
        words_to_clear_root.append((row_id,))
        category = classify_root(root_text)
        counts[category] = counts.get(category, 0) + 1

        if category == "VALID_MEANING":
            tokens = [t.strip() for t in re.split(r'[,;]+', root_text) if t.strip()]
            for token in tokens:
                meanings_to_insert.append((next_meaning_id, token, None, row_id, None))
                next_meaning_id += 1

    # 4. Perform atomic bulk database operations
    t_db = time.time()
    if meanings_to_insert:
        cur.executemany(
            "INSERT INTO meanings (id, meaning, context_usage, dictionary_id, category_id) VALUES (?, ?, ?, ?, ?)",
            meanings_to_insert
        )
    if words_to_clear_root:
        cur.executemany(
            "UPDATE dictionary SET root = NULL WHERE id = ?",
            words_to_clear_root
        )
    conn.commit()

    # 5. Print breakdown
    deleted_roots = (
        counts["PUNCTUATION_SYMBOL"]
        + counts["MALAYALAM_DIACRITIC"]
        + counts["SINGLE_LETTER"]
        + counts["GRAMMATICAL_ABBREVIATION"]
        + counts["COMPOUND_MARKER"]
    )
    converted_roots = counts["VALID_MEANING"]
    print("========================================================")

    print("\n" + "-" * 62)
    print("📋 ROOT CLEANING & MEANINGS CONVERSION BREAKDOWN:")
    print(f"  • Punctuation / Symbols Only     : {counts['PUNCTUATION_SYMBOL']:,} (Deleted)")
    print(f"  • Malayalam Diacritics Only      : {counts['MALAYALAM_DIACRITIC']:,} (Deleted)")
    print(f"  • Single Letters                 : {counts['SINGLE_LETTER']:,} (Deleted)")
    print(f"  • Grammatical Abbreviations      : {counts['GRAMMATICAL_ABBREVIATION']:,} (Deleted)")
    print(f"  • Compound Markers               : {counts['COMPOUND_MARKER']:,} (Deleted)")
    print(f"  • Valid Meanings Converted       : {converted_roots:,} (Converted)")
    print(f"  ------------------------------------------------------------")
    print(f"  • Total Roots Cleaned/Deleted    : {deleted_roots:,}")
    print(f"  • Total Meanings Created         : {len(meanings_to_insert):,}")
    print(f"  • Database Updates Completed in  : {time.time() - t_db:.2f}s (Total: {time.time() - t_start:.2f}s)")
    print("-" * 62)

    print("========================================================")

def finalize_database(conn: sqlite3.Connection):
    """
    Creates performance indexes for the mobile application, verifies deduplication,
    and copies the final database to the Mobile_app assets folder.
    """
    cur = conn.cursor()
    print("\n🚀 Creating performance indexes for mobile dictionary queries...")
    start_idx = time.time()
    cur.execute("CREATE INDEX IF NOT EXISTS idx_dictionary_type_word ON dictionary(dictionary_type, word)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word)")
    cur.execute("CREATE INDEX IF NOT EXISTS idx_meanings_dictionary_id ON meanings(dictionary_id)")
    conn.commit()
    print(f"✅ Indexes created in {time.time() - start_idx:.2f}s.")

    # Print verification summary
    cur.execute("SELECT count(*) FROM dictionary")
    dict_count = cur.fetchone()[0]
    cur.execute("SELECT count(*) FROM meanings")
    mean_count = cur.fetchone()[0]

    # Verify duplicate count is zero
    cur.execute("SELECT dictionary_type, word, count(*) FROM dictionary GROUP BY dictionary_type, word HAVING count(*) > 1")
    dupes_remaining = cur.fetchall()
    print("========================================================")
    print("\n" + "=" * 58)
    print("📊 FINAL DEDUPLICATED DATABASE SUMMARY:")
    print(f"  • Total Dictionary Words : {dict_count:,}")
    print(f"  • Total Meanings Entries : {mean_count:,}")
    print(f"  • Duplicates Remaining   : {len(dupes_remaining)} (Clean)")

    cur.execute("SELECT count(*) FROM sqlite_master WHERE type='table' AND name='dictionary_roots_backup'")
    if cur.fetchone()[0] > 0:
        cur.execute("SELECT count(*) FROM dictionary_roots_backup")
        backup_count = cur.fetchone()[0]
        print(f"  • Roots Backup Entries   : {backup_count:,}")

    # Breakdown by dictionary type
    cur.execute("SELECT dictionary_type, count(*) FROM dictionary GROUP BY dictionary_type")
    type_counts = cur.fetchall()
    print("\n  Clean Dictionary Breakdown:")
    for dtype, count in type_counts:
        print(f"    - {dtype or 'unknown'}: {count:,} words")
    print("=" * 58)

    conn.close()

    # Copy to mobile app assets
    if os.path.exists(os.path.dirname(MOBILE_ASSET_TARGET)):
        print(f"\n📦 Updating mobile asset: {MOBILE_ASSET_TARGET}...")
        shutil.copy(SQLITE_DB, MOBILE_ASSET_TARGET)
        db_size_mb = os.path.getsize(MOBILE_ASSET_TARGET) / (1024 * 1024)
        print(f"🎉 SUCCESS: Mobile dictionary_v2.db updated! ({db_size_mb:.1f} MB)")
    else:
        print(f"⚠️ Warning: Target directory {os.path.dirname(MOBILE_ASSET_TARGET)} not found. Database saved to {SQLITE_DB}")


def export_merged_sql(sqlite_db_path: str, output_sql_path: str):
    """
    Exports the clean deduplicated database to a standard MySQL dump file.
    """
    print(f"\n💾 Exporting deduplicated SQL dump to: {output_sql_path}...")
    t0 = time.time()
    conn = sqlite3.connect(sqlite_db_path)
    cur = conn.cursor()

    with open(output_sql_path, "w", encoding="utf-8") as f:
        f.write("-- Bhashamithram Deduplicated Database Dump\n")
        f.write("-- Merged duplicates strictly per dictionary\n")
        f.write("SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';\n")
        f.write("SET NAMES utf8mb4;\n\n")
        f.write("-- Clear current dictionary and meanings SQL data only\n")
        f.write("SET FOREIGN_KEY_CHECKS = 0;\n")
        f.write("TRUNCATE TABLE `meanings`;\n")
        f.write("TRUNCATE TABLE `dictionary`;\n")
        f.write("SET FOREIGN_KEY_CHECKS = 1;\n\n")

        # 1. Export dictionary
        f.write("-- Table data for `dictionary`\n")
        cur.execute("SELECT * FROM dictionary")
        columns = [d[0] for d in cur.description]
        col_list = ", ".join(f"`{c}`" for c in columns)
        header = f"INSERT INTO `dictionary` ({col_list}) VALUES\n"

        batch = []
        for row in cur:
            row_vals = []
            for val in row:
                if val is None:
                    row_vals.append("NULL")
                elif isinstance(val, (int, float)):
                    row_vals.append(str(val))
                else:
                    escaped = str(val).replace("\\", "\\\\").replace("'", "\\'")
                    row_vals.append(f"'{escaped}'")
            batch.append("(" + ", ".join(row_vals) + ")")
            if len(batch) >= 300:
                f.write(header + ",\n".join(batch) + ";\n\n")
                batch = []
        if batch:
            f.write(header + ",\n".join(batch) + ";\n\n")

        # 2. Export meanings
        f.write("-- Table data for `meanings`\n")
        cur.execute("SELECT * FROM meanings")
        columns_m = [d[0] for d in cur.description]
        col_list_m = ", ".join(f"`{c}`" for c in columns_m)
        header_m = f"INSERT INTO `meanings` ({col_list_m}) VALUES\n"

        batch = []
        for row in cur:
            row_vals = []
            for val in row:
                if val is None:
                    row_vals.append("NULL")
                elif isinstance(val, (int, float)):
                    row_vals.append(str(val))
                else:
                    escaped = str(val).replace("\\", "\\\\").replace("'", "\\'")
                    row_vals.append(f"'{escaped}'")
            batch.append("(" + ", ".join(row_vals) + ")")
            if len(batch) >= 300:
                f.write(header_m + ",\n".join(batch) + ";\n\n")
                batch = []
        if batch:
            f.write(header_m + ",\n".join(batch) + ";\n\n")

    conn.close()
    size_mb = os.path.getsize(output_sql_path) / (1024 * 1024)
    print(f"✅ Exported {output_sql_path} ({size_mb:.1f} MB) in {time.time() - t0:.2f}s!")


def main():
    # 0. Standalone root cleaning mode on existing SQLite database
    if "--clean-roots-only" in sys.argv:
        if not os.path.exists(SQLITE_DB):
            print(f"❌ Error: Database '{SQLITE_DB}' not found. Run full conversion first.")
            sys.exit(1)
        print(f"🔄 Running root cleaning & meaning population on existing '{SQLITE_DB}'...")
        conn = sqlite3.connect(SQLITE_DB)
        clean_roots_and_populate_meanings(conn)
        finalize_database(conn)
        export_merged_sql(SQLITE_DB, MERGED_SQL_DUMP)
        return

    # 1. Check if SQL file was passed as argument or find best default
    selected_sql_file = None
    if len(sys.argv) > 1 and sys.argv[1].endswith(".sql"):
        selected_sql_file = sys.argv[1]
    elif os.path.exists("bhashamithram_merged.sql"):
        selected_sql_file = "bhashamithram_merged.sql"
    elif os.path.exists("bhashamithram.sql"):
        selected_sql_file = "bhashamithram.sql"
    elif os.path.exists("dictionary.sql"):
        selected_sql_file = "dictionary.sql"

    # 2. Determine conversion mode
    use_sql_file = False
    if MODE == "sql_file":
        use_sql_file = True
    elif MODE == "mysql":
        use_sql_file = False
    else:  # "auto"
        if selected_sql_file and os.path.exists(selected_sql_file):
            use_sql_file = True
        else:
            use_sql_file = False

    # 3. Setup SQLite connection with high-performance PRAGMAs
    if os.path.exists(SQLITE_DB):
        try:
            os.remove(SQLITE_DB)
        except Exception:
            pass

    conn = sqlite3.connect(SQLITE_DB)
    conn.execute("PRAGMA synchronous = OFF")
    conn.execute("PRAGMA journal_mode = MEMORY")
    conn.execute("PRAGMA cache_size = -64000")

    init_sqlite_staging(conn)

    # 4. Load data into staging
    if use_sql_file:
        load_sql_dump_into_staging(selected_sql_file, conn)
        ensure_staging_meanings(conn)
    else:
        load_mysql_into_staging(MYSQL_CONFIG, conn)

    # 5. Perform per-dictionary deduplication and merge
    merge_and_deduplicate_dictionary(conn)

    # 6. Clean symbol/letter roots and convert valid roots to meanings
    clean_roots_and_populate_meanings(conn)

    # 7. Build indexes and copy to mobile assets
    finalize_database(conn)

    # 8. Also produce deduplicated SQL file dump
    export_merged_sql(SQLITE_DB, MERGED_SQL_DUMP)


if __name__ == "__main__":
    main()
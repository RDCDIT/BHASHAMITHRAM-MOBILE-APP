import sqlite3
import pymysql

mysql_conn = pymysql.connect(
    host="localhost",
    user="root",
    password="112233",
    database="bhashamithram",
    charset="utf8mb4"
)

sqlite_conn = sqlite3.connect("dictionary.db")

mcur = mysql_conn.cursor()
scur = sqlite_conn.cursor()

# Get CREATE TABLE statements from MySQL
mcur.execute("SHOW CREATE TABLE dictionary")
create_dictionary = mcur.fetchone()[1]

mcur.execute("SHOW CREATE TABLE meanings")
create_meanings = mcur.fetchone()[1]

# Replace MySQL syntax with SQLite syntax
create_dictionary = (
    create_dictionary
    .replace("AUTO_INCREMENT", "")
    .replace("bigint", "INTEGER")
    .replace("longtext", "TEXT")
    .replace("varchar(200)", "TEXT")
    .replace("varchar(100)", "TEXT")
    .replace("datetime(6)", "TEXT")
    .replace("tinyint(1)", "INTEGER")
)

create_meanings = (
    create_meanings
    .replace("AUTO_INCREMENT", "")
    .replace("bigint", "INTEGER")
    .replace("longtext", "TEXT")
)

scur.execute("DROP TABLE IF EXISTS dictionary")
scur.execute("DROP TABLE IF EXISTS meanings")


scur.execute("""
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

scur.execute("""
CREATE TABLE meanings (
    id INTEGER PRIMARY KEY,
    meaning TEXT,
    context_usage TEXT,
    dictionary_id INTEGER,
    category_id INTEGER
)
""")

# You may need to further remove MySQL-specific clauses like ENGINE=InnoDB
# before executing these CREATE TABLE statements.

# Copy dictionary rows
mcur.execute("SELECT * FROM dictionary")

placeholders = ",".join(["?"] * len(mcur.description))
insert_sql = f"INSERT INTO dictionary VALUES ({placeholders})"

for row in mcur:
    scur.execute(insert_sql, row)

# Copy meanings rows
mcur.execute("SELECT * FROM meanings")

placeholders = ",".join(["?"] * len(mcur.description))
insert_sql = f"INSERT INTO meanings VALUES ({placeholders})"

for row in mcur:
    scur.execute(insert_sql, row)

sqlite_conn.commit()

print("Creating indexes to optimize mobile device queries...")
scur.execute("CREATE INDEX IF NOT EXISTS idx_dictionary_type_word ON dictionary(dictionary_type, word)")
scur.execute("CREATE INDEX IF NOT EXISTS idx_dictionary_word ON dictionary(word)")
scur.execute("CREATE INDEX IF NOT EXISTS idx_meanings_dictionary_id ON meanings(dictionary_id)")

sqlite_conn.commit()
sqlite_conn.close()
mysql_conn.close()

import shutil
shutil.copy("dictionary.db", "Final_Bashamitram/Mobile_app/assets/dictionary_v2.db")
print("Successfully updated dictionary.db and copied to Final_Bashamitram/Mobile_app/assets/dictionary_v2.db")
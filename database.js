const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const dataFolder = path.join(__dirname, "data");

if (!fs.existsSync(dataFolder)) {
    fs.mkdirSync(dataFolder, { recursive: true });
}

const databasePath = path.join(dataFolder, "properties.db");

const db = new Database(databasePath);

db.pragma("journal_mode = WAL");

db.exec(`
    CREATE TABLE IF NOT EXISTS properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        location TEXT NOT NULL,
        type TEXT NOT NULL,
        bedrooms INTEGER DEFAULT 0,
        bathrooms INTEGER DEFAULT 0,
        image TEXT DEFAULT '',
        description TEXT DEFAULT '',
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    )
`);

module.exports = db;
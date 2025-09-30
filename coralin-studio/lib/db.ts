import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// Singleton simple para compartir la conexión en el proceso
let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, "app.db");
  db = new Database(filePath);
  db.pragma("journal_mode = WAL");

  return db;
}

export function initSchema(): void {
  const db = getDb();
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      receivedAt TEXT NOT NULL,
      title TEXT NOT NULL,
      firstName TEXT NOT NULL,
      address TEXT NOT NULL,
      state TEXT NOT NULL,
      phone TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      postalCode TEXT NOT NULL,
      email TEXT NOT NULL,
      medicalConditions TEXT NOT NULL,
      otherMedicalConditions TEXT,
      eyeConditions TEXT NOT NULL,
      otherEyeConditions TEXT,
      howDidYouHear TEXT NOT NULL,
      agreement1 INTEGER NOT NULL,
      agreement2 INTEGER NOT NULL,
      agreement3 INTEGER NOT NULL
    );
  `);
}



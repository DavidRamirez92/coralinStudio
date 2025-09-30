import { Pool } from "pg";

let pool: Pool | null = null;

export function getPool(): Pool {
  if (pool) return pool;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL no está configurada");
  }

  pool = new Pool({ connectionString, ssl: getSslConfig() });
  return pool;
}

function getSslConfig() {
  // Neon y algunas plataformas requieren SSL. Ajusta según proveedor.
  // Si usas Supabase/Neon, por lo general: { rejectUnauthorized: false }
  if (process.env.PGSSL === "disable") return false as unknown as undefined;
  return { rejectUnauthorized: false } as unknown as undefined;
}

export async function ensureSchema(): Promise<void> {
  const client = await getPool().connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS submissions (
        id TEXT PRIMARY KEY,
        receivedAt TIMESTAMPTZ NOT NULL,
        title TEXT NOT NULL,
        firstName TEXT NOT NULL,
        address TEXT NOT NULL,
        state TEXT NOT NULL,
        phone TEXT NOT NULL,
        birthDate TEXT NOT NULL,
        postalCode TEXT NOT NULL,
        email TEXT NOT NULL,
        medicalConditions JSONB NOT NULL,
        otherMedicalConditions TEXT,
        eyeConditions JSONB NOT NULL,
        otherEyeConditions TEXT,
        howDidYouHear TEXT NOT NULL,
        agreement1 BOOLEAN NOT NULL,
        agreement2 BOOLEAN NOT NULL,
        agreement3 BOOLEAN NOT NULL
      );
    `);
  } finally {
    client.release();
  }
}



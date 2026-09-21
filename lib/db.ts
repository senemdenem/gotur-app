import { Pool } from "pg";

// DATABASE_URL: Oracle sunucudaki Postgres'e bağlantı dizesi (Vercel env).
// DATABASE_SSL=require ise self-signed sertifika kabul edilir (rejectUnauthorized:false).
declare global {
  // eslint-disable-next-line no-var
  var __gotur_pool: Pool | undefined;
}

export function getPool(): Pool {
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL tanımlı değil. Vercel proje ayarlarına Postgres bağlantı dizesini eklemek gerekiyor."
    );
  }
  if (!global.__gotur_pool) {
    global.__gotur_pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl:
        process.env.DATABASE_SSL === "require"
          ? { rejectUnauthorized: false }
          : undefined,
      max: 5,
    });
  }
  return global.__gotur_pool;
}

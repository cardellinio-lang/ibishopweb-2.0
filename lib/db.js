import { PrismaClient } from '@prisma/client';

// Postgres en "session mode" impose un nombre maximal de clients (souvent 15).
// Chaque fonction serverless de Vercel ouvre son propre pool Prisma, ce qui
// sature très vite la base et fait échouer les pages avec des 404/500.
// On force donc 1 connexion par instance et on réessaie les requêtes qui
// tombent sur une saturation ponctuelle.
function withConnectionLimit(url) {
  if (!url) return url;
  if (/[?&]connection_limit=/.test(url)) return url;
  return url + (url.includes('?') ? '&' : '?') + 'connection_limit=1';
}

const globalForPrisma = globalThis;

// Si DATABASE_URL est absente (build local sans .env), laisser Prisma lire
// sa propre configuration plutôt que de lui passer `url: undefined`.
const datasourceUrl = withConnectionLimit(process.env.DATABASE_URL);

const prisma =
  globalForPrisma.__prisma ??
  new PrismaClient({
    ...(datasourceUrl ? { datasources: { db: { url: datasourceUrl } } } : {}),
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.__prisma = prisma;

const isTransient = (err) => {
  const msg = String(err?.message || err);
  return (
    /max clients reached|too many connections|EMAXCONNSESSION|P1001|P1002|P1008|P2024|P2028/i.test(msg) ||
    /Can't reach database server|connection.*(closed|reset|terminated)|ETIMEDOUT|ECONNRESET|ENOTFOUND|socket hang up/i.test(msg)
  );
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Réessaie une opération Prisma si la base est momentanément saturée.
export async function withDbRetry(fn, { retries = 3 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (!isTransient(err) || attempt === retries) throw err;
      console.error(`[db] saturation Postgres, nouvel essai ${attempt + 1}/${retries}`);
      await sleep(250 * (attempt + 1));
    }
  }
  throw lastErr;
}

export default prisma;

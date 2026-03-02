import { PrismaClient } from '@prisma/client';
import { Pool, neonConfig } from '@neondatabase/serverless';
import { PrismaNeon } from '@prisma/adapter-neon';
import ws from 'ws';

// Required for Node.js (Vercel) to work with neon serverless.
// Cloudflare edge already provides a WebSocket object globally natively.
if (typeof WebSocket === 'undefined') {
  neonConfig.webSocketConstructor = ws;
}

const prismaClientSingleton = () => {
  // Use Neon serverless pool inside Prisma
  // During Next.js static build phase, env vars might be missing depending on Edge contexts.
  // We provide a dummy URL just to prevent the `Pool` constructor from crashing during build,
  // knowing that actual runtime queries will have the real environment variable.
  const connectionString = process.env.DATABASE_URL || 'postgres://dummy_user:dummy_password@localhost:5432/dummy_db';
  const pool = new Pool({ connectionString });
  
  // Typecast to any to bypass strict PrismaNeon constructor signature mismatch 
  // with @neondatabase/serverless Pool export.
  const adapter = new PrismaNeon(pool as any);
  
  return new PrismaClient({ adapter });
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const db = globalThis.prisma ?? prismaClientSingleton();

export default db;

if (process.env.NODE_ENV !== 'production') globalThis.prisma = db;

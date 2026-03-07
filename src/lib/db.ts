import { withAccelerate } from '@prisma/extension-accelerate';

// Singleton instance
let _prisma: any = null;

const prismaClientSingleton = (): any => {
  if (_prisma) return _prisma;

  // We use a proxy that lazy-loads the actual client to avoid top-level imports
  // that would trigger bundling of the heavy WASM engine.
  const proxy = new Proxy({} as any, {
    get: (target, prop) => {
      if (!_prisma) {
        // This is a synchronous 'get' but we need to initialize.
        // In the Edge Runtime/Cloudflare, we prioritize Accelerate.
        if (process.env.PRISMA_DATABASE_URL) {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { PrismaClient } = require('@prisma/client/edge');
          _prisma = new PrismaClient({
            datasourceUrl: process.env.PRISMA_DATABASE_URL,
          }).$extends(withAccelerate());
          console.log("Initialized Prisma Edge Client (Accelerate)");
        } else {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { PrismaClient } = require('@prisma/client');
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { Pool } = require('@neondatabase/serverless');
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const { PrismaNeon } = require('@prisma/adapter-neon');
          
          const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/db';
          const pool = new Pool({ connectionString });
          const adapter = new PrismaNeon(pool);
          _prisma = new PrismaClient({ adapter });
          console.log("Initialized Standard Prisma Client (Neon)");
        }
      }
      return _prisma[prop];
    },
  });

  return proxy;
};

const db = prismaClientSingleton();

export default db;

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";

// Evita que ws tente usar `bufferutil` (que às vezes é resolvido sem a função mask em bundlers)
process.env.WS_NO_BUFFER_UTIL = "1";
const ws = require("ws");

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

neonConfig.webSocketConstructor = ws;

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "DATABASE_URL environment variable is required for PrismaNeon adapter",
  );
}

const prismaAdapter = new PrismaNeon({ connectionString: databaseUrl });

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: prismaAdapter,
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

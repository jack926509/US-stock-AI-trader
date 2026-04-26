// Phase 3 實作：在 Server Component 直接 import 用，連 PG 拉資料
// 需 generate Prisma client；schema 在 apps/api/prisma/schema.prisma
// 兩個 app 共用同一個 schema 來源，dashboard 只做讀取
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  globalThis.prisma ??
  new PrismaClient({
    log: ["warn", "error"],
  });

if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;

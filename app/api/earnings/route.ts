import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
export const dynamic = "force-dynamic";

interface EarningQueryRow {
  id: string;
  amount: string;
  userId: string;
  createdAt: Date;
  incomeSourceId: string;
  incomeSource: { id: string; name: string };
  totalCount: bigint;
}

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const sortField = searchParams.get("sortField") ?? "createdAt";
    const sortOrder = searchParams.get("sortOrder") ?? "desc";

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize")) || 5),
    );
    const offset = (page - 1) * pageSize;

    const allowedSortFields = ["createdAt", "amount", "incomeSourceName"];
    const safeSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    const searchPattern = `%${search}%`;

    const orderByClause =
      safeSortField === "amount"
        ? Prisma.sql`e.amount ${safeSortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}`
        : safeSortField === "incomeSourceName"
          ? Prisma.sql`i.name ${safeSortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}`
          : Prisma.sql`e."createdAt" ${safeSortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}`;

    const amountExpr = Prisma.sql`REPLACE(TRIM(TO_CHAR(e.amount, '999999999990.99'::text)), '.', ',')`;

    const rows = await db.$queryRaw<EarningQueryRow[]>`
      SELECT
        e.id,
        ${amountExpr} AS amount,
        e."userId",
        e."createdAt",
        e."incomeSourceId",
        json_build_object('id', i.id, 'name', i.name) AS "incomeSource",
        COUNT(*) OVER() AS "totalCount"
      FROM "Earning" e
      JOIN "IncomeSource" i ON i.id = e."incomeSourceId"
      WHERE e."userId" = ${session.user.id}
        AND (
          ${search} = ''
          OR i.name ILIKE ${searchPattern}
          OR e.amount::text ILIKE ${searchPattern}
          OR TO_CHAR(e."createdAt", 'YYYY-MM-DD') ILIKE ${searchPattern}
          OR TO_CHAR(e."createdAt", 'DD/MM/YYYY') ILIKE ${searchPattern}
        )
      ORDER BY ${orderByClause}
      LIMIT ${pageSize}
      OFFSET ${offset}
    `;

    const totalItems = rows.length > 0 ? Number(rows[0].totalCount) : 0;
    const items = rows.map(({ totalCount, ...rest }) => rest);

    return NextResponse.json({ items, totalItems, page, pageSize });
  } catch (e) {
    console.error("API ERROR:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

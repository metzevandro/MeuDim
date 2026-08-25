import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
export const dynamic = "force-dynamic";

interface ExpenseQueryRow {
  id: string;
  amount: string;
  userId: string;
  createdAt: Date;
  categoryId: string;
  subcategoryId: string | null;
  paymentMethodId: string | null;
  category: { id: string; name: string };
  subcategory: { id: string; name: string } | null;
  paymentMethod: { id: string; name: string } | null;
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

    const allowedSortFields = [
      "createdAt",
      "amount",
      "categoryName",
      "subcategoryName",
      "paymentMethodName",
    ];
    const safeSortField = allowedSortFields.includes(sortField)
      ? sortField
      : "createdAt";
    const safeSortOrder = sortOrder === "asc" ? "asc" : "desc";

    const searchPattern = `%${search}%`;

    const orderByClause =
      safeSortField === "amount"
        ? Prisma.sql`e.amount ${safeSortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}`
        : safeSortField === "categoryName"
          ? Prisma.sql`c.name ${safeSortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}`
          : safeSortField === "subcategoryName"
            ? Prisma.sql`sc.name ${safeSortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}`
            : safeSortField === "paymentMethodName"
              ? Prisma.sql`pm.name ${safeSortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}`
              : Prisma.sql`e."createdAt" ${safeSortOrder === "asc" ? Prisma.sql`ASC` : Prisma.sql`DESC`}`;

    const amountExpr = Prisma.sql`REPLACE(TRIM(TO_CHAR(e.amount, '999999999990.99'::text)), '.', ',')`;

    const rows = await db.$queryRaw<ExpenseQueryRow[]>`
      SELECT
        e.id,
        ${amountExpr} AS amount,
        e."userId",
        e."createdAt",
        e."categoryId",
        e."subcategoryId",
        e."paymentMethodId",
        json_build_object('id', c.id, 'name', c.name) AS "category",
        CASE
          WHEN sc.id IS NOT NULL THEN json_build_object('id', sc.id, 'name', sc.name)
          ELSE NULL
        END AS "subcategory",
        CASE
          WHEN pm.id IS NOT NULL THEN json_build_object('id', pm.id, 'name', pm.name)
          ELSE NULL
        END AS "paymentMethod",
        COUNT(*) OVER() AS "totalCount"
      FROM "Expense" e
      JOIN "Category" c ON c.id = e."categoryId"
      LEFT JOIN "Subcategory" sc ON sc.id = e."subcategoryId"
      LEFT JOIN "PaymentMethod" pm ON pm.id = e."paymentMethodId"
      WHERE e."userId" = ${session.user.id}
        AND (
          ${search} = ''
          OR c.name ILIKE ${searchPattern}
          OR sc.name ILIKE ${searchPattern}
          OR pm.name ILIKE ${searchPattern}
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

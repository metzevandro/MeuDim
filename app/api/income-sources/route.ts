import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client"
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") ?? "";
    const sortField = searchParams.get("sortField") ?? "createdAt";
    const sortOrder = (searchParams.get("sortOrder") ??
      "desc") as Prisma.SortOrder;

    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const pageSize = Math.min(
      100,
      Math.max(1, Number(searchParams.get("pageSize")) || 5),
    );

    const where: Prisma.IncomeSourceWhereInput = {
      userId: session.user.id,
      ...(search && {
        name: { contains: search, mode: "insensitive" },
      }),
    };

    const [items, totalItems] = await Promise.all([
      db.incomeSource.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      db.incomeSource.count({ where }),
    ]);

    return NextResponse.json({ items, totalItems, page, pageSize });
  } catch (e) {
    console.error("API ERROR:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

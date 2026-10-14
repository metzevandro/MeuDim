import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const items = await db.transactionRule.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        pattern: true,
        categoryId: true,
        subcategoryId: true,
      },
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error("API ERROR:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

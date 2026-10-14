import { auth } from "@/auth";
import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { Prisma } from "@/lib/generated/prisma/client";
export const dynamic = "force-dynamic";

type Granularity = "dia" | "mes" | "ano";

interface RawEarning {
  id: string;
  amount: string;
  userId: string;
  createdAt: Date;
  incomeSourceId: string;
  incomeSource: { id: string; name: string };
}

interface RawExpense {
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
}

const ALLOWED_GRANULARITIES: Granularity[] = ["dia", "mes", "ano"];
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Limites de "bom senso" para evitar granularidades incoerentes com o
// período escolhido (ex: 5 anos agrupados por dia geraria milhares de
// pontos ilegíveis no gráfico). Quando o range pedido não faz sentido
// para a granularidade escolhida, ela é automaticamente ajustada e o
// valor efetivamente usado volta em `period.resolvedGranularity`.
const MAX_DAYS_FOR_DIA = 120; // ~4 meses
const MAX_DAYS_FOR_MES = 1900; // ~5 anos e meio

const parseAmount = (value: unknown): number => {
  if (typeof value === "number") return value;
  const parsed = parseFloat(String(value ?? "0").replace(",", "."));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const sumAmount = (items: { amount: unknown }[]): number =>
  parseFloat(
    items.reduce((acc, item) => acc + parseAmount(item.amount), 0).toFixed(2),
  );

const startOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (date: Date): Date => {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
};

/**
 * Resolve a granularidade efetiva com base no tamanho do período, para
 * evitar combinações sem sentido (ex: 1 dia de intervalo com granularidade
 * "ano", ou 5 anos de intervalo com granularidade "dia").
 */
const resolveGranularity = (
  requested: Granularity,
  start: Date,
  end: Date,
): Granularity => {
  const totalDays = Math.max(
    1,
    Math.ceil((end.getTime() - start.getTime()) / MS_PER_DAY),
  );

  if (requested === "dia" && totalDays > MAX_DAYS_FOR_DIA) {
    return totalDays > MAX_DAYS_FOR_MES ? "ano" : "mes";
  }
  if (requested === "mes" && totalDays > MAX_DAYS_FOR_MES) {
    return "ano";
  }
  return requested;
};

/**
 * Calcula o período imediatamente anterior, com a MESMA duração do período
 * selecionado, para servir de base de comparação (ex: 12/08 a 21/08 -> ele
 * compara com 02/08 a 11/08, os 10 dias imediatamente anteriores).
 */
const getPreviousPeriodRange = (start: Date, end: Date) => {
  const durationMs = end.getTime() - start.getTime();
  const previousEnd = new Date(start.getTime() - 1);
  const previousStart = new Date(previousEnd.getTime() - durationMs);
  return { start: previousStart, end: previousEnd };
};

const bucketKey = (date: Date, granularity: Granularity): string => {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const d = `${date.getDate()}`.padStart(2, "0");
  if (granularity === "dia") return `${y}-${m}-${d}`;
  if (granularity === "mes") return `${y}-${m}`;
  return `${y}`;
};

const bucketLabel = (date: Date, granularity: Granularity): string => {
  if (granularity === "dia") {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
    });
  }
  if (granularity === "mes") {
    return date.toLocaleDateString("pt-BR", {
      month: "short",
      year: "numeric",
    });
  }
  return `${date.getFullYear()}`;
};

/**
 * Gera TODAS as datas "âncora" de cada bucket dentro do período, mesmo os
 * que não têm nenhum lançamento — assim o gráfico mostra o mês/ano inteiro
 * (ex: todos os 30 dias do mês), e não só os dias em que houve movimento.
 */
const generateBucketDates = (
  start: Date,
  end: Date,
  granularity: Granularity,
): Date[] => {
  const dates: Date[] = [];

  if (granularity === "dia") {
    const cursor = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );
    const last = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    while (cursor.getTime() <= last.getTime()) {
      dates.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    return dates;
  }

  if (granularity === "mes") {
    const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
    const last = new Date(end.getFullYear(), end.getMonth(), 1);
    while (cursor.getTime() <= last.getTime()) {
      dates.push(new Date(cursor));
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return dates;
  }

  // ano
  for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
    dates.push(new Date(year, 0, 1));
  }
  return dates;
};

const buildSeries = (
  start: Date,
  end: Date,
  earnings: { createdAt: Date; amount: unknown }[],
  expenses: { createdAt: Date; amount: unknown }[],
  granularity: Granularity,
) => {
  const buckets = new Map<
    string,
    { label: string; date: Date; ganhos: number; despesas: number }
  >();

  // Pré-popula um bucket (zerado) para CADA dia/mês/ano do período, mesmo
  // sem lançamentos, para que o eixo do gráfico mostre o período completo.
  generateBucketDates(start, end, granularity).forEach((date) => {
    const key = bucketKey(date, granularity);
    if (!buckets.has(key)) {
      buckets.set(key, {
        label: bucketLabel(date, granularity),
        date,
        ganhos: 0,
        despesas: 0,
      });
    }
  });

  const addToBucket = (
    createdAt: Date,
    amount: unknown,
    field: "ganhos" | "despesas",
  ) => {
    const date = new Date(createdAt);
    const key = bucketKey(date, granularity);
    if (!buckets.has(key)) {
      buckets.set(key, {
        label: bucketLabel(date, granularity),
        date,
        ganhos: 0,
        despesas: 0,
      });
    }
    const bucket = buckets.get(key)!;
    bucket[field] += parseAmount(amount);
  };

  earnings.forEach((e) => addToBucket(e.createdAt, e.amount, "ganhos"));
  expenses.forEach((e) => addToBucket(e.createdAt, e.amount, "despesas"));

  return Array.from(buckets.values())
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map(({ label, ganhos, despesas }) => ({
      label,
      ganhos: parseFloat(ganhos.toFixed(2)),
      despesas: parseFloat(despesas.toFixed(2)),
      saldo: parseFloat((ganhos - despesas).toFixed(2)),
    }));
};

const calculatePercentageChange = (current: number, previous: number) => {
  const amount = parseFloat((current - previous).toFixed(2));
  let percentageChange = 0;

  if (previous === 0 && current > 0) {
    percentageChange = 100;
  } else if (previous !== 0) {
    percentageChange = parseFloat(((amount / previous) * 100).toFixed(2));
  }

  return { percentageChange, amount };
};

export async function GET(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");
    const granularityParam = searchParams.get("granularity");

    // Fallback: se nenhuma data for enviada, assume o mês corrente.
    const now = new Date();
    const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Datas "YYYY-MM-DD" puras são interpretadas pelo JS como UTC, o que
    // pode "voltar" um dia dependendo do fuso horário do servidor. Como o
    // usuário está escolhendo uma DATA de calendário (não um instante),
    // forçamos a interpretação como horário local, adicionando "T00:00:00"
    // quando o valor não já inclui horário.
    const parseLocalDate = (value: string | null, fallback: Date): Date => {
      if (!value) return fallback;
      const normalized = value.includes("T") ? value : `${value}T00:00:00`;
      const parsed = new Date(normalized);
      return Number.isNaN(parsed.getTime()) ? fallback : parsed;
    };

    const parsedStart = parseLocalDate(startDateParam, defaultStart);
    const parsedEnd = parseLocalDate(endDateParam, defaultEnd);

    // Garante que start <= end (se vier invertido, corrige em vez de falhar).
    const start = startOfDay(
      parsedStart.getTime() <= parsedEnd.getTime() ? parsedStart : parsedEnd,
    );
    const end = endOfDay(
      parsedStart.getTime() <= parsedEnd.getTime() ? parsedEnd : parsedStart,
    );

    const requestedGranularity: Granularity = ALLOWED_GRANULARITIES.includes(
      granularityParam as Granularity,
    )
      ? (granularityParam as Granularity)
      : "dia";

    const granularity = resolveGranularity(requestedGranularity, start, end);

    const previousRange = getPreviousPeriodRange(start, end);

    const amountExpr = Prisma.sql`REPLACE(TRIM(TO_CHAR(e.amount, '999999999990.99'::text)), '.', ',')`;

    const earnings = await db.$queryRaw<RawEarning[]>`
      SELECT
        e.id,
        ${amountExpr} AS amount,
        e."userId",
        e."createdAt",
        e."incomeSourceId",
        json_build_object('id', i.id, 'name', i.name) AS "incomeSource"
      FROM "Earning" e
      JOIN "IncomeSource" i ON i.id = e."incomeSourceId"
      WHERE e."userId" = ${session.user.id}
        AND e."createdAt" >= ${start}
        AND e."createdAt" <= ${end}
      ORDER BY e."createdAt" ASC
    `;

    const expenses = await db.$queryRaw<RawExpense[]>`
      SELECT
        e.id,
        ${amountExpr} AS amount,
        e."userId",
        e."createdAt",
        e."categoryId",
        e."subcategoryId",
        e."paymentMethodId",
        json_build_object('id', c.id, 'name', c.name) AS "category",
        CASE WHEN sc.id IS NOT NULL THEN json_build_object('id', sc.id, 'name', sc.name) ELSE NULL END AS "subcategory",
        CASE WHEN pm.id IS NOT NULL THEN json_build_object('id', pm.id, 'name', pm.name) ELSE NULL END AS "paymentMethod"
      FROM "Expense" e
      JOIN "Category" c ON c.id = e."categoryId"
      LEFT JOIN "Subcategory" sc ON sc.id = e."subcategoryId"
      LEFT JOIN "PaymentMethod" pm ON pm.id = e."paymentMethodId"
      WHERE e."userId" = ${session.user.id}
        AND e."createdAt" >= ${start}
        AND e."createdAt" <= ${end}
      ORDER BY e."createdAt" ASC
    `;

    const previousEarnings = await db.$queryRaw<{ amount: string }[]>`
      SELECT ${amountExpr} AS amount
      FROM "Earning" e
      WHERE e."userId" = ${session.user.id}
        AND e."createdAt" >= ${previousRange.start}
        AND e."createdAt" <= ${previousRange.end}
    `;

    const previousExpenses = await db.$queryRaw<{ amount: string }[]>`
      SELECT ${amountExpr} AS amount
      FROM "Expense" e
      WHERE e."userId" = ${session.user.id}
        AND e."createdAt" >= ${previousRange.start}
        AND e."createdAt" <= ${previousRange.end}
    `;

    const previousTotalGanhos = sumAmount(previousEarnings);
    const previousTotalDespesas = sumAmount(previousExpenses);

    const totalGanhos = sumAmount(earnings);
    const totalDespesas = sumAmount(expenses);
    const saldo = parseFloat((totalGanhos - totalDespesas).toFixed(2));

    const ganhosChange = calculatePercentageChange(
      totalGanhos,
      previousTotalGanhos,
    );
    const despesasChange = calculatePercentageChange(
      totalDespesas,
      previousTotalDespesas,
    );

    const series = buildSeries(start, end, earnings, expenses, granularity);

    return NextResponse.json({
      period: {
        startDate: start,
        endDate: end,
        granularity: requestedGranularity,
        resolvedGranularity: granularity,
      },
      summary: {
        totalGanhos,
        totalDespesas,
        saldo,
        previousTotalGanhos,
        previousTotalDespesas,
        ganhosPercentageChange: ganhosChange.percentageChange,
        ganhosAmountChange: ganhosChange.amount,
        despesasPercentageChange: despesasChange.percentageChange,
        despesasAmountChange: despesasChange.amount,
      },
      series,
      earnings,
      expenses,
    });
  } catch (e) {
    console.error("API ERROR:", e);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}

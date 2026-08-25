import React, { useEffect, useRef, useState, useMemo } from "react";
import "./PieChart.scss";
import { PieChart as Chart, EmptyState } from "design-system-zeroz";
import Card from "design-system-zeroz/Card";

interface PieData {
  name: string;
  amount: number;
  fill: string;
  quantity: number;
  keyName: string;
}

interface EarningItem {
  amount: unknown;
  incomeSourceId: string;
  incomeSource?: { id: string; name: string } | null;
}

interface ExpenseItem {
  amount: unknown;
  categoryId: string;
  subcategoryId?: string | null;
  paymentMethodId?: string | null;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
  paymentMethod?: { id: string; name: string } | null;
}

interface PieChartProps {
  earnings: EarningItem[];
  expenses: ExpenseItem[];
  clientDateType:
    "formaDePagamento" | "categoria" | "subcategoria" | "fonteDeRenda";
  skeleton: boolean;
  loading: boolean;
}

const parseAmount = (value: unknown) =>
  parseFloat(String(value).replace(",", ".")) || 0;

const getUniqueColors = (length: number): string[] => {
  const base = [
    "var(--s-color-chart-1)",
    "var(--s-color-chart-2)",
    "var(--s-color-chart-3)",
    "var(--s-color-chart-4)",
    "var(--s-color-chart-5)",
    "var(--s-color-chart-7)",
    "var(--s-color-chart-9)",
    "var(--s-color-chart-10)",
  ];
  return Array.from(
    { length },
    (_, i) => base[i] || "var(--s-color-chart-default, #cccccc)",
  );
};

const getTitleByType = (type: PieChartProps["clientDateType"]) => {
  switch (type) {
    case "formaDePagamento":
      return "Forma de Pagamento";
    case "categoria":
      return "Categoria";
    case "subcategoria":
      return "Subcategoria";
    case "fonteDeRenda":
      return "Fonte de Renda";
    default:
      return "Dados";
  }
};

const getDescriptionByType = (type: PieChartProps["clientDateType"]) => {
  return type === "fonteDeRenda" ? "ganhos" : "despesas";
};

const aggregate = (
  earnings: EarningItem[],
  expenses: ExpenseItem[],
  type: PieChartProps["clientDateType"],
): { key: string; name: string; total: number }[] => {
  const totals = new Map<string, { name: string; total: number }>();

  const add = (
    key: string | null | undefined,
    name: string,
    amount: number,
  ) => {
    if (!key) return;
    const current = totals.get(key) || { name, total: 0 };
    current.total += amount;
    totals.set(key, current);
  };

  if (type === "fonteDeRenda") {
    earnings.forEach((item) => {
      add(
        item.incomeSourceId,
        item.incomeSource?.name || "Fonte de Renda Desconhecida",
        parseAmount(item.amount),
      );
    });
  } else if (type === "categoria") {
    expenses.forEach((item) => {
      add(
        item.categoryId,
        item.category?.name || "Categoria Desconhecida",
        parseAmount(item.amount),
      );
    });
  } else if (type === "subcategoria") {
    expenses.forEach((item) => {
      if (!item.subcategoryId) return;
      add(
        item.subcategoryId,
        item.subcategory?.name || "Subcategoria Desconhecida",
        parseAmount(item.amount),
      );
    });
  } else if (type === "formaDePagamento") {
    expenses.forEach((item) => {
      if (!item.paymentMethodId) return;
      add(
        item.paymentMethodId,
        item.paymentMethod?.name || "Forma de Pagamento Desconhecida",
        parseAmount(item.amount),
      );
    });
  }

  return Array.from(totals.entries()).map(([key, { name, total }]) => ({
    key,
    name,
    total,
  }));
};

export function PieChart({
  earnings,
  expenses,
  clientDateType,
  skeleton,
  loading,
}: PieChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
        setChartHeight(chartContainerRef.current.offsetHeight);
      }
    };
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const processedData: PieData[] = useMemo(() => {
    const grouped = aggregate(
      earnings || [],
      expenses || [],
      clientDateType,
    ).filter((item) => item.total > 0);

    const colors = getUniqueColors(grouped.length);

    return grouped.map((item, index) => {
      const amount = parseFloat(item.total.toFixed(2));
      return {
        name: item.name,
        amount,
        fill: colors[index],
        quantity: amount,
        keyName: item.name,
      };
    });
  }, [earnings, expenses, clientDateType]);

  const title = getTitleByType(clientDateType);
  const description = getDescriptionByType(clientDateType);

  return (
    <Card>
      <Card.Header>
        <h1>{title}</h1>
      </Card.Header>
      <Card.Content>
        <div className="chart-container" ref={chartContainerRef}>
          {!loading && processedData.length === 0 ? (
            <EmptyState
              icon="database"
              title="Sem dados no período selecionado"
              description={`Altere o período selecionado ou registre novos ${description}.`}
            />
          ) : (
            <Chart
              skeleton={skeleton || loading}
              nameKey="keyName"
              type="donut"
              width={chartWidth}
              height={chartHeight}
              caption
              data={processedData}
              dataKey="quantity"
              innerRadius={80}
              outerRadius={130}
              label="Total"
              tooltipFormatter={(value: number) =>
                `R$ ${value.toFixed(2).replace(".", ",")}`
              }
              labelFormatter={(value: number) =>
                `R$ ${value.toFixed(2).replace(".", ",")}`
              }
            />
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

export default PieChart;

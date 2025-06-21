import React, { useEffect, useRef, useState, useMemo } from "react";
import "./PieChart.scss";
import {
  Card,
  CardContent,
  CardHeader,
  PieChart as Chart,
  EmptyState,
} from "design-system-zeroz";

interface PieData {
  name: string;
  amount: number;
  fill: string;
  quantity: number;
  keyName: string;
}

interface PieChartProps {
  userData: any;
  loading: boolean;
  selectedMonth: number | 12;
  setSelectedMonth: React.Dispatch<React.SetStateAction<number | 12>>;
  selectedYear: number | "all";
  setSelectedYear: React.Dispatch<React.SetStateAction<number | "all">>;
  isYearSelected: boolean;
  isAllYearsSelected: boolean;
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
  clientDateType:
    | "formaDePagamento"
    | "categoria"
    | "subcategoria"
    | "fonteDeRenda";
  skeleton: boolean;
}

const parseAmount = (value: any) =>
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
  return Array.from({ length }, (_, i) => base[i] || "var(--s-color-chart-default, #cccccc)");
};

const isInPeriod = (
  date: Date,
  isAllYearsSelected: boolean,
  selectedYear: number | "all",
  selectedMonth: number | 12,
  firstDay: Date,
  lastDay: Date
): boolean => {
  if (isAllYearsSelected) return true;
  if (selectedMonth === 12)
    return date.getFullYear() === selectedYear;
  return date >= firstDay && date <= lastDay;
};

const getItemKey = (item: any, type: PieChartProps["clientDateType"]): string => {
  switch (type) {
    case "formaDePagamento": return item.formaDePagamentoId;
    case "categoria": return item.categoriaId;
    case "subcategoria": return item.subcategoriaId;
    case "fonteDeRenda": return item.categoryId;
    default: return "";
  }
};

const getNameById = (userData: any, key: string, type: PieChartProps["clientDateType"]): string => {
  switch (type) {
    case "formaDePagamento":
      return userData?.user?.formaDePagamento?.find((x: any) => x.id === key)?.name || "Forma de Pagamento Desconhecida";
    case "categoria":
      return userData?.user?.categoria?.find((x: any) => x.id === key)?.name || "Categoria Desconhecida";
    case "subcategoria":
      return userData?.user?.categoria?.flatMap((cat: any) => cat.subcategorias || []).find((x: any) => x.id === key)?.name || `Subcategoria Desconhecida (${key})`;
    case "fonteDeRenda":
      return userData?.user?.categories?.find((x: any) => x.id === key)?.name || "Fonte de Renda Desconhecida";
    default:
      return "Desconhecido";
  }
};

const getTitleByType = (type: PieChartProps["clientDateType"]) => {
  switch (type) {
    case "formaDePagamento": return "Forma de Pagamento";
    case "categoria": return "Categoria";
    case "subcategoria": return "Subcategoria";
    case "fonteDeRenda": return "Fonte de Renda";
    default: return "Dados";
  }
};

const getDescriptionByType = (type: PieChartProps["clientDateType"]) => {
  return type === "fonteDeRenda" ? "Ganhos" : "Despesas";
};

export function PieChart({
  userData,
  loading,
  selectedMonth,
  selectedYear,
  isAllYearsSelected,
  firstDayOfMonth,
  lastDayOfMonth,
  clientDateType,
  skeleton,
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

  const processedData = useMemo(() => {
    const source =
      clientDateType === "fonteDeRenda"
        ? userData?.user?.transactions
        : userData?.user?.expense;

    if (!Array.isArray(source)) return [];

    const totals: Record<string, number> = {};

    source.forEach((item: any) => {
      const date = new Date(item.createdAt);
      if (
        isInPeriod(date, isAllYearsSelected, selectedYear, selectedMonth, firstDayOfMonth, lastDayOfMonth)
      ) {
        const key = getItemKey(item, clientDateType);
        const amount = parseAmount(item.amount);
        totals[key] = (totals[key] || 0) + amount;
      }
    });

    const keys = Object.keys(totals);
    const colors = getUniqueColors(keys.length);

    return keys
      .map((key, index) => {
        const amount = parseFloat(totals[key].toFixed(2));
        const name = getNameById(userData, key, clientDateType);
        return {
          name,
          amount,
          fill: colors[index],
          quantity: amount,
          keyName: name,
        };
      })
      .filter((item) => item.amount > 0);
  }, [
    userData,
    selectedMonth,
    selectedYear,
    isAllYearsSelected,
    firstDayOfMonth,
    lastDayOfMonth,
    clientDateType,
  ]);

  const title = getTitleByType(clientDateType);
  const description = getDescriptionByType(clientDateType);

  return (
    <Card
      header={<CardHeader title={title} description="" />}
      content={
        <CardContent>
          <div className="chart-container" ref={chartContainerRef}>
            {!loading && processedData.length === 0 ? (
              <EmptyState
                icon="database"
                title="Sem dados no período selecionado"
                description={`Altere o período selecionado ou registre novas ${description}.`}
              />
            ) : (
              <Chart
                skeleton={skeleton}
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
        </CardContent>
      }
    />
  );
}

export default PieChart;

import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  BarChart as Chart,
} from "design-system-zeroz";
import "./BarChart.scss";

interface BarChartProps {
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
  skeleton: boolean;
}

const getFormattedDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const parseAmount = (value: any) =>
  parseFloat(String(value).replace(",", ".")) || 0;

const sumValuesByPeriod = (
  items: any[],
  startDate: Date,
  endDate: Date
): number =>
  items?.reduce((acc: number, item: any) => {
    const date = new Date(item.createdAt);
    return date >= startDate && date <= endDate
      ? acc + parseAmount(item.amount)
      : acc;
  }, 0) || 0;

const sumValuesByYear = (items: any[], year: number): number =>
  items?.reduce((acc: number, item: any) => {
    const date = new Date(item.createdAt);
    return date.getFullYear() === year ? acc + parseAmount(item.amount) : acc;
  }, 0) || 0;

const getAllYears = (transactions: any[], expenses: any[]): number[] => {
  const yearsSet = new Set<number>();
  [...(transactions || []), ...(expenses || [])].forEach((item) => {
    yearsSet.add(new Date(item.createdAt).getFullYear());
  });
  return Array.from(yearsSet).sort((a, b) => a - b);
};

export function BarChart({
  userData,
  selectedMonth,
  selectedYear,
  isAllYearsSelected,
  lastDayOfMonth,
  skeleton,
}: BarChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);

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

  const buildDataBar = () => {
    const transactions = userData?.user?.transactions || [];
    const expenses = userData?.user?.expense || [];

    if (isAllYearsSelected) {
      return getAllYears(transactions, expenses).map((year) => ({
        month: year.toString(),
        Ganhos: sumValuesByYear(transactions, year),
        Despesas: sumValuesByYear(expenses, year),
      }));
    }

    if (selectedMonth === 12 && typeof selectedYear === "number") {
      return Array.from({ length: 12 }, (_, month) => {
        const start = new Date(selectedYear, month, 1);
        const end = new Date(selectedYear, month + 1, 0);
        const label = start.toLocaleString("pt-BR", {
          month: "short",
          year: "numeric",
        });

        return {
          month: label,
          Ganhos: sumValuesByPeriod(transactions, start, end),
          Despesas: sumValuesByPeriod(expenses, start, end),
        };
      });
    }

    if (typeof selectedYear === "number") {
      return Array.from({ length: lastDayOfMonth.getDate() }, (_, day) => {
        const date = new Date(selectedYear, selectedMonth, day + 1);
        const label = getFormattedDate(date);

        const filterByDate = (items: any[]) =>
          items.filter((i) => {
            const d = new Date(i.createdAt);
            return (
              d.getDate() === date.getDate() &&
              d.getMonth() === date.getMonth() &&
              d.getFullYear() === date.getFullYear()
            );
          });

        const Ganhos = filterByDate(transactions).reduce(
          (acc, item) => acc + parseAmount(item.amount),
          0
        );

        const Despesas = filterByDate(expenses).reduce(
          (acc, item) => acc + parseAmount(item.amount),
          0
        );

        return { month: label, Ganhos, Despesas };
      });
    }

    return [];
  };

  const dataBar = buildDataBar();

  return (
    <Card
      header={<CardHeader title="Ganhos x Despesas" description="" />}
      content={
        <CardContent>
          <div className="chart-container" ref={chartContainerRef}>
            <Chart
              skeleton={skeleton}
              tooltipFormatter={(value: number) =>
                `R$ ${value.toFixed(2).replace(".", ",")}`
              }
              lineStyles={{
                Despesas: { color: "var(--s-color-fill-warning)" },
                Ganhos: { color: "var(--s-color-fill-success)" },
              }}
              data={dataBar}
              height={chartHeight}
              width={chartWidth}
              caption
            />
          </div>
        </CardContent>
      }
    />
  );
}

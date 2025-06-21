import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  LineChart as Chart,
} from "design-system-zeroz";
import "./LineChart.scss";

interface LineChartProps {
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

const parseAmount = (value: any) =>
  parseFloat(String(value).replace(",", ".")) || 0;

const getFormattedDate = (date: Date) =>
  date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });

const getAllYears = (transactions: any[], expenses: any[]): number[] => {
  const yearsSet = new Set<number>();
  [...(transactions || []), ...(expenses || [])].forEach((item) => {
    yearsSet.add(new Date(item.createdAt).getFullYear());
  });
  return Array.from(yearsSet).sort((a, b) => a - b);
};

const generateMonthDates = (year: number, month: number) =>
  Array.from({ length: new Date(year, month + 1, 0).getDate() }, (_, i) =>
    new Date(year, month, i + 1)
  );

const sumUntilDate = (items: any[], date: Date) =>
  items
    ?.filter((item: any) => new Date(item.createdAt) <= date)
    .reduce((acc: number, item: any) => acc + parseAmount(item.amount), 0) || 0;

const buildDataArea = (
  userData: any,
  selectedYear: number | "all",
  selectedMonth: number | 12,
  isAllYearsSelected: boolean
) => {
  const transactions = userData?.user?.transactions || [];
  const expenses = userData?.user?.expense || [];

  if (isAllYearsSelected) {
    let acumuladoGanhos = 0;
    let acumuladoDespesas = 0;
    return getAllYears(transactions, expenses).map((year) => {
      const ganhosAno = sumUntilDate(
        transactions,
        new Date(year, 11, 31)
      );
      const despesasAno = sumUntilDate(expenses, new Date(year, 11, 31));
      acumuladoGanhos += ganhosAno;
      acumuladoDespesas += despesasAno;

      return {
        month: year.toString(),
        "Saldo Total": acumuladoGanhos - acumuladoDespesas,
      };
    });
  }

  if (selectedMonth === 12 && typeof selectedYear === "number") {
    return Array.from({ length: 12 }, (_, monthIdx) => {
      const date = new Date(selectedYear, monthIdx + 1, 0);
      const label = date.toLocaleDateString("pt-BR", {
        month: "short",
        year: "numeric",
      });

      const totalGanhos = sumUntilDate(transactions, date);
      const totalDespesas = sumUntilDate(expenses, date);

      return {
        month: label,
        "Saldo Total": totalGanhos - totalDespesas,
      };
    });
  }

  if (typeof selectedYear === "number") {
    return generateMonthDates(selectedYear, selectedMonth).map((date) => ({
      month: getFormattedDate(date),
      "Saldo Total":
        sumUntilDate(transactions, date) - sumUntilDate(expenses, date),
    }));
  }

  return [];
};

export function LineChart({
  userData,
  selectedMonth,
  selectedYear,
  isAllYearsSelected,
  lastDayOfMonth,
  skeleton,
}: LineChartProps) {
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

  const dataArea = buildDataArea(
    userData,
    selectedYear,
    selectedMonth,
    isAllYearsSelected
  );

  return (
    <Card
      header={<CardHeader title="Saldo Total" description="" />}
      content={
        <CardContent>
          <div className="chart-container" ref={chartContainerRef}>
            <Chart
              skeleton={skeleton}
              tooltipFormatter={(value: number) =>
                `R$ ${value.toFixed(2).replace(".", ",")}`
              }
              lineStyles={{
                "Saldo Total": { color: "var(--s-color-fill-success)" },
              }}
              data={dataArea}
              type="linear"
              height={chartHeight}
              width={chartWidth}
              dots={false}
              caption
            />
          </div>
        </CardContent>
      }
    />
  );
}

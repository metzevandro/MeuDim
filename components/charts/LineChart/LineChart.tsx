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

function getFormattedDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

function generateDatesInMonth(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dates: Date[] = [];

  for (let day = firstDay.getDate(); day <= lastDay.getDate(); day++) {
    dates.push(new Date(year, month, day));
  }

  return dates;
}

function generateDatesInYear(year: number): Date[] {
  const dates: Date[] = [];
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(new Date(d));
  }
  return dates;
}

export function LineChart({
  userData,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  isYearSelected,
  isAllYearsSelected,
  firstDayOfMonth,
  lastDayOfMonth,
  skeleton,
}: LineChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const [randomData, setRandomData] = useState<
    { ganhos: number; despesas: number }[]
  >([]);
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
    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const getAllYears = () => {
    const yearsSet = new Set<number>();
    userData?.user?.transactions?.forEach((t: any) => {
      yearsSet.add(new Date(t.createdAt).getFullYear());
    });
    userData?.user?.expense?.forEach((e: any) => {
      yearsSet.add(new Date(e.createdAt).getFullYear());
    });
    return Array.from(yearsSet).sort((a, b) => a - b);
  };

  let dataArea: any[] = [];

  if (isAllYearsSelected) {
    const years = getAllYears();
    let acumuladoGanhos = 0;
    let acumuladoDespesas = 0;
    dataArea = years.map((year) => {
      const ganhosAno =
        userData?.user?.transactions?.reduce(
          (acc: number, transaction: any) => {
            const transactionDate = new Date(transaction.createdAt);
            if (transactionDate.getFullYear() === year) {
              const amount =
                parseFloat(String(transaction.amount).replace(",", ".")) || 0;
              return acc + amount;
            }
            return acc;
          },
          0,
        ) || 0;

      const despesasAno =
        userData?.user?.expense?.reduce((acc: number, expense: any) => {
          const expenseDate = new Date(expense.createdAt);
          if (expenseDate.getFullYear() === year) {
            const amount =
              parseFloat(String(expense.amount).replace(",", ".")) || 0;
            return acc + amount;
          }
          return acc;
        }, 0) || 0;

      acumuladoGanhos += ganhosAno;
      acumuladoDespesas += despesasAno;

      return {
        month: year.toString(),
        "Saldo Total": acumuladoGanhos - acumuladoDespesas,
      };
    });
  } else if (selectedMonth === 12) {
    dataArea =
      typeof selectedYear === "number"
        ? Array.from({ length: 12 }, (_, monthIdx) => {
            const lastDay = new Date(selectedYear, monthIdx + 1, 0);

            const formattedMonth = lastDay.toLocaleDateString("pt-BR", {
              month: "short",
              year: "numeric",
            });

            const transactionsUntilMonth =
              userData?.user?.transactions?.filter((transaction: any) => {
                const transactionDate = new Date(transaction.createdAt);
                return transactionDate <= lastDay;
              }) || [];

            const totalGanhos = transactionsUntilMonth.reduce(
              (acc: any, transaction: any) =>
                acc + parseFloat(String(transaction.amount).replace(",", ".")),
              0,
            );

            const expensesUntilMonth =
              userData?.user?.expense?.filter((expense: any) => {
                const expenseDate = new Date(expense.createdAt);
                return expenseDate <= lastDay;
              }) || [];

            const totalDespesas = expensesUntilMonth.reduce(
              (acc: any, expense: any) =>
                acc + parseFloat(String(expense.amount).replace(",", ".")),
              0,
            );

            return {
              month: formattedMonth,
              "Saldo Total": totalGanhos - totalDespesas,
            };
          })
        : [];
  } else {
    dataArea =
      typeof selectedYear === "number"
        ? generateDatesInMonth(selectedYear, selectedMonth).map((date) => {
            const formattedDate = getFormattedDate(date);

            const transactionsUntilDate =
              userData?.user?.transactions?.filter((transaction: any) => {
                const transactionDate = new Date(transaction.createdAt);
                return transactionDate <= date;
              }) || [];

            const totalGanhos = transactionsUntilDate.reduce(
              (acc: any, transaction: any) =>
                acc + parseFloat(String(transaction.amount).replace(",", ".")),
              0,
            );

            const expensesUntilDate =
              userData?.user?.expense?.filter((expense: any) => {
                const expenseDate = new Date(expense.createdAt);
                return expenseDate <= date;
              }) || [];

            const totalDespesas = expensesUntilDate.reduce(
              (acc: any, expense: any) =>
                acc + parseFloat(String(expense.amount).replace(",", ".")),
              0,
            );

            return {
              month: formattedDate,
              "Saldo Total": totalGanhos - totalDespesas,
            };
          })
        : [];
  }

  return (
    <Card
      header={<CardHeader title="Saldo Total" description="" />}
      content={
        <CardContent>
          <div className="chart-container" ref={chartContainerRef}>
            <Chart
              skeleton={skeleton}
              tooltipFormatter={(value: any) => {
                const formattedValue = typeof value === "number" ? value : 0;
                return `R$ ${formattedValue.toFixed(2).replace(".", ",")}`;
              }}
              lineStyles={{
                "Saldo Total": {
                  color: "var(--s-color-fill-success)",
                },
              }}
              data={dataArea}
              type="linear"
              height={chartHeight}
              width={chartWidth}
              dots={false}
              caption={true}
            />
          </div>
        </CardContent>
      }
    />
  );
}

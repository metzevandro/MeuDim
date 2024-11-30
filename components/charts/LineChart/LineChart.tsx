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
  selectedYear: number;
  setSelectedYear: React.Dispatch<React.SetStateAction<number>>;
  isYearSelected: boolean;
  firstDayOfMonth: Date;
  lastDayOfMonth: Date;
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

export function LineChart({
  userData,
  loading,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  isYearSelected,
  firstDayOfMonth,
  lastDayOfMonth,
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

  useEffect(() => {
    if (loading) {
      const intervalId = setInterval(() => {
        setRandomData(
          Array.from(
            { length: selectedMonth === 12 ? 12 : lastDayOfMonth.getDate() },
            () => ({
              ganhos: Math.floor(Math.random() * 1000),
              despesas: Math.floor(Math.random() * 1000),
            }),
          ),
        );
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [loading, selectedMonth, lastDayOfMonth]);

  const dataArea =
    selectedMonth === 12
      ? Array.from({ length: 12 }, (_, month) => {
          const firstDay = new Date(selectedYear, month, 1);
          const lastDay = new Date(selectedYear, month + 1, 0);
          const formattedDate = firstDay.toLocaleString("pt-BR", {
            month: "short",
            year: "numeric",
          });

          const transactionsUntilDate =
            userData?.user?.transactions?.filter((transaction: any) => {
              const transactionDate = new Date(transaction.createdAt);
              return transactionDate <= lastDay;
            }) || [];

          const totalGanhos = transactionsUntilDate.reduce(
            (acc: any, transaction: any) =>
              acc + parseFloat(transaction.amount.replace(",", ".")),
            0,
          );

          const expensesUntilDate =
            userData?.user?.expense?.filter((expense: any) => {
              const expenseDate = new Date(expense.createdAt);
              return expenseDate <= lastDay;
            }) || [];

          const totalDespesas = expensesUntilDate.reduce(
            (acc: any, expense: any) =>
              acc + parseFloat(expense.amount.replace(",", ".")),
            0,
          );

          return {
            month: formattedDate,
            "Saldo Total": totalGanhos - totalDespesas,
          };
        })
      : generateDatesInMonth(selectedYear, selectedMonth).map((date) => {
          const formattedDate = getFormattedDate(date);

          const transactionsUntilDate =
            userData?.user?.transactions?.filter((transaction: any) => {
              const transactionDate = new Date(transaction.createdAt);
              return transactionDate <= date;
            }) || [];

          const totalGanhos = transactionsUntilDate.reduce(
            (acc: any, transaction: any) =>
              acc + parseFloat(transaction.amount.replace(",", ".")),
            0,
          );

          const expensesUntilDate =
            userData?.user?.expense?.filter((expense: any) => {
              const expenseDate = new Date(expense.createdAt);
              return expenseDate <= date;
            }) || [];

          const totalDespesas = expensesUntilDate.reduce(
            (acc: any, expense: any) =>
              acc + parseFloat(expense.amount.replace(",", ".")),
            0,
          );

          return {
            month: formattedDate,
            "Saldo Total": totalGanhos - totalDespesas,
          };
        });

  return (
    <Card
      header={<CardHeader title="Saldo Total" description="" />}
      content={
        <CardContent>
          <div className="chart-container" ref={chartContainerRef}>
            <Chart
              tooltipFormatter={(value) => {
                const formattedValue = typeof value === "number" ? value : 0;
                return `R$ ${formattedValue.toFixed(2).replace(".", ",")}`;
              }}
              lineStyles={{
                'Saldo Total': {
                  color: loading
                    ? "var(--s-color-fill-disable)"
                    : "var(--s-color-fill-success)",
                },
              }}
              data={dataArea}
              type="monotone"
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

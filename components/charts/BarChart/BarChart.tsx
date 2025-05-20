import React, { useEffect, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
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

function getFormattedDate(date: Date): string {
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

export function BarChart({
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
}: BarChartProps) {
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

  let dataBar: any[] = [];

  if (isAllYearsSelected) {
    const years = getAllYears();
    dataBar = years.map((year) => {
      const ganhos =
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

      const despesas =
        userData?.user?.expense?.reduce((acc: number, expense: any) => {
          const expenseDate = new Date(expense.createdAt);
          if (expenseDate.getFullYear() === year) {
            const amount =
              parseFloat(String(expense.amount).replace(",", ".")) || 0;
            return acc + amount;
          }
          return acc;
        }, 0) || 0;

      return {
        month: year.toString(),
        ganhos,
        despesas,
      };
    });
  } else if (selectedMonth === 12) {
    dataBar =
      typeof selectedYear === "number"
        ? Array.from({ length: 12 }, (_, month) => {
            const firstDay = new Date(selectedYear, month, 1);
            const lastDay = new Date(selectedYear, month + 1, 0);
            const formattedMonth = firstDay.toLocaleString("pt-BR", {
              month: "short",
              year: "numeric",
            });

            const ganhos =
              userData?.user?.transactions?.reduce(
                (acc: number, transaction: any) => {
                  const transactionDate = new Date(transaction.createdAt);
                  if (
                    transactionDate >= firstDay &&
                    transactionDate <= lastDay
                  ) {
                    const amount =
                      parseFloat(
                        String(transaction.amount).replace(",", "."),
                      ) || 0;
                    return acc + amount;
                  }
                  return acc;
                },
                0,
              ) || 0;

            const despesas =
              userData?.user?.expense?.reduce((acc: number, expense: any) => {
                const expenseDate = new Date(expense.createdAt);
                if (expenseDate >= firstDay && expenseDate <= lastDay) {
                  const amount =
                    parseFloat(String(expense.amount).replace(",", ".")) || 0;
                  return acc + amount;
                }
                return acc;
              }, 0) || 0;

            return {
              month: formattedMonth,
              ganhos: ganhos,
              despesas: despesas,
            };
          })
        : [];
  } else {
    dataBar =
      typeof selectedYear === "number"
        ? Array.from({ length: lastDayOfMonth.getDate() }, (_, day) => {
            const date = new Date(selectedYear, selectedMonth, day + 1);
            const formattedMonth = getFormattedDate(date);

            const ganhos = userData?.user?.transactions
              ?.filter((transaction: any) => {
                const transactionDate = new Date(transaction.createdAt);
                return (
                  transactionDate.getDate() === date.getDate() &&
                  transactionDate.getMonth() === date.getMonth() &&
                  transactionDate.getFullYear() === date.getFullYear()
                );
              })
              .reduce(
                (acc: number, transaction: any) =>
                  acc +
                  parseFloat(String(transaction.amount).replace(",", ".")),
                0,
              );

            const despesas = userData?.user?.expense
              ?.filter((expense: any) => {
                const expenseDate = new Date(expense.createdAt);
                return (
                  expenseDate.getDate() === date.getDate() &&
                  expenseDate.getMonth() === date.getMonth() &&
                  expenseDate.getFullYear() === date.getFullYear()
                );
              })
              .reduce(
                (acc: number, expense: any) =>
                  acc + parseFloat(String(expense.amount).replace(",", ".")),
                0,
              );

            return {
              month: formattedMonth,
              ganhos: ganhos,
              despesas: despesas,
            };
          })
        : [];
  }

  return (
    <Card
      header={<CardHeader title="Ganhos x Despesas" description="" />}
      content={
        <CardContent>
          <div className="chart-container" ref={chartContainerRef}>
            <Chart
              skeleton={skeleton}
              tooltipFormatter={(value) =>
                `R$ ${value.toFixed(2).replace(".", ",")}`
              }
              lineStyles={{
                despesas: {
                  color: "var(--s-color-fill-warning)",
                },
                ganhos: {
                  color: "var(--s-color-fill-success)",
                },
              }}
              data={dataBar}
              height={chartHeight}
              width={chartWidth}
              caption={true}
            />
          </div>
        </CardContent>
      }
    />
  );
}

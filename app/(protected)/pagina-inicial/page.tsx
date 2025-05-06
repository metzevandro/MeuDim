"use client";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  InputSelect,
  Page,
  Skeleton,
} from "design-system-zeroz";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import "./pagina-inicial.scss";
import PieChart from "@/components/charts/PieChart/PieChart";
import { BarChart } from "@/components/charts/BarChart/BarChart";
import { LineChart } from "@/components/charts/LineChart/LineChart";
import { Expense, Transaction } from "@/actions/fetch";
import { useUser } from "@/data/provider";

const HomePage = () => {
  const { userData, skeleton, fetchUserData } = useUser();
  const router = useRouter();
  const [selectedMonth, setSelectedMonth] = useState<number | 12>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );
  const isYearSelected = selectedMonth === 12;

  const firstDayOfMonth =
    selectedMonth === 12
      ? new Date(selectedYear, 0, 1)
      : new Date(selectedYear, selectedMonth, 1);

  const lastDayOfMonth =
    selectedMonth === 12
      ? new Date(selectedYear, 11, 31)
      : new Date(selectedYear, selectedMonth + 1, 0);

  const dates = [];
  for (let i = firstDayOfMonth.getDate(); i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(selectedYear, isYearSelected ? 0 : selectedMonth, i);
    dates.push(date);
  }

  useEffect(() => {}, [selectedMonth, selectedYear]);

  useEffect(() => {
    if (!userData?.user) {
      fetchUserData();
    }
  }, [userData]);

  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const sumGanhos = () => {
    if (!userData?.user || !Array.isArray(userData.user.transactions)) {
      return "0,00";
    }

    const total = userData.user.transactions.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      if (
        (selectedMonth === 12 &&
          transactionDate.getFullYear() === selectedYear) ||
        (transactionDate >= firstDayOfMonth &&
          transactionDate <= lastDayOfMonth)
      ) {
        const amount =
          typeof transaction.amount === "number"
            ? transaction.amount
            : parseFloat(transaction.amount.replace(",", ".")) || 0;
        return acc + amount;
      }
      return acc;
    }, 0);

    return total.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sumDespesas = () => {
    if (!userData?.user || !Array.isArray(userData.user.expense)) {
      return "0,00";
    }

    const total = userData.user.expense.reduce((acc, expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (
        (selectedMonth === 12 && expenseDate.getFullYear() === selectedYear) ||
        (expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth)
      ) {
        const amount =
          typeof expense.amount === "number"
            ? expense.amount
            : parseFloat(expense.amount.replace(",", ".")) || 0;
        return acc + amount;
      }
      return acc;
    }, 0);

    return total.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sumSaldo = () => {
    if (!userData?.user) {
      return "0,00";
    }

    const totalGanhos =
      userData.user.transactions?.reduce((acc, transaction) => {
        const amount =
          typeof transaction.amount === "number"
            ? transaction.amount
            : parseFloat(transaction.amount.replace(",", ".")) || 0;
        return acc + amount;
      }, 0) || 0;

    const totalDespesas =
      userData.user.expense?.reduce((acc, expense) => {
        const amount =
          typeof expense.amount === "number"
            ? expense.amount
            : parseFloat(expense.amount.replace(",", ".")) || 0;
        return acc + amount;
      }, 0) || 0;

    const saldo = totalGanhos - totalDespesas;

    return saldo.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const monthOptions = [
    { value: "0", label: "Janeiro" },
    { value: "1", label: "Fevereiro" },
    { value: "2", label: "Março" },
    { value: "3", label: "Abril" },
    { value: "4", label: "Maio" },
    { value: "5", label: "Junho" },
    { value: "6", label: "Julho" },
    { value: "7", label: "Agosto" },
    { value: "8", label: "Setembro" },
    { value: "9", label: "Outubro" },
    { value: "10", label: "Novembro" },
    { value: "11", label: "Dezembro" },
    { value: "12", label: "Todos" },
  ];

  const calculatePercentageChange = (
    currentValue: number,
    previousValue: number,
  ): { percentageChange: number; amount: number } => {
    let percentageChange = 0;
    const difference = currentValue - previousValue;

    if (previousValue === 0 && currentValue > 0) {
      percentageChange = 100;
    } else if (previousValue !== 0) {
      percentageChange = (difference / previousValue) * 100;
    }

    return {
      percentageChange,
      amount: difference,
    };
  };

  const calculateTotalForMonth = (
    transactions: Transaction[],
    year: number,
    month: number,
  ) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return transactions.reduce((acc, transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      if (transactionDate >= firstDay && transactionDate <= lastDay) {
        const amount =
          typeof transaction.amount === "number"
            ? transaction.amount
            : parseFloat(transaction.amount.replace(",", ".")) || 0;
        return acc + amount;
      }
      return acc;
    }, 0);
  };

  const calculateTotalExpensesForMonth = (
    expenses: Expense[],
    year: number,
    month: number,
  ) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    return expenses.reduce((acc, expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (expenseDate >= firstDay && expenseDate <= lastDay) {
        const amount =
          typeof expense.amount === "number"
            ? expense.amount
            : parseFloat(expense.amount.replace(",", ".")) || 0;
        return acc + amount;
      }
      return acc;
    }, 0);
  };

  const currentMonthGanhos = calculateTotalForMonth(
    userData?.user?.transactions || [],
    selectedYear,
    selectedMonth,
  );

  const previousMonthGanhos = calculateTotalForMonth(
    userData?.user?.transactions || [],
    selectedYear,
    selectedMonth - 1,
  );

  const currentMonthDespesas = calculateTotalExpensesForMonth(
    userData?.user?.expense || [],
    selectedYear,
    selectedMonth,
  );

  const previousMonthDespesas = calculateTotalExpensesForMonth(
    userData?.user?.expense || [],
    selectedYear,
    selectedMonth - 1,
  );

  const ganhoChangeResult = calculatePercentageChange(
    currentMonthGanhos || 0,
    previousMonthGanhos || 0,
  );

  const ganhoPercentageChange = ganhoChangeResult.percentageChange || 0;
  const ganhoAmount = ganhoChangeResult.amount || 0;

  const despesasChangeResult = calculatePercentageChange(
    currentMonthDespesas || 0,
    previousMonthDespesas || 0,
  );

  const despesasPercentageChange = despesasChangeResult.percentageChange || 0;
  const despesasAmount = despesasChangeResult.amount || 0;

  const [showSaldo, setShowSaldo] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedShowSaldo = localStorage.getItem("showSaldo");
      const initialShowSaldo = storedShowSaldo
        ? JSON.parse(storedShowSaldo)
        : true;
      setShowSaldo(initialShowSaldo);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("showSaldo", JSON.stringify(showSaldo));
    }
  }, [showSaldo]);

  const namePage = `Confira suas finanças, ${skeleton ? "..." : userData?.user.name} !`;

  return (
    <Page
      skeletonButtonPrimary={skeleton}
      skeletonButtonSecondary={skeleton}
      namePage={namePage}
      buttonContentSecondary={showSaldo ? "Ocultar números" : "Exibir números"}
      withActionSecondary
      onClickActionSecondary={() => setShowSaldo(!showSaldo)}
      iconButtonSecondary={showSaldo ? "visibility_off" : "visibility"}
      description={
        <span>
          Saldo total:
          <strong> R$ {showSaldo ? sumSaldo() : "•••••••"}</strong>
        </span>
      }
    >
      <div className="layout-page">
        <div className="input-field">
          <InputSelect
            label="Mês"
            options={monthOptions.map((option) => option.label)}
            value={
              monthOptions.find(
                (option) => option.value === selectedMonth.toString(),
              )?.label || "Ano"
            }
            onChange={(value) =>
              setSelectedMonth(
                monthOptions.findIndex((option) => option.label === value),
              )
            }
          />

          <InputSelect
            label="Ano"
            options={Array.from({ length: 5 }, (_, index) =>
              (new Date().getFullYear() - index).toString(),
            )}
            value={selectedYear.toString()}
            onChange={(value) => setSelectedYear(parseInt(value))}
          />
        </div>
        <div className="layout-resumo">
          <Card
            footer={
              <CardFooter>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--s-spacing-xx-small)",
                  }}
                >
                  <Button
                    skeleton={skeleton}
                    label="Adicionar ganho"
                    variant="primary"
                    size="md"
                    onClick={() => navigateTo("/pagina-inicial/ganhos")}
                  />
                  <Button
                    skeleton={skeleton}
                    label="Consultar ganhos"
                    variant="secondary"
                    size="md"
                    onClick={() => navigateTo("/pagina-inicial/ganhos")}
                  />
                </div>
              </CardFooter>
            }
            header={<CardHeader title="Ganhos" description={``} />}
            content={
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--s-spacing-nano)",
                  }}
                >
                  {skeleton === true ? (
                    <>
                      <Skeleton height="24" width="100" />
                    </>
                  ) : (
                    <h1 className="dinheiro">
                      R$ {showSaldo ? sumGanhos() : "•••••••"}
                    </h1>
                  )}
                  <div
                    className={`porcentagem-ganhos ${
                      ganhoPercentageChange === 0
                        ? "neutral"
                        : ganhoPercentageChange > 0
                          ? "positivo"
                          : "negativo"
                    }`}
                  >
                    {previousMonthGanhos === 0 && currentMonthGanhos === 0 ? (
                      <small>Você ainda não registrou nenhuma entrada</small>
                    ) : previousMonthGanhos === 0 ? (
                      <small>
                        +R${" "}
                        {currentMonthGanhos
                          .toFixed(2)
                          .toString()
                          .replace(".", ",")}{" "}
                        ( 100%) comparado ao período anterior
                        <strong className="material-symbols-outlined sm">
                          trending_up
                        </strong>
                      </small>
                    ) : (
                      <small>
                        {ganhoPercentageChange < 0 ? "-" : "+"}
                        R${" "}
                        {ganhoAmount
                          .toFixed(2)
                          .toString()
                          .replace(".", ",")
                          .replace("-", "")}{" "}
                        (
                        {ganhoPercentageChange
                          .toFixed(2)
                          .toString()
                          .replace(".", ",")}
                        %) comparado ao período anterior
                        <strong className="material-symbols-outlined sm">
                          {ganhoPercentageChange < 0
                            ? "trending_down"
                            : "trending_up"}
                        </strong>
                      </small>
                    )}
                  </div>
                </div>
              </CardContent>
            }
          />
          <Card
            header={<CardHeader title="Despesas" description={``} />}
            content={
              <CardContent>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--s-spacing-nano)",
                  }}
                >
                  {skeleton === true ? (
                    <>
                      <Skeleton height="24" width="100" />
                    </>
                  ) : (
                    <h1 className="dinheiro">
                      R$ {showSaldo ? sumDespesas() : "•••••••"}
                    </h1>
                  )}

                  <div
                    className={`porcentagem-despesas ${
                      despesasPercentageChange === 0
                        ? "neutral"
                        : despesasPercentageChange > 0
                          ? "negativo"
                          : "positivo"
                    }`}
                  >
                    {previousMonthDespesas === 0 &&
                    currentMonthDespesas === 0 ? (
                      <small>Você ainda não registrou nenhuma despesa</small>
                    ) : previousMonthDespesas === 0 ? (
                      <small>
                        {despesasPercentageChange > 0 ? "-" : "+"}
                        {currentMonthDespesas
                          .toFixed(2)
                          .toString()
                          .replace(".", ",")}{" "}
                        (100%) comparado ao período anterior
                        <strong className="material-symbols-outlined sm">
                          trending_up
                        </strong>
                      </small>
                    ) : (
                      <small>
                        {despesasPercentageChange > 0 ? "-" : "+"}
                        R${" "}
                        {despesasAmount
                          .toFixed(2)
                          .toString()
                          .replace(".", ",")
                          .replace("-", "")}{" "}
                        (
                        {despesasPercentageChange
                          .toFixed(2)
                          .toString()
                          .replace(".", ",")}
                        %) comparado ao período anterior
                        <strong className="material-symbols-outlined sm">
                          {despesasPercentageChange > 0
                            ? "trending_down"
                            : "trending_up"}
                        </strong>
                      </small>
                    )}
                  </div>
                </div>
              </CardContent>
            }
            footer={
              <CardFooter>
                <div
                  style={{
                    display: "flex",
                    gap: "var(--s-spacing-xx-small)",
                  }}
                >
                  <Button
                    skeleton={skeleton}
                    label="Adicionar despesa"
                    variant="primary"
                    size="md"
                    onClick={() => navigateTo("/pagina-inicial/despesas")}
                  />
                  <Button
                    skeleton={skeleton}
                    label="Consultar despesas"
                    variant="secondary"
                    size="md"
                    onClick={() => navigateTo("/pagina-inicial/despesas")}
                  />
                </div>
              </CardFooter>
            }
          />
        </div>
        <BarChart
          skeleton={skeleton}
          isYearSelected={isYearSelected}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
          userData={userData}
          loading={skeleton}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          firstDayOfMonth={firstDayOfMonth}
          lastDayOfMonth={lastDayOfMonth}
        />
        <LineChart
          skeleton={skeleton}
          isYearSelected={isYearSelected}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
          userData={userData}
          loading={skeleton}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          firstDayOfMonth={firstDayOfMonth}
          lastDayOfMonth={lastDayOfMonth}
        />
        <div className="layout-resumo">
          <PieChart
            skeleton={skeleton}
            clientDateType="fonteDeRenda"
            isYearSelected={isYearSelected}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            userData={userData}
            loading={skeleton}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            firstDayOfMonth={firstDayOfMonth}
            lastDayOfMonth={lastDayOfMonth}
          />
          <PieChart
            skeleton={skeleton}
            clientDateType="formaDePagamento"
            isYearSelected={isYearSelected}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            userData={userData}
            loading={skeleton}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            firstDayOfMonth={firstDayOfMonth}
            lastDayOfMonth={lastDayOfMonth}
          />
        </div>
        <div className="layout-resumo">
          <PieChart
            skeleton={skeleton}
            clientDateType="categoria"
            isYearSelected={isYearSelected}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            userData={userData}
            loading={skeleton}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            firstDayOfMonth={firstDayOfMonth}
            lastDayOfMonth={lastDayOfMonth}
          />

          <PieChart
            skeleton={skeleton}
            clientDateType="subcategoria"
            isYearSelected={isYearSelected}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            userData={userData}
            loading={skeleton}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            firstDayOfMonth={firstDayOfMonth}
            lastDayOfMonth={lastDayOfMonth}
          />
        </div>{" "}
      </div>
    </Page>
  );
};

export default HomePage;

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
  const { userData, loading, fetchUserData } = useUser();
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
    fetchUserData();
  }, []);

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
        const amountString =
          typeof transaction.amount === "string" ? transaction.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;
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
        const amountString =
          typeof expense.amount === "string" ? expense.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;
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
    if (!userData?.user || !Array.isArray(userData.user.transactions)) {
      return "0,00";
    }

    const totalGanhos = userData.user.transactions.reduce(
      (acc, transaction) => {
        const amountString =
          typeof transaction.amount === "string" ? transaction.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;
        return acc + amount;
      },
      0,
    );

    if (!userData?.user || !Array.isArray(userData.user.expense)) {
      return "0,00";
    }

    const totalDespesa = userData.user.expense.reduce((acc, expense) => {
      const amountString =
        typeof expense.amount === "string" ? expense.amount : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;
      return acc + amount;
    }, 0);

    return (totalGanhos - totalDespesa).toLocaleString("pt-BR", {
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
    let percentageChange;
    let difference = currentValue - previousValue;

    if (previousValue === 0) {
      percentageChange = currentValue > 0 ? 100 : 0;
    } else {
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
        const amountString =
          typeof transaction.amount === "string" ? transaction.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;
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
        const amountString =
          typeof expense.amount === "string" ? expense.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;
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
    currentMonthGanhos,
    previousMonthGanhos,
  );
  const despesasChangeResult = calculatePercentageChange(
    currentMonthDespesas,
    previousMonthDespesas,
  );

  const ganhoPercentageChange = ganhoChangeResult.percentageChange;
  const ganhoAmount = ganhoChangeResult.amount;

  const despesasPercentageChange = despesasChangeResult.percentageChange;
  const despesasAmount = despesasChangeResult.amount;

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

  return (
    <Page
      skeletonButtonPrimary={loading}
      skeletonButtonSecondary={loading}
      namePage={`Confira suas finanças, ${loading === true ? "... " : userData?.user.name}!`}
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
                    skeleton={loading}
                    label="Adicionar ganho"
                    variant="primary"
                    size="md"
                    onClick={() => navigateTo("/pagina-inicial/ganhos")}
                  />
                  <Button
                    skeleton={loading}
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
                  {loading === true ? (
                    <>
                      <Skeleton height="32" width="100" />
                    </>
                  ) : (
                    <h1 className="dinheiro">
                      R$ {showSaldo ? sumGanhos() : "•••••••"}
                    </h1>
                  )}
                  <div
                    className={`porcentagem-ganhos ${parseFloat(ganhoPercentageChange.toFixed(2)) == 0 ? "neutral" : parseFloat(ganhoPercentageChange.toFixed(2)) > 0 ? "positivo" : "negativo"}`}
                  >
                    {parseFloat(ganhoPercentageChange.toFixed(2)) == 0 ? (
                      <small>Você ainda não registrou nenhuma entrada</small>
                    ) : (
                      <small>
                        {parseFloat(ganhoPercentageChange.toFixed(2)) < 0
                          ? "-"
                          : "+"}
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
                        %) comparado ao periodo anterior
                        <strong className="material-symbols-outlined sm">
                          {parseFloat(ganhoPercentageChange.toFixed(2)) < 0
                            ? "trending_down"
                            : "trending_up"}
                        </strong>
                      </small>
                    )}
                  </div>
                </div>
              </CardContent>
            }
          ></Card>
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
                  {loading === true ? (
                    <>
                      <Skeleton height="32" width="100" />
                    </>
                  ) : (
                    <h1 className="dinheiro">
                      R$ {showSaldo ? sumDespesas() : "•••••••"}
                    </h1>
                  )}

                  <div
                    className={`porcentagem-despesas ${parseFloat(despesasPercentageChange.toFixed(2)) == 0 ? "neutral" : parseFloat(despesasPercentageChange.toFixed(2)) < 0 ? "positivo" : "negativo"}`}
                  >
                    {parseFloat(despesasPercentageChange.toFixed(2)) == 0 ? (
                      <small>Você ainda não registrou nenhuma despesa</small>
                    ) : (
                      <small>
                        {parseFloat(despesasPercentageChange.toFixed(2)) > 0
                          ? "-"
                          : "+"}
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
                        %) comparado ao periodo anterior
                        <strong className="material-symbols-outlined sm">
                          {parseFloat(despesasPercentageChange.toFixed(2)) > 0
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
                    skeleton={loading}
                    label="Adicionar despesa"
                    variant="primary"
                    size="md"
                    onClick={() => navigateTo("/pagina-inicial/despesas")}
                  />
                  <Button
                    skeleton={loading}
                    label="Consultar despesas"
                    variant="secondary"
                    size="md"
                    onClick={() => navigateTo("/pagina-inicial/despesas")}
                  />
                </div>
              </CardFooter>
            }
          ></Card>
        </div>
        <BarChart
          skeleton={loading}
          isYearSelected={isYearSelected}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
          userData={userData}
          loading={loading}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          firstDayOfMonth={firstDayOfMonth}
          lastDayOfMonth={lastDayOfMonth}
        />
        <LineChart
          skeleton={loading}
          isYearSelected={isYearSelected}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
          userData={userData}
          loading={loading}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          firstDayOfMonth={firstDayOfMonth}
          lastDayOfMonth={lastDayOfMonth}
        />
        <div className="layout-resumo">
          <PieChart
            skeleton={loading}
            clientDateType="fonteDeRenda"
            isYearSelected={isYearSelected}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            userData={userData}
            loading={loading}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            firstDayOfMonth={firstDayOfMonth}
            lastDayOfMonth={lastDayOfMonth}
          />
          <PieChart
            skeleton={loading}
            clientDateType="formaDePagamento"
            isYearSelected={isYearSelected}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            userData={userData}
            loading={loading}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            firstDayOfMonth={firstDayOfMonth}
            lastDayOfMonth={lastDayOfMonth}
          />
        </div>
        <div className="layout-resumo">
          <PieChart
            skeleton={loading}
            clientDateType="categoria"
            isYearSelected={isYearSelected}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            userData={userData}
            loading={loading}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            firstDayOfMonth={firstDayOfMonth}
            lastDayOfMonth={lastDayOfMonth}
          />

          <PieChart
            skeleton={loading}
            clientDateType="subcategoria"
            isYearSelected={isYearSelected}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
            userData={userData}
            loading={loading}
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

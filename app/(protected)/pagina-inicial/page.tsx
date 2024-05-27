"use client";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Page,
} from "design-system-zeroz";
import LayoutPage from "../_components/layout";
import { useCurrentUser } from "@/hooks/user-current-user";
import React from "react";
import { useRouter } from "next/navigation";

import "./pagina-inicial.scss";
import Pizza from "@/components/graficos/pizza/pizza";
import Barras from "@/components/graficos/barras/barras";

const HomePage = () => {
  const router = useRouter();

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const sumGanhos = () => {
    if (!user || !Array.isArray(user.transactions)) {
      return "0,00";
    }

    const total = user.transactions.reduce((acc: any, transaction: any) => {
      const amountString =
        typeof transaction.amount === "string"
          ? transaction.amount.toString()
          : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;
      return acc + amount;
    }, 0);

    return total.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sumDespesas = () => {
    if (!user || !Array.isArray(user.expense)) {
      return "0,00";
    }

    const total = user.expense.reduce((acc: any, expense: any) => {
      const amountString =
        typeof expense.amount === "string" ? expense.amount.toString() : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;
      return acc + amount;
    }, 0);

    return total.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const sumSaldo = () => {
    if (
      !user ||
      !Array.isArray(user.transactions) ||
      !Array.isArray(user.expense)
    ) {
      return "0,00";
    }

    const totalTransactions = user.transactions.reduce(
      (acc: any, transaction: any) => {
        const amountString =
          typeof transaction.amount === "string"
            ? transaction.amount.toString()
            : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;
        return acc + amount;
      },
      0,
    );

    const totalExpenses = user.expense.reduce((acc: any, expense: any) => {
      const amountString =
        typeof expense.amount === "string" ? expense.amount.toString() : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;
      return acc + amount;
    }, 0);

    const saldo = totalTransactions - totalExpenses;

    return saldo.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const user = useCurrentUser();

  const categoryTotals: { [categoryId: string]: number } = {};

  if (Array.isArray(user?.transactions) && user.transactions.length > 0) {
    user.transactions.forEach((transaction: any) => {
      const categoryId = transaction.categoryId;
      const amountString =
        typeof transaction.amount === "string"
          ? transaction.amount.toString()
          : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;

      if (categoryTotals[categoryId]) {
        categoryTotals[categoryId] += amount;
      } else {
        categoryTotals[categoryId] = amount;
      }
    });
  }

  const colors: any = [
    "var(--s-color-fill-highlight)",
    "#873BEC",
    "#DB2777",
    "#027AC7",
    "#138480",
  ];

  const dataFonteDeRenda = Object.keys(categoryTotals).map(
    (categoryId, index) => ({
      name:
        user.categories.find((category: any) => category.id === categoryId)
          ?.name || "Unknown Category",
      amount: parseFloat(categoryTotals[categoryId].toFixed(2)),
      fill: colors[index % colors.length],
    }),
  );

  const categoriaTotals: { [categoriaId: string]: number } = {};

  if (Array.isArray(user?.expense) && user.expense.length > 0) {
    user.expense.forEach((expense: any) => {
      const categoriaId = expense.categoriaId;
      const amountString =
        typeof expense.amount === "string" ? expense.amount.toString() : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;

      if (categoriaTotals[categoriaId]) {
        categoriaTotals[categoriaId] += amount;
      } else {
        categoriaTotals[categoriaId] = amount;
      }
    });
  }

  const dataDespesas = Object.keys(categoriaTotals).map(
    (categoryId, index) => ({
      name:
        user.categoria.find((category: any) => category.id === categoryId)
          ?.name || "Unknown Category",
      amount: parseFloat(categoriaTotals[categoryId].toFixed(2)),
      fill: colors[index % colors.length],
    }),
  );

  const getFormattedDate = (date: any) => {
    const options = { day: "numeric", month: "numeric", year: "numeric" };
    return date.toLocaleDateString("pt-BR", options);
  };

  const currentDate = new Date();
  const dates = [];

  for (let i = -4; i <= 4; i++) {
    const date = new Date(currentDate);
    date.setDate(currentDate.getDate() + i);
    dates.push(date);
  }

  const dataBarras = dates.map((date) => {
    const formattedDate = getFormattedDate(date);
    console.log("Formatted Date:", formattedDate);

    const transactionsForDate = user.transactions.filter((transaction: any) => {
      const transactionDate = new Date(transaction.date);
      console.log("Transaction Date:", transactionDate);
      console.log("Filtering for:", date);
      return (
        transactionDate.getDate() === date.getDate() &&
        transactionDate.getMonth() === date.getMonth() &&
        transactionDate.getFullYear() === date.getFullYear()
      );
    });
    console.log("Transactions for Date:", transactionsForDate);

    const expensesForDate = user.expense.filter((expense: any) => {
      const expenseDate = new Date(expense.date);
      console.log("Expense Date:", expenseDate);
      console.log("Filtering for:", date);
      return (
        expenseDate.getDate() === date.getDate() &&
        expenseDate.getMonth() === date.getMonth() &&
        expenseDate.getFullYear() === date.getFullYear()
      );
    });
    console.log("Expenses for Date:", expensesForDate);

    const totalGanhos = transactionsForDate.reduce(
      (acc: any, transaction: any) =>
        acc + parseFloat(transaction.amount.replace(",", ".")),
      0,
    );
    console.log("Total Ganhos:", totalGanhos);

    const totalDespesas = expensesForDate.reduce(
      (acc: any, expense: any) =>
        acc + parseFloat(expense.amount.replace(",", ".")),
      0,
    );
    console.log("Total Despesas:", totalDespesas);

    return {
      name: formattedDate,
      ganhos: totalGanhos,
      despesas: totalDespesas,
    };
  });

  return (
    <>
      <Page columnLayout="1" namePage={`Confira suas finanças, ${user?.name}!`}>
        <div className="layout-page">
          <div className="layout-sub-page">
            <div className="col-4">
              <Card>
                <CardHeader title="Ganhos:" description={``} />
                <CardContent>
                  <h1 className="dinheiro"> R$ {sumGanhos()}</h1>
                  <p className="porcentagem">20%</p>
                  <div style={{ width: "min-content" }}>
                    <Button
                      label="Ver mais"
                      variant="primary"
                      size="md"
                      onClick={() =>
                        navigateTo("/pagina-inicial/entradas/ganhos")
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-4">
              <Card>
                <CardHeader title="Despesas:" description={``} />
                <CardContent>
                  <h1 className="dinheiro"> R$ {sumDespesas()}</h1>
                  <p className="porcentagem">20%</p>
                  <div style={{ width: "min-content" }}>
                    <Button
                      label="Ver mais"
                      variant="primary"
                      size="md"
                      onClick={() =>
                        navigateTo("/pagina-inicial/saidas/despesas")
                      }
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-4">
              <Card>
                <CardHeader title="Saldo Total:" description={``} />
                <CardContent>
                  <h1 className="dinheiro"> R$ {sumSaldo()}</h1>
                  <p className="porcentagem">20%</p>
                  <div style={{ width: "min-content" }}>
                    <Button
                      label="Ver mais"
                      variant="primary"
                      size="md"
                      onClick={() => navigateTo("/home/saldo")}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <div className="col-12">
            <Card>
              <CardHeader title="Ganhos x Despesas" description={``} />
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <Barras data={dataBarras} />
              </div>
              <CardFooter>
                <div></div>
              </CardFooter>
            </Card>
          </div>
          <div className="layout-sub-page">
            <div className="col-6">
              <Card>
                <CardHeader title="Fontes de Renda" description={``} />
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Pizza data={dataFonteDeRenda} />
                </div>
                <CardFooter>
                  <div></div>
                </CardFooter>
              </Card>
            </div>
            <div className="col-6">
              <Card>
                <CardHeader title="Despesas" description={``} />
                <div
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "center",
                  }}
                >
                  <Pizza data={dataDespesas} />
                </div>
                <CardFooter>
                  <div></div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </Page>
    </>
  );
};

export default HomePage;

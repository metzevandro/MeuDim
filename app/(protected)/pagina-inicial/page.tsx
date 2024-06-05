"use client";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Page,
} from "design-system-zeroz";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import "./pagina-inicial.scss";
import Pizza from "@/components/graficos/pizza/pizza";
import Barras from "@/components/graficos/barras/barras";
import AreaGraphic from "@/components/graficos/area/area";

interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

interface Transaction {
  id: string;
  name: string;
  amount: string;
  createdAt: string;
  userId: string;
  categoryId: string;
  category: Category;
}

interface Expense {
  id: string;
  name: string;
  amount: string;
  createdAt: string;
  userId: string;
  categoriaId: string;
  categoria: Category;
}

interface User {
  name: string;
  email: string;
  image: string | null;
  id: string;
  role: string;
  categories: Category[];
  transactions: Transaction[];
  expense: Expense[];
}

interface UserData {
  user: User;
  expires: string;
}

const API = process.env.NEXT_PUBLIC_APP_URL;

const HomePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  async function fetchUserData() {
    try {
      const response = await fetch(`${API}/api/auth/session`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      setUserData(userData);
    } catch (error) {
      console.log(error);
    }
  }

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
      const amountString = typeof transaction.amount === "string" ? transaction.amount : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;
      return acc + amount;
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
      const amountString = typeof expense.amount === "string" ? expense.amount : "";
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
      !userData?.user ||
      !Array.isArray(userData.user.transactions) ||
      !Array.isArray(userData.user.expense)
    ) {
      return "0,00";
    }

    const totalTransactions = userData.user.transactions.reduce(
      (acc, transaction) => {
        const amountString = typeof transaction.amount === "string" ? transaction.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;
        return acc + amount;
      },
      0
    );

    const totalExpenses = userData.user.expense.reduce((acc, expense) => {
      const amountString = typeof expense.amount === "string" ? expense.amount : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;
        return acc + amount;
    }, 0);

    const saldo = totalTransactions - totalExpenses;

    return saldo.toLocaleString("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const categoryTotals: { [categoryId: string]: number } = {};

  if (Array.isArray(userData?.user?.transactions) && userData.user.transactions.length > 0) {
    userData.user.transactions.forEach((transaction) => {
      const categoryId = transaction.categoryId;
      const amountString = typeof transaction.amount === "string" ? transaction.amount : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;

      if (categoryTotals[categoryId]) {
        categoryTotals[categoryId] += amount;
      } else {
        categoryTotals[categoryId] = amount;
      }
    });
  }

  const colors = [
    "var(--s-color-fill-highlight)",
    "#873BEC",
    "#DB2777",
    "#027AC7",
    "#138480",
  ];

  const dataFonteDeRenda = Object.keys(categoryTotals).map((categoryId, index) => ({
    name: userData?.user.categories.find((category) => category.id === categoryId)?.name || "Unknown Category",
    amount: parseFloat(categoryTotals[categoryId].toFixed(2)),
    fill: colors[index % colors.length],
  }));

  const categoriaTotals: { [categoriaId: string]: number } = {};

  if (Array.isArray(userData?.user?.expense) && userData.user.expense.length > 0) {
    userData.user.expense.forEach((expense) => {
      const categoriaId = expense.categoriaId;
      const amountString = typeof expense.amount === "string" ? expense.amount : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;

      if (categoriaTotals[categoriaId]) {
        categoriaTotals[categoriaId] += amount;
      } else {
        categoriaTotals[categoriaId] = amount;
      }
    });
  }

  const dataDespesas = Object.keys(categoriaTotals).map((categoriaId, index) => ({
    name: userData?.user.categories.find((category) => category.id === categoriaId)?.name || "Unknown Category",
    amount: parseFloat(categoriaTotals[categoriaId].toFixed(2)),
    fill: colors[index % colors.length],
  }));

  const getFormattedDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = { day: "numeric", month: "numeric" };
    return date.toLocaleDateString("pt-BR", options);
  };  

  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

  const dates = [];
  for (let i = firstDayOfMonth.getDate(); i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
    dates.push(date);
  }

  const dataArea = dates.map((date) => {
    const formattedDate = getFormattedDate(date);

    const transactionsUntilDate = userData?.user?.transactions?.filter(
      (transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate <= date;
      }
    ) || [];

    const totalGanhos = transactionsUntilDate.reduce(
      (acc, transaction) => acc + parseFloat(transaction.amount.replace(",", ".")),
      0
    );

    const expensesUntilDate = userData?.user?.expense?.filter((expense) => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate <= date;
    }) || [];

    const totalDespesas = expensesUntilDate.reduce(
      (acc, expense) => acc + parseFloat(expense.amount.replace(",", ".")),
      0
    );

    const saldoTotal = totalGanhos - totalDespesas;

    return {
      name: formattedDate,
      Saldo: saldoTotal,
    };
  });

  const dataBarras = dates.map((date) => {
    const formattedDate = getFormattedDate(date);

    const transactionsForDate = userData?.user?.transactions?.filter((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      return transactionDate.getDate() === date.getDate() && transactionDate.getMonth() === date.getMonth();
    }) || [];

    const totalGanhos = transactionsForDate.reduce(
      (acc, transaction) => acc + parseFloat(transaction.amount.replace(",", ".")),
      0
    );

    const expensesForDate = userData?.user?.expense?.filter((expense) => {
      const expenseDate = new Date(expense.createdAt);
      return expenseDate.getDate() === date.getDate() && expenseDate.getMonth() === date.getMonth();
    }) || [];

    const totalDespesas = expensesForDate.reduce(
      (acc, expense) => acc + parseFloat(expense.amount.replace(",", ".")),
      0
    );

    return {
      name: formattedDate,
      Despesas: totalDespesas,
      Ganhos: totalGanhos,
    };
  });

  return (
    <>
      <Page columnLayout="1" namePage={`Confira suas finanças, ${userData?.user?.name}!`}>
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
                      onClick={() => navigateTo("/pagina-inicial/entradas/ganhos")}
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
                      onClick={() => navigateTo("/pagina-inicial/saidas/despesas")}
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
              <CardContent>
                <Barras data={dataBarras} />
              </CardContent>
              <CardFooter>
                <div></div>
              </CardFooter>
            </Card>
          </div>
          <div className="col-12">
            <Card>
              <CardHeader title="Saldo Total" description={``} />
              <CardContent>
                <AreaGraphic data={dataArea} />
              </CardContent>
              <CardFooter>
                <div></div>
              </CardFooter>
            </Card>
          </div>
          <div className="layout-sub-page">
            <div className="col-6">
              <Card>
                <CardHeader title="Fontes de Renda" description={``} />
                <CardContent>
                  <Pizza data={dataFonteDeRenda} />
                </CardContent>
                <CardFooter>
                  <div></div>
                </CardFooter>
              </Card>
            </div>
            <div className="col-6">
              <Card>
                <CardHeader title="Despesas" description={``} />
                <CardContent>
                  <Pizza data={dataDespesas} />
                </CardContent>
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

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
import Pizza from "@/components/graficos/pizza/pizza";
import Barras from "@/components/graficos/barras/barras";
import AreaGraphic from "@/components/graficos/area/area";
import { FonteDeRenda } from "@prisma/client";

interface Subcategorias {
  id: string;
  name: string;
  categoriaId: string;
}

interface Category {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
  Subcategorias: Subcategorias[];
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

interface FormaDePagamento {
  id: string;
  name: string;
  userId: string;
  createdAt: string;
}

interface Expense {
  id: string;
  name: string;
  amount: string;
  createdAt: string;
  userId: string;
  categoriaId: string;
  formaDePagamentoId: string;
  formaDePagamento: FormaDePagamento;
  subcategoriaId: string;
}

interface User {
  name: string;
  email: string;
  image: string | null;
  id: string;
  role: string;
  formaDePagamento: FormaDePagamento[];
  categoria: Category[];
  transactions: Transaction[];
  expense: Expense[];
  categories: FonteDeRenda[];
}

interface UserData {
  user: User;
  expires: string;
}

const API = process.env.NEXT_PUBLIC_APP_URL;

const HomePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth(),
  );
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear(),
  );

  const firstDayOfMonth = new Date(selectedYear, selectedMonth, 1);
  const lastDayOfMonth = new Date(selectedYear, selectedMonth + 1, 0);

  const colors = [
    "var(--s-color-fill-highlight)",
    "#873BEC",
    "#DB2777",
    "#027AC7",
    "#138480",
  ];

  const dates = [];
  for (let i = firstDayOfMonth.getDate(); i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(selectedYear, selectedMonth, i);
    dates.push(date);
  }

  async function fetchUserData() {
    try {
      const response = await fetch(`${API}/api/auth/session`);
      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }
      const userData = await response.json();
      setUserData(userData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserData();
  }, [selectedMonth, selectedYear]);

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
        transactionDate >= firstDayOfMonth &&
        transactionDate <= lastDayOfMonth
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
      if (expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth) {
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

  const categoryTotals: { [categoryId: string]: number } = {};

  if (
    Array.isArray(userData?.user?.transactions) &&
    userData.user.transactions.length > 0
  ) {
    userData.user.transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.createdAt);
      if (
        transactionDate >= firstDayOfMonth &&
        transactionDate <= lastDayOfMonth
      ) {
        const categoryId = transaction.categoryId;
        const amountString =
          typeof transaction.amount === "string" ? transaction.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;

        if (categoryTotals[categoryId]) {
          categoryTotals[categoryId] += amount;
        } else {
          categoryTotals[categoryId] = amount;
        }
      }
    });
  }

  const dataFonteDeRenda = Object.keys(categoryTotals).map(
    (categoryId, index) => ({
      name:
        userData?.user.categories.find((category) => category.id === categoryId)
          ?.name || "Unknown Category",
      amount: parseFloat(categoryTotals[categoryId].toFixed(2)),
      fill: colors[index % colors.length],
    }),
  );

  const formasDePagamentoTotals: { [formaDePagamentoId: string]: number } = {};

  if (
    Array.isArray(userData?.user?.expense) &&
    userData.user.expense.length > 0
  ) {
    userData.user.expense.forEach((expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth) {
        const formaDePagamentoId = expense.formaDePagamentoId;
        const amountString =
          typeof expense.amount === "string" ? expense.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;

        if (formasDePagamentoTotals[formaDePagamentoId]) {
          formasDePagamentoTotals[formaDePagamentoId] += amount;
        } else {
          formasDePagamentoTotals[formaDePagamentoId] = amount;
        }
      }
    });
  }

  const dataFormasDePagamento = Object.keys(formasDePagamentoTotals).map(
    (formaDePagamentoId, index) => {
      const formaDePagamento = userData?.user?.formaDePagamento?.find(
        (formaDePagamento) => formaDePagamento.id === formaDePagamentoId,
      );
      return {
        name: formaDePagamento?.name || "Unknown Category",
        amount: parseFloat(
          formasDePagamentoTotals[formaDePagamentoId].toFixed(2),
        ),
        fill: colors[index % colors.length],
      };
    },
  );

  const categoriaTotals: { [categoriaId: string]: number } = {};

  if (
    Array.isArray(userData?.user?.expense) &&
    userData.user.expense.length > 0
  ) {
    userData.user.expense.forEach((expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth) {
        const categoriaId = expense.categoriaId;
        const amountString =
          typeof expense.amount === "string" ? expense.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;

        if (categoriaTotals[categoriaId]) {
          categoriaTotals[categoriaId] += amount;
        } else {
          categoriaTotals[categoriaId] = amount;
        }
      }
    });
  }

  const dataCategorias = Object.keys(categoriaTotals).map(
    (categoriaId, index) => {
      const categoria = userData?.user?.categoria?.find(
        (categorias) => categorias.id === categoriaId,
      );
      return {
        name: categoria?.name || "Unknown Category",
        amount: parseFloat(categoriaTotals[categoriaId].toFixed(2)),
        fill: colors[index % colors.length],
      };
    },
  );

  const getFormattedDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "numeric",
    };
    return date.toLocaleDateString("pt-BR", options);
  };

  const dataArea = dates.map((date) => {
    const formattedDate = getFormattedDate(date);

    const transactionsUntilDate =
      userData?.user?.transactions?.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return transactionDate <= date;
      }) || [];

    const totalGanhos = transactionsUntilDate.reduce(
      (acc, transaction) =>
        acc + parseFloat(transaction.amount.replace(",", ".")),
      0,
    );

    const expensesUntilDate =
      userData?.user?.expense?.filter((expense) => {
        const expenseDate = new Date(expense.createdAt);
        return expenseDate <= date;
      }) || [];

    const totalDespesas = expensesUntilDate.reduce(
      (acc, expense) => acc + parseFloat(expense.amount.replace(",", ".")),
      0,
    );

    const saldoTotal = totalGanhos - totalDespesas;

    return {
      data: formattedDate,
      Saldo: saldoTotal,
    };
  });

  const dataBarras = dates.map((date) => {
    const formattedDate = getFormattedDate(date);

    const transactionsForDate =
      userData?.user?.transactions?.filter((transaction) => {
        const transactionDate = new Date(transaction.createdAt);
        return (
          transactionDate.getDate() === date.getDate() &&
          transactionDate.getMonth() === date.getMonth() &&
          transactionDate.getFullYear() === date.getFullYear()
        );
      }) || [];

    const totalGanhos = transactionsForDate.reduce(
      (acc, transaction) =>
        acc + parseFloat(transaction.amount.replace(",", ".")),
      0,
    );

    const expensesForDate =
      userData?.user?.expense?.filter((expense) => {
        const expenseDate = new Date(expense.createdAt);
        return (
          expenseDate.getDate() === date.getDate() &&
          expenseDate.getMonth() === date.getMonth() &&
          expenseDate.getFullYear() === date.getFullYear()
        );
      }) || [];

    const totalDespesas = expensesForDate.reduce(
      (acc, expense) => acc + parseFloat(expense.amount.replace(",", ".")),
      0,
    );

    return {
      data: formattedDate,
      Despesas: totalDespesas,
      Ganhos: totalGanhos,
    };
  });

  const SubcategoriaTotals: { [SubcategoriaId: string]: number } = {};

  if (
    Array.isArray(userData?.user?.expense) &&
    userData.user.expense.length > 0
  ) {
    userData.user.expense.forEach((expense) => {
      const expenseDate = new Date(expense.createdAt);
      if (expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth) {
        const subcategoriaId = expense.subcategoriaId;
        const amountString =
          typeof expense.amount === "string" ? expense.amount : "";
        const amount = parseFloat(amountString.replace(",", ".")) || 0;

        if (SubcategoriaTotals[subcategoriaId]) {
          SubcategoriaTotals[subcategoriaId] += amount;
        } else {
          SubcategoriaTotals[subcategoriaId] = amount;
        }
      }
    });
  }

  const dataSubCategorias = Object.keys(SubcategoriaTotals).map(
    (subcategoriaId, index) => {
      let subcategoriaName = "Unknown Subcategory";
      userData?.user?.categoria.forEach((categoria) => {
        const foundSubcategoria = categoria.Subcategorias.find(
          (subcategoria) => subcategoria.id === subcategoriaId,
        );
        if (foundSubcategoria) {
          subcategoriaName = foundSubcategoria.name;
        }
      });
      return {
        name: subcategoriaName,
        amount: parseFloat(SubcategoriaTotals[subcategoriaId].toFixed(2)),
        fill: colors[index % colors.length],
      };
    },
  );

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
  ];

  return (
    <>
      <Page
        columnLayout="1"
        namePage={`Confira suas finanças, ${loading === true ? '... ' : userData?.user?.name}!`}
      >
        <div className="layout-page">
          <div className="input-field">
            <InputSelect
              label="Mês"
              options={monthOptions.map((option) => option.label)}
              value={monthOptions[selectedMonth].label}
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
          <h1 className="titles-page">Resumo</h1>
          <div className="layout-sub-page">
            <div className="col-6">
              <Card>
                <CardHeader title="Ganhos:" description={``} />
                <CardContent>
                  {loading === true ? (
                    <>
                      <Skeleton height="32" width="100" />
                    </>
                  ) : (
                    <h1 className="dinheiro">R$ {sumGanhos()}</h1>
                  )}
                  <p className="porcentagem">20%</p>
                  <div style={{ width: "min-content" }}>
                    {loading == true ? (
                      <Skeleton height="40" width="80" />
                    ) : (
                      <Button
                        label="Ver mais"
                        variant="primary"
                        size="md"
                        onClick={() =>
                          navigateTo("/pagina-inicial/entradas/ganhos")
                        }
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="col-6">
              <Card>
                <CardHeader title="Despesas:" description={``} />
                <CardContent>
                  {loading === true ? (
                    <>
                      <Skeleton height="32" width="100" />
                    </>
                  ) : (
                    <h1 className="dinheiro">R$ {sumDespesas()}</h1>
                  )}
                  <p className="porcentagem">20%</p>
                  <div style={{ width: "min-content" }}>
                    {loading == true ? (
                      <Skeleton height="40" width="80" />
                    ) : (
                      <Button
                        label="Ver mais"
                        variant="primary"
                        size="md"
                        onClick={() =>
                          navigateTo("/pagina-inicial/saidas/despesas")
                        }
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
          <h1 className="titles-page">Visão geral</h1>
          <div className="col-12">
            <Card>
              <CardHeader title="Ganhos x Despesas" description={``} />
              <CardContent>
                <Barras data={dataBarras} loading={loading} />
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
                <AreaGraphic data={dataArea} loading={loading} />
              </CardContent>
              <CardFooter>
                <div></div>
              </CardFooter>
            </Card>
          </div>
          <div className="layout-sub-page">
            <div className="col-6">
              <Card>
                <CardHeader title="Fontes de renda" description={``} />
                <CardContent>
                  <Pizza
                    pizza={1}
                    name="ganho"
                    data={dataFonteDeRenda}
                    loading={loading}
                  />
                </CardContent>
                <CardFooter>
                  <div></div>
                </CardFooter>
              </Card>
            </div>
            <div className="col-6">
              <Card>
                <CardHeader title="Formas de pagamento" description={``} />
                <CardContent>
                  <Pizza
                    pizza={1}
                    name="despesa"
                    data={dataFormasDePagamento}
                    loading={loading}
                  />
                </CardContent>
                <CardFooter>
                  <div></div>
                </CardFooter>
              </Card>
            </div>
          </div>
          <div className="layout-sub-page">
            <div className="col-6">
              <Card>
                <CardHeader title="Categorias" description={``} />
                <CardContent>
                  <Pizza
                    pizza={2}
                    name="Categorias"
                    data={dataCategorias}
                    loading={loading}
                  />
                </CardContent>
                <CardFooter>
                  <div></div>
                </CardFooter>
              </Card>
            </div>
            <div className="col-6">
              <Card>
                <CardHeader title="Subcategorias" description={``} />
                <CardContent>
                  <Pizza
                    pizza={2}
                    name="subcategoria"
                    data={dataSubCategorias}
                    loading={loading}
                  />
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

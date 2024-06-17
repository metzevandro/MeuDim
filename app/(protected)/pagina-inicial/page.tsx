"use client";
import {
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  Icon,
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
import { Expense, fetchUserData, Transaction, UserData } from "@/actions/fetch";

const HomePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
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

  const colors = [
    "var(--s-color-fill-highlight)",
    "#873BEC",
    "#DB2777",
    "#027AC7",
    "#138480",
  ];

  const dates = [];
  for (let i = firstDayOfMonth.getDate(); i <= lastDayOfMonth.getDate(); i++) {
    const date = new Date(selectedYear, isYearSelected ? 0 : selectedMonth, i);
    dates.push(date);
  }

  useEffect(() => {
    fetchUserData(setUserData, setLoading);
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
            userData?.user?.transactions?.filter((transaction) => {
              const transactionDate = new Date(transaction.createdAt);
              return transactionDate <= lastDay;
            }) || [];

          const totalGanhos = transactionsUntilDate.reduce(
            (acc, transaction) =>
              acc + parseFloat(transaction.amount.replace(",", ".")),
            0,
          );

          const expensesUntilDate =
            userData?.user?.expense?.filter((expense) => {
              const expenseDate = new Date(expense.createdAt);
              return expenseDate <= lastDay;
            }) || [];

          const totalDespesas = expensesUntilDate.reduce(
            (acc, expense) =>
              acc + parseFloat(expense.amount.replace(",", ".")),
            0,
          );

          return {
            data: formattedDate,
            saldoTotal: totalGanhos - totalDespesas,
          };
        })
      : dates.map((date) => {
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
            (acc, expense) =>
              acc + parseFloat(expense.amount.replace(",", ".")),
            0,
          );

          return {
            data: formattedDate,
            saldoTotal: totalGanhos - totalDespesas,
          };
        });

  const dataBarras =
    selectedMonth === 12
      ? Array.from({ length: 12 }, (_, month) => {
          const firstDay = new Date(selectedYear, month, 1);
          const lastDay = new Date(selectedYear, month + 1, 0);
          const formattedDate = firstDay.toLocaleString("pt-BR", {
            month: "short",
            year: "numeric",
          });

          const totalGanhos =
            userData?.user?.transactions?.reduce((acc, transaction) => {
              const transactionDate = new Date(transaction.createdAt);
              if (transactionDate >= firstDay && transactionDate <= lastDay) {
                const amount =
                  parseFloat(transaction.amount.replace(",", ".")) || 0;
                return acc + amount;
              }
              return acc;
            }, 0) || 0;

          const totalDespesas =
            userData?.user?.expense?.reduce((acc, expense) => {
              const expenseDate = new Date(expense.createdAt);
              if (expenseDate >= firstDay && expenseDate <= lastDay) {
                const amount =
                  parseFloat(expense.amount.replace(",", ".")) || 0;
                return acc + amount;
              }
              return acc;
            }, 0) || 0;

          return {
            data: formattedDate,
            Despesas: totalDespesas,
            Ganhos: totalGanhos,
          };
        })
      : dates.map((date) => {
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
            (acc, expense) =>
              acc + parseFloat(expense.amount.replace(",", ".")),
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
        <div className="layout-sub-page-50">
          <h5 className="titles-page">Resumo</h5>
          <div className="col-12">
            <div className="col-6">
              <Card>
                <CardHeader title="Ganhos" description={``} />
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
              </Card>
            </div>
            <div className="col-6">
              <Card>
                <CardHeader title="Despesas" description={``} />
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
                        <small>Você ainda não registrou nenhuma entrada</small>
                      ) : (
                        <small>
                          {parseFloat(despesasPercentageChange.toFixed(2)) < 0
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
              </Card>
            </div>
          </div>
        </div>
        <div className="layout-sub-page-100">
          {" "}
          <h5 className="titles-page">Visão geral</h5>
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
        <div className="layout-sub-page-50">
          <div className="col-12">
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
        </div>
        <div className="layout-sub-page-50">
          <div className="col-12">
            <div className="col-6">
              <Card>
                <CardHeader title="Categorias" description={``} />
                <CardContent>
                  <Pizza
                    pizza={2}
                    name="despesa"
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
                    name="despesa"
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
      </div>
    </Page>
  );
};

export default HomePage;

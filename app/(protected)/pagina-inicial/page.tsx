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

const HomePage = () => {
  const router = useRouter();
  const user = useCurrentUser();

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

  return (
    <>
      <>
        <Page
          columnLayout="1"
          namePage={`Confira suas finanças, ${user?.name}!`}
        >
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
                  <Pizza />
                </div>
                <CardFooter>
                  <div></div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </Page>
      </>
    </>
  );
};

export default HomePage;

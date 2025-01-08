import React, { useEffect, useRef, useState } from "react";
import "./PieChart.scss";
import {
  Card,
  CardContent,
  CardHeader,
  PieChart as Chart,
  EmptyState,
} from "design-system-zeroz";

interface PieData {
  name: string;
  amount: number;
  fill: string;
  quantity: number;
  keyName: string;
}

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
  clientDateType:
    | "formaDePagamento"
    | "categoria"
    | "subcategoria"
    | "fonteDeRenda";
  skeleton: boolean;
}

export function PieChart({
  userData,
  loading,
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
  isYearSelected,
  firstDayOfMonth,
  lastDayOfMonth,
  clientDateType,
  skeleton,
}: LineChartProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
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

  const processFormaDePagamento = () => {
    const totals: { [key: string]: number } = {};
    if (
      Array.isArray(userData?.user?.expense) &&
      userData.user.expense.length > 0
    ) {
      userData.user.expense.forEach((expense: any) => {
        const expenseDate = new Date(expense.createdAt);
        if (expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth) {
          const formaDePagamentoId = expense.formaDePagamentoId;
          const amountString =
            typeof expense.amount === "string" ? expense.amount : "";
          const amount = parseFloat(amountString.replace(",", ".")) || 0;

          if (totals[formaDePagamentoId]) {
            totals[formaDePagamentoId] += amount;
          } else {
            totals[formaDePagamentoId] = amount;
          }
        }
      });
    }
    return totals;
  };

  const processCategoria = () => {
    const categoriaTotals: { [categoriaId: string]: number } = {};
    if (
      Array.isArray(userData?.user?.expense) &&
      userData.user.expense.length > 0
    ) {
      userData.user.expense.forEach((expense: any) => {
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
    return categoriaTotals;
  };

  const processFonteDeRenda = () => {
    const totals: { [key: string]: number } = {};
    if (
      Array.isArray(userData?.user?.transactions) &&
      userData.user.transactions.length > 0
    ) {
      userData.user.transactions.forEach((transaction: any) => {
        const transactionDate = new Date(transaction.createdAt);
        if (
          transactionDate >= firstDayOfMonth &&
          transactionDate <= lastDayOfMonth
        ) {
          const categoryId = transaction.categoryId;
          const amountString =
            typeof transaction.amount === "string" ? transaction.amount : "";
          const amount = parseFloat(amountString.replace(",", ".")) || 0;

          if (totals[categoryId]) {
            totals[categoryId] += amount;
          } else {
            totals[categoryId] = amount;
          }
        }
      });
    }
    return totals;
  };

  const processSubcategoria = () => {
    const totals: { [key: string]: number } = {};
    if (
      Array.isArray(userData?.user?.expense) &&
      userData.user.expense.length > 0
    ) {
      userData.user.expense.forEach((expense: any) => {
        const expenseDate = new Date(expense.createdAt);
        if (expenseDate >= firstDayOfMonth && expenseDate <= lastDayOfMonth) {
          const subcategoriaId = expense.subcategoriaId;
          const amountString =
            typeof expense.amount === "string" ? expense.amount : "";
          const amount = parseFloat(amountString.replace(",", ".")) || 0;

          if (totals[subcategoriaId]) {
            totals[subcategoriaId] += amount;
          } else {
            totals[subcategoriaId] = amount;
          }
        }
      });
    }
    return totals;
  };

  const selectedData =
    clientDateType === "formaDePagamento"
      ? processFormaDePagamento()
      : clientDateType === "categoria"
        ? processCategoria()
        : clientDateType === "subcategoria"
          ? processSubcategoria()
          : clientDateType === "fonteDeRenda"
            ? processFonteDeRenda()
            : {};

  const data: PieData[] = Object.keys(selectedData).map((key, index) => {
    let name = "Unknown";
    if (clientDateType === "formaDePagamento") {
      name =
        userData?.user?.formaDePagamento.find((forma: any) => forma.id === key)
          ?.name || "Unknown Forma de Pagamento";
    } else if (clientDateType === "categoria") {
      const categoria = userData?.user?.categoria?.find(
        (categorias: any) => categorias.id === key,
      );
      name = categoria?.name || "Unknown Category";
    } else if (clientDateType === "subcategoria") {
      userData?.user?.categoria.forEach((categoria: any) => {
        const foundSubcategoria = categoria.Subcategorias.find(
          (subcategoria: any) => subcategoria.id === key,
        );
        if (foundSubcategoria) {
          name = foundSubcategoria.name;
        }
      });
    } else if (clientDateType === "fonteDeRenda") {
      name =
        userData?.user?.categories.find((category: any) => category.id === key)
          ?.name || "Unknown Fonte de Renda";
    }
    return {
      name,
      amount: parseFloat(selectedData[key].toFixed(2)),
      fill: "",
      quantity: parseFloat(selectedData[key].toFixed(2)),
      keyName: name,
    };
  });

  const getTitle = () => {
    switch (clientDateType) {
      case "formaDePagamento":
        return "Forma de Pagamento";
      case "categoria":
        return "Categoria";
      case "subcategoria":
        return "Subcategoria";
      case "fonteDeRenda":
        return "Fonte de Renda";
      default:
        return "Dados";
    }
  };

  const getDescription = () => {
    switch (clientDateType) {
      case "formaDePagamento":
        return "Despesas";
      case "categoria":
        return "Despesas";
      case "subcategoria":
        return "Despesas";
      case "fonteDeRenda":
        return "Ganhos";
      default:
        return "Dados";
    }
  };

  return (
    <Card
      header={<CardHeader title={getTitle()} description="" />}
      content={
        <CardContent>
          <div className="chart-container" ref={chartContainerRef}>
            {loading === false && data.length === 0 ? (
              <EmptyState
                icon="database"
                title="Sem dados no período selecionado"
                description={`Altere o período selecionado ou registre novas ${getDescription()}.`}
              />
            ) : (
              <Chart
                skeleton={skeleton}
                nameKey="name"
                type="donut"
                width={chartWidth}
                height={chartHeight}
                caption
                data={data}
                dataKey="amount"
                innerRadius={90}
                outerRadius={140}
                label="Total"
                tooltipFormatter={(value) =>
                  `R$ ${value.toFixed(2).replace(".", ",")}`
                }
                labelFormatter={(value) =>
                  `R$ ${value.toFixed(2).replace(".", ",")}`
                }
              />
            )}
          </div>
        </CardContent>
      }
    />
  );
}

export default PieChart;

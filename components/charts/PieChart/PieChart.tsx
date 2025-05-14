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
  others?: PieData[];
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

  const processData = () => {
    const totals: { [key: string]: number } = {};
    const expenses =
      clientDateType === "fonteDeRenda"
        ? userData?.user?.transactions
        : userData?.user?.expense;

    if (Array.isArray(expenses) && expenses.length > 0) {
      expenses.forEach((item: any) => {
        const itemDate = new Date(item.createdAt);

        const isInPeriod =
          selectedMonth === 12
            ? itemDate.getFullYear() === selectedYear
            : itemDate >= new Date(firstDayOfMonth) &&
              itemDate <= new Date(lastDayOfMonth);

        if (isInPeriod) {
          let key = "";
          if (clientDateType === "formaDePagamento") {
            key = item.formaDePagamentoId;
          } else if (clientDateType === "categoria") {
            key = item.categoriaId;
          } else if (clientDateType === "subcategoria") {
            key = item.subcategoriaId;
          } else if (clientDateType === "fonteDeRenda") {
            key = item.categoryId;
          }

          const amountString =
            typeof item.amount === "string"
              ? item.amount
              : item.amount?.toString() || "0";
          const amount = parseFloat(amountString.replace(",", ".")) || 0;

          if (totals[key]) {
            totals[key] += amount;
          } else {
            totals[key] = amount;
          }
        }
      });
    }
    return totals;
  };

  const getNameById = (key: string): string => {
    if (clientDateType === "formaDePagamento") {
      return (
        userData?.user?.formaDePagamento.find((forma: any) => forma.id === key)
          ?.name || "Forma de Pagamento Desconhecida"
      );
    } else if (clientDateType === "categoria") {
      return (
        userData?.user?.categoria.find((categoria: any) => categoria.id === key)
          ?.name || "Categoria Desconhecida"
      );
    } else if (clientDateType === "subcategoria") {
      const subcategoria = userData?.user?.categoria
        ?.flatMap((cat: any) => cat.subcategorias || [])
        ?.find((sub: any) => sub.id === key);
      return subcategoria?.name || `Subcategoria Desconhecida (${key})`;
    } else if (clientDateType === "fonteDeRenda") {
      return (
        userData?.user?.categories.find((category: any) => category.id === key)
          ?.name || "Fonte de Renda Desconhecida"
      );
    }
    return "Desconhecido";
  };

  const defaultColors = [
    "var(--s-color-chart-1)",
    "var(--s-color-chart-2)",
    "var(--s-color-chart-3)",
    "var(--s-color-chart-4)",
    "var(--s-color-chart-5)",
    "var(--s-color-chart-7)",
    "var(--s-color-chart-8)",
    "var(--s-color-chart-9)",
    "var(--s-color-chart-10)",
  ];

  const rawData = processData();

  const data: PieData[] = Object.keys(rawData)
    .map((key, index) => {
      const amount = parseFloat(rawData[key]?.toFixed(2)) || 0;
      const name = getNameById(key);
      return {
        name,
        amount,
        fill: defaultColors[index % defaultColors.length],
        quantity: amount,
        keyName: name,
      };
    })
    .filter((item) => item.amount > 0);

  const processedData = React.useMemo(() => {
    if (skeleton) return data;
    if (data.length <= 5) return data;
    const sorted = [...data].sort((a, b) => b.amount - a.amount);
    const main = sorted.slice(0, 5);
    const others = sorted.slice(5);
    const othersAmount = others.reduce((acc, curr) => acc + curr.amount, 0);
    if (others.length === 0 || othersAmount <= 0) return main;
    const othersColor =
      main.length < defaultColors.length
        ? defaultColors[main.length]
        : defaultColors[defaultColors.length - 1];
    return [
      ...main,
      {
        name: "Outros",
        amount: othersAmount,
        fill: othersColor,
        quantity: othersAmount,
        keyName: "Outros",
        others,
      },
    ];
  }, [data, skeleton]);

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
      case "categoria":
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
            {loading === false && processedData.length === 0 ? (
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
                data={processedData}
                dataKey="amount"
                innerRadius={80}
                outerRadius={130}
                label="Total"
                tooltipFormatter={(value: number) =>
                  `R$ ${value.toFixed(2).replace(".", ",")}`
                }
                labelFormatter={(value: number) =>
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

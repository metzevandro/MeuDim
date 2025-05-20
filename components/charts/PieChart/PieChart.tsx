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
  selectedYear: number | "all";
  setSelectedYear: React.Dispatch<React.SetStateAction<number | "all">>;
  isYearSelected: boolean;
  isAllYearsSelected: boolean;
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
  isAllYearsSelected,
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

        const isInPeriod = isAllYearsSelected
          ? true
          : selectedMonth === 12
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
    "var(--s-color-chart-9)",
    "var(--s-color-chart-10)",
  ];

  const getUniqueColors = (length: number) => {
    const colors = [...defaultColors];
    const assigned: string[] = [];
    for (let i = 0; i < length; i++) {
      if (colors.length > 0) {
        assigned.push(colors.shift()!);
      } else {
        assigned.push("var(--s-color-chart-default, #cccccc)");
      }
    }
    return assigned;
  };

  const rawData = processData();

  const colorList = getUniqueColors(Object.keys(rawData).length);

  const data: PieData[] = Object.keys(rawData)
    .map((key, index) => {
      const amount = parseFloat(rawData[key]?.toFixed(2)) || 0;
      const name = getNameById(key);
      const fill = colorList[index];
      return {
        name,
        amount,
        fill,
        quantity: amount,
        keyName: name,
      };
    })
    .filter((item) => item.amount > 0);

  const processedData = React.useMemo(() => {
    return data;
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
                nameKey="keyName"
                type="donut"
                width={chartWidth}
                height={chartHeight}
                caption
                data={processedData}
                dataKey="quantity"
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

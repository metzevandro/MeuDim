"use client";
import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import "./barras.scss";
import { CustomTooltip } from "@/components/auth/GraphicTooltip/GraphicTooltip";
import { EmptyState } from "design-system-zeroz";

interface BarrasProps {
  data: any[];
  loading: boolean;
}

export default function Barras(props: BarrasProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const [loadingData, setLoadingData] = useState(
    Array(30).fill({ name: "", Ganhos: 0, Despesas: 0 }),
  );
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

  useEffect(() => {
    if (props.loading) {
      setLoadingData((prevData) =>
        prevData.map((item) => ({
          ...item,
          Ganhos: Math.floor(Math.random() * 1000),
        })),
      );

      const intervalId = setInterval(() => {
        setLoadingData((prevData) =>
          prevData.map((item) => ({
            ...item,
            Ganhos: Math.floor(Math.random() * 1000),
          })),
        );
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [props.loading]);

  const filteredData = props.data.filter(
    (item) => item.Ganhos !== 0 || item.Despesas !== 0,
  );

  return (
    <div ref={chartContainerRef} className="chart-container">
      {!props.loading && filteredData.length === 0 ? (
        <EmptyState
          icon="database"
          title="Sem dados no período selecionado"
          description={`Altere o período selecionado ou registre novas entradas ou despesas.`}
        />
      ) : (
        <BarChart
          width={chartWidth}
          height={chartHeight}
          data={props.loading ? loadingData : props.data}
        >
          <CartesianGrid
            horizontalCoordinatesGenerator={(props) =>
              props.height > 250 ? [12, 77, 149, 221] : [100, 200]
            }
            verticalPoints={[0]}
          />
          <XAxis
            dataKey="data"
            tick={{
              fill: "var(--s-color-content-default)",
            }}
            style={{
              font: "var(--s-typography-caption-regular)",
              minWidth: "50px",
            }}
          />
          <YAxis
            type="number"
            name="R$"
            style={{
              font: "var(--s-typography-caption-regular)",
              minWidth: "unset",
            }}
            tick={{
              fill: "var(--s-color-content-default)",
            }}
            tickFormatter={(value) => `R$ ${value}`}
          />
          <Tooltip content={<CustomTooltip area={false} />} />
          <Bar
            dataKey="Ganhos"
            stackId="a"
            fill={
              props.loading
                ? "var(--s-color-fill-disable)"
                : "var(--s-color-fill-success)"
            }
          />
          <Bar
            dataKey="Despesas"
            stackId="a"
            fill={"var(--s-color-fill-warning)"}
          />
        </BarChart>
      )}
    </div>
  );
}

"use client";
import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import "./barras.scss";
import { CustomTooltip } from "@/components/auth/GraphicTooltip/GraphicTooltip";

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

  return (
    <div ref={chartContainerRef} className="chart-container">
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
          style={{
            font: "var(--s-typography-caption-regular)",
            color: "var(--s-color-content-default)",
          }}
        />
        <YAxis
          type="number"
          name="R$"
          tickFormatter={(value) => `R$ ${value}`}
          style={{
            font: "var(--s-typography-caption-regular)",
            color: "var(--s-color-content-default)",
            minWidth: "unset",
          }}
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
    </div>
  );
}

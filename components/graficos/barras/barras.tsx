"use client";
import React, { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

import "./barras.scss";

interface BarrasProps {
  data: any[];
}

export default function Barras(props: BarrasProps) {
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

    updateDimensions(); // Set initial dimensions

    window.addEventListener("resize", updateDimensions); // Update on resize

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  const CustomTooltip = ({
    active,
    payload,
    label,
  }: {
    active?: boolean;
    payload?: { value: string }[];
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const ganhos = payload[0].value.toString().replace(".", ",");
      const despesas = payload[1].value.toString().replace(".", ",");

      return (
        <div className="barras-tooltip">
          <p className="label">{label}</p>
          <p className="ganhos">Ganhos: R$ {ganhos}</p>
          <p className="despesas">Despesas: R$ {despesas}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div ref={chartContainerRef} className="chart-container">
      <BarChart
        width={chartWidth}
        height={chartHeight}
        data={props.data}
        margin={{
          top: 20,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid
          horizontalCoordinatesGenerator={(props) =>
            props.height > 250 ? [88, 156.5, 224.5] : [100, 200]
          }
          verticalPoints={[0]}
        />
        <XAxis
          dataKey="name"
          style={{ font: "var(--s-typography-caption-regular)" }}
        />
        <YAxis
          type="number"
          name="R$"
          tickFormatter={(value) => `R$${value}`}
          style={{
            font: "var(--s-typography-caption-regular)",
            color: "var(--s-color-content-default)",
          }}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="Ganhos" stackId="a" fill="var(--s-color-fill-success)" />
        <Bar
          dataKey="Despesas"
          stackId="a"
          fill="var(--s-color-fill-warning)"
        />
      </BarChart>
    </div>
  );
}

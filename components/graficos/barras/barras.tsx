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
      <CartesianGrid horizontalCoordinatesGenerator={(props) => props.height > 250 ? [88, 156.5, 224.5] : [100, 200]} verticalPoints={[0]}/>
        <XAxis dataKey="name" style={{font: 'var(--s-typography-caption-regular)'}}/>
        <YAxis
          type="number"
          name="R$"
          tickFormatter={(value) => `R$${value}`}
          style={{font: 'var(--s-typography-caption-regular)', color: 'var(--s-color-content-default)'}}
        />
        <Tooltip contentStyle={{font: 'var(--s-typography-paragraph-regular)', borderRadius: 'var(--s-border-radius-small)', boxShadow: 'var(--s-shadow-level-2)'}} cursor={{  fill: 'var(--s-color-fill-default-hover)', strokeWidth: 2 }} formatter={(value) => `R$ ${value}`.replace(".", ",")} />
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

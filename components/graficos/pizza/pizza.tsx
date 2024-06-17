"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PieChart, Pie, Sector, Legend } from "recharts";
import "./pizza.scss";
import { EmptyState, Icon } from "design-system-zeroz";

const CustomLegend = (props: any) => {
  const { payload } = props;
  return (
    <div className="custom-legend">
      {payload.map((entry: any, index: any) => (
        <div
          key={`item-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--s-spacing-xx-small)",
          }}
        >
          <span className="legend-color-box" style={{ color: entry.color }}>
            <Icon fill={true} icon="square" size="md" />
          </span>
          <span
            className="legend-text"
            style={{
              color: "var(--s-color-content-default)",
              font: "var(--s-typography-paragraph-strong)",
            }}
          >
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const renderActiveShape = (props: any, loading: boolean, pizza: 1 | 2) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 20) * cos;
  const my = cy + (outerRadius + 20) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * (outerRadius === 90 ? 22 : 0);
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        style={{
          font: "var(--s-typography-paragraph-regular)",
          fill: "var(--s-color-content-default)",
          display: "flex",
          alignItems: "center",
          flexDirection: "column",
        }}
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
      >
        <>
          <tspan
            style={{ font: "var(--s-typography-paragraph-regular)" }}
            x={cx}
            dy="1.5em"
          >
            {loading ? "Carregando..." : payload.name}
          </tspan>
          <tspan
            style={{ font: "var(--s-typography-paragraph-strong)" }}
            x={cx}
            dy="-2em"
          >{`R$ ${value.toFixed(2).toString().replace(".", ",")}`}</tspan>
        </>
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke={fill}
      />
    </g>
  );
};

const Pizza = ({
  data,
  loading,
  name,
  pizza,
}: {
  data: any;
  loading: boolean;
  name: string;
  pizza: 1 | 2;
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback((_: any, index: any) => {
    setActiveIndex(index);
  }, []);

  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const [radius, setRadius] = useState({ inner: 70, outer: 80 });
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        setChartWidth(chartContainerRef.current.offsetWidth);
        setChartHeight(chartContainerRef.current.offsetHeight);
      }

      if (typeof window !== "undefined" && window.innerWidth <= 490) {
        setRadius({ inner: 60, outer: 70 });
      } else {
        setRadius({ inner: 70, outer: 90 });
      }
    };

    updateDimensions();

    if (typeof window !== "undefined") {
      window.addEventListener("resize", updateDimensions);
    }

    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", updateDimensions);
      }
    };
  }, []);

  const [loadingData, setLoadingData] = useState(
    Array(4).fill({ name: "", amount: 0, Despesas: 0 }),
  );

  useEffect(() => {
    if (loading) {
      setLoadingData((prevData) =>
        prevData.map((item) => ({
          ...item,
          amount: Math.floor(Math.random() * 100),
        })),
      );

      const intervalId = setInterval(() => {
        setLoadingData((prevData) =>
          prevData.map((item) => ({
            ...item,
            amount: Math.floor(Math.random() * 100),
          })),
        );
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [loading]);

  return (
    <div ref={chartContainerRef} className="pizza-container">
      {loading === false && data.length === 0 ? (
        <EmptyState
          icon="database"
          title="Sem dados no período selecionado"
          description={`Altere o período selecionado ou registre novas ${name === "despesa" ? "despesas" : "entradas"}.`}
        />
      ) : (
        <>
          <PieChart width={chartWidth} height={chartHeight}>
            <Pie
              activeIndex={activeIndex}
              activeShape={(props: any) => renderActiveShape(props, loading, 2)}
              data={loading === false ? data : loadingData}
              cx="50%"
              cy="50%"
              innerRadius={radius.inner}
              outerRadius={radius.outer}
              fill={`${
                loading === false
                  ? "var(--s-color-content-highlight)"
                  : "var(--s-color-content-disable)"
              }`}
              dataKey="amount"
              onMouseEnter={onPieEnter}
            />
            {typeof window !== "undefined" && (
              <Legend
                content={<CustomLegend />}
                verticalAlign={window.innerWidth <= 490 ? "bottom" : "middle"}
                align={window.innerWidth <= 490 ? "center" : "right"}
                layout="vertical"
              />
            )}
          </PieChart>
        </>
      )}
    </div>
  );
};

export default Pizza;

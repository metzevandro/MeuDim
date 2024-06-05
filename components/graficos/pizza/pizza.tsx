"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { PieChart, Pie, Sector, Legend } from "recharts";

import "./pizza.scss";

const renderActiveShape = (props: any) => {
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
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? "start" : "end";

  return (
    <g>
      <text
        style={{
          font: "var(--s-typography-paragraph-regular)",
          fill: "var(--s-color-content-default)",
        }}
        x={cx}
        y={cy}
        dy={8}
        textAnchor="middle"
      >
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path
        d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`}
        stroke={fill}
        fill="none"
        z={99}
      />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text
        style={{
          font: "var(--s-typography-paragraph-strong)",
          fill: "var(--s-color-content-default)",
        }}
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        textAnchor={textAnchor}
        fill="#333"
      >{`R$ ${value.toString().replace(".", ",")}`}</text>
      <text
        style={{
          font: "var(--s-typography-paragraph-regular)",
          fill: "var(--s-color-content-light)",
        }}
        x={ex + (cos >= 0 ? 1 : -1) * 12}
        y={ey}
        dy={18}
        textAnchor={textAnchor}
        fill="#999"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    </g>
  );
};

const Pizza = ({ data }: { data: any }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback((_: any, index: any) => {
    setActiveIndex(index);
  }, []);

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

  return (
    <div ref={chartContainerRef} className="pizza-container">
      <PieChart width={chartWidth} height={chartHeight}>
        <Pie
          activeIndex={activeIndex}
          activeShape={renderActiveShape}
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="var(--s-color-content-highlight)"
          dataKey="amount"
          onMouseEnter={onPieEnter}
        />
      </PieChart>
    </div>
  );
};

export default Pizza;

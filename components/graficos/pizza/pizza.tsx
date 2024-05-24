"use client";
import { useCurrentUser } from "@/hooks/user-current-user";
import React, { useCallback, useState } from "react";
import { PieChart, Pie, Sector, Legend } from "recharts";

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

const Pizza = () => {
  const user = useCurrentUser();

  const categoryTotals: { [categoryId: string]: number } = {};

  if (Array.isArray(user?.transactions) && user.transactions.length > 0) {
    user.transactions.forEach((transaction: any) => {
      const categoryId = transaction.categoryId;
      const amountString =
        typeof transaction.amount === "string"
          ? transaction.amount.toString()
          : "";
      const amount = parseFloat(amountString.replace(",", ".")) || 0;

      if (categoryTotals[categoryId]) {
        categoryTotals[categoryId] += amount;
      } else {
        categoryTotals[categoryId] = amount;
      }
    });
  }

  const colors: any = [
    "var(--s-color-fill-highlight)",
    "#873BEC",
    "#DB2777",
    "#027AC7",
    "#138480",
  ];

  const data = Object.keys(categoryTotals).map((categoryId, index) => ({
    name:
      user.categories.find((category: any) => category.id === categoryId)
        ?.name || "Unknown Category",
    amount: parseFloat(categoryTotals[categoryId].toFixed(2)),
    fill: colors[index % colors.length],
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const onPieEnter = useCallback(
    (_: any, index: any) => {
      setActiveIndex(index);
    },
    [setActiveIndex],
  );

  return (
    <PieChart
      style={{ height: "100%", width: "100%" }}
      height={280}
      width={500}
    >
      <Legend />

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
  );
};

export default Pizza;

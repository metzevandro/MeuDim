"use client";
import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface BarrasProps {
  data: any[];
}

export default function Barras(props: BarrasProps) {
  return (
    <BarChart
      width={1152}
      height={424}
      data={props.data}
      margin={{
        top: 20,
        right: 30,
        left: 20,
        bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />{" "}
      <Bar dataKey="ganhos" stackId="a" fill="var(--s-color-fill-success)" />
      <Bar dataKey="despesas" stackId="a" fill="var(--s-color-fill-warning)" />
    </BarChart>
  );
}

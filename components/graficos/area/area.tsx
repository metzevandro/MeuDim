import React, { useEffect, useRef, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import "./area.scss";
import { CustomTooltip } from "@/components/auth/GraphicTooltip/GraphicTooltip";

const data = [
  {
    name: "Page A",
    uv: 4000,
    pv: 2400,
    amt: 2400,
  },
  {
    name: "Page B",
    uv: 3000,
    pv: 1398,
    amt: 2210,
  },
  {
    name: "Page C",
    uv: 2000,
    pv: 9800,
    amt: 2290,
  },
  {
    name: "Page D",
    uv: 2780,
    pv: 3908,
    amt: 2000,
  },
  {
    name: "Page E",
    uv: 1890,
    pv: 4800,
    amt: 2181,
  },
  {
    name: "Page F",
    uv: 2390,
    pv: 3800,
    amt: 2500,
  },
  {
    name: "Page G",
    uv: 3490,
    pv: 4300,
    amt: 2100,
  },
];

interface AreaGraphicProps {
  data: any[];
}

export default function AreaGraphic(props: AreaGraphicProps) {
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
    <div ref={chartContainerRef} className="area-graphic">
      <AreaChart width={chartWidth} height={chartHeight} data={props.data}>
        <CartesianGrid
          horizontalCoordinatesGenerator={(props) =>
            props.height > 250 ? [12, 77, 149, 221] : [100, 200]
          }
          verticalPoints={[0]}
        />{" "}
        <XAxis
          dataKey="name"
          style={{
            font: "var(--s-typography-caption-regular)",
            minWidth: "50px",
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
        <Tooltip content={<CustomTooltip area />} />
        <Area
          type="monotone"
          dataKey="Saldo"
          stroke="var(--s-color-fill-success)"
          fill="var(--s-color-fill-success)"
        />
      </AreaChart>
    </div>
  );
}

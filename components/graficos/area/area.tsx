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
interface AreaGraphicProps {
  data: any[];
  loading: boolean;
}

export default function AreaGraphic(props: AreaGraphicProps) {
  const [chartWidth, setChartWidth] = useState(0);
  const [chartHeight, setChartHeight] = useState(0);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [loadingData, setLoadingData] = useState(
    Array(30).fill({ name: "", Saldo: 0, Despesas: 0 }),
  );

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
          Saldo: Math.floor(Math.random() * 1000),
        })),
      );

      const intervalId = setInterval(() => {
        setLoadingData((prevData) =>
          prevData.map((item) => ({
            ...item,
            Saldo: Math.floor(Math.random() * 1000),
          })),
        );
      }, 1000);

      return () => clearInterval(intervalId);
    }
  }, [props.loading]);

  return (
    <>
      <div ref={chartContainerRef} className="area-graphic">
        <AreaChart
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
            tickFormatter={(value) => `${value}`}
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
            stroke={
              props.loading
                ? "var(--s-color-fill-disable)"
                : "var(--s-color-fill-success)"
            }
            fill={
              props.loading
                ? "var(--s-color-fill-disable)"
                : "var(--s-color-fill-success)"
            }
          />
        </AreaChart>
      </div>
    </>
  );
}

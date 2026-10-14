import React, { useEffect, useRef, useState } from "react";
import { LineChart as Chart, EmptyState, Card } from "design-system-zeroz";
import "./LineChart.scss";

interface LineSeriesPoint extends Record<string, unknown> {
  month: string;
  "Saldo Total": number;
}

interface LineChartProps {
  loading: boolean;
  skeleton: boolean;
  series: LineSeriesPoint[];
}

export function LineChart({ loading, skeleton, series }: LineChartProps) {
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
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const dataArea = series || [];

  return (
    <Card>
      <Card.Header>
        <h1>Saldo Total</h1>
      </Card.Header>
      <Card.Content>
        <div className="chart-container" ref={chartContainerRef}>
          {!loading && dataArea.length === 0 ? (
            <EmptyState
              icon="database"
              title="Sem dados no período selecionado"
              description="Altere o período selecionado ou registre novos ganhos e despesas."
            />
          ) : (
            <Chart
              skeleton={skeleton || loading}
              tooltipFormatter={(value: string | number) =>
                `R$ ${Number(value).toFixed(2).replace(".", ",")}`
              }
              seriesStyles={{
                "Saldo Total": { color: "var(--s-color-fill-success)" },
              }}
              data={dataArea}
              curveType="monotone"
              height={chartHeight}
              width={chartWidth}
              dots={false}
              caption
            />
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

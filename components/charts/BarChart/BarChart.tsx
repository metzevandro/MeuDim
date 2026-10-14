import React, { useEffect, useRef, useState } from "react";
import { Card, BarChart as Chart, EmptyState } from "design-system-zeroz";
import "./BarChart.scss";

interface BarSeriesPoint extends Record<string, unknown> {
  month: string;
  Ganhos: number;
  Despesas: number;
}

interface BarChartProps {
  loading: boolean;
  skeleton: boolean;
  series: BarSeriesPoint[];
}

export function BarChart({ loading, skeleton, series }: BarChartProps) {
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

  const dataBar = series || [];

  return (
    <Card>
      <Card.Header>
        <h1>Ganhos x Despesas</h1>
      </Card.Header>
      <Card.Content>
        <div className="chart-container" ref={chartContainerRef}>
          {!loading && dataBar.length === 0 ? (
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
                Despesas: { color: "var(--s-color-fill-warning)" },
                Ganhos: { color: "var(--s-color-fill-success)" },
              }}
              data={dataBar}
              height={chartHeight}
              width={chartWidth}
              stacked={false}
              caption
            />
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

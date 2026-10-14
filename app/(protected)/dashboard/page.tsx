"use client";
import {
  Button,
  DatePicker,
  InputSelect,
  Page,
  Skeleton,
  Card,
} from "design-system-zeroz";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import PieChart from "@/components/charts/PieChart/PieChart";
import { BarChart } from "@/components/charts/BarChart/BarChart";
import { LineChart } from "@/components/charts/LineChart/LineChart";
import { useUser } from "@/data/provider";

import "./styles.scss";

type Granularity = "dia" | "mes" | "ano";
type PresetKey =
  | "esteMes"
  | "mesPassado"
  | "esteAno"
  | "anoPassado"
  | "ultimos7"
  | "ultimos30"
  | "personalizado";

interface DashboardSeriesPoint {
  label: string;
  ganhos: number;
  despesas: number;
  saldo: number;
}

interface DashboardSummary {
  totalGanhos: number;
  totalDespesas: number;
  saldo: number;
  previousTotalGanhos: number;
  previousTotalDespesas: number;
  ganhosPercentageChange: number;
  ganhosAmountChange: number;
  despesasPercentageChange: number;
  despesasAmountChange: number;
}

interface DashboardEarning {
  amount: unknown;
  incomeSourceId: string;
  incomeSource?: { id: string; name: string } | null;
}

interface DashboardExpense {
  amount: unknown;
  categoryId: string;
  subcategoryId?: string | null;
  paymentMethodId?: string | null;
  category?: { id: string; name: string } | null;
  subcategory?: { id: string; name: string } | null;
  paymentMethod?: { id: string; name: string } | null;
}

interface DashboardResponse {
  period: {
    startDate: string;
    endDate: string;
    granularity: Granularity;
    resolvedGranularity: Granularity;
  };
  summary: DashboardSummary;
  series: DashboardSeriesPoint[];
  earnings: DashboardEarning[];
  expenses: DashboardExpense[];
}

const formatCurrency = (value: number) =>
  value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const toNumber = (value: unknown): number => {
  if (typeof value === "number") return value;
  if (value === null || value === undefined) return 0;
  const parsed = parseFloat(String(value).replace(",", "."));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const pad = (n: number) => String(n).padStart(2, "0");

const toDateOnlyString = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toDatePickerString = (date: Date) =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

const fromDatePickerString = (value: string): Date | null => {
  const match = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, d, m, y] = match;
  const date = new Date(Number(y), Number(m) - 1, Number(d));
  if (Number.isNaN(date.getTime())) return null;
  if (
    date.getDate() !== Number(d) ||
    date.getMonth() !== Number(m) - 1 ||
    date.getFullYear() !== Number(y)
  ) {
    return null;
  }
  return date;
};

const startOfDay = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

const daysBetween = (start: Date, end: Date) =>
  Math.max(
    1,
    Math.round(
      (startOfDay(end).getTime() - startOfDay(start).getTime()) / MS_PER_DAY,
    ) + 1,
  );

const suggestGranularity = (start: Date, end: Date): Granularity => {
  const days = daysBetween(start, end);
  if (days <= 62) return "dia";
  if (days <= 730) return "mes";
  return "ano";
};

const computePresetRange = (
  preset: PresetKey,
  current: { start: Date; end: Date },
): { start: Date; end: Date } => {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();

  switch (preset) {
    case "esteMes":
      return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0) };
    case "mesPassado":
      return { start: new Date(y, m - 1, 1), end: new Date(y, m, 0) };
    case "esteAno":
      return { start: new Date(y, 0, 1), end: new Date(y, 11, 31) };
    case "anoPassado":
      return { start: new Date(y - 1, 0, 1), end: new Date(y - 1, 11, 31) };
    case "ultimos7":
      return { start: new Date(y, m, today.getDate() - 6), end: today };
    case "ultimos30":
      return { start: new Date(y, m, today.getDate() - 29), end: today };
    case "personalizado":
    default:
      return current;
  }
};

const presetOptions: { value: PresetKey; label: string }[] = [
  { value: "esteMes", label: "Este mês" },
  { value: "mesPassado", label: "Mês passado" },
  { value: "esteAno", label: "Este ano" },
  { value: "anoPassado", label: "Ano passado" },
  { value: "ultimos7", label: "Últimos 7 dias" },
  { value: "ultimos30", label: "Últimos 30 dias" },
  { value: "personalizado", label: "Personalizado" },
];

const granularityOptions: { value: Granularity; label: string }[] = [
  { value: "dia", label: "Dia" },
  { value: "mes", label: "Mês" },
  { value: "ano", label: "Ano" },
];

const HomePage = () => {
  const { userData, skeleton, fetchUserData } = useUser();
  const router = useRouter();

  const initialRange = computePresetRange("esteMes", {
    start: new Date(),
    end: new Date(),
  });

  const [preset, setPreset] = useState<PresetKey>("esteMes");
  const [startDate, setStartDate] = useState<Date>(initialRange.start);
  const [endDate, setEndDate] = useState<Date>(initialRange.end);
  const [granularity, setGranularity] = useState<Granularity>(
    suggestGranularity(initialRange.start, initialRange.end),
  );
  const granularityTouchedRef = useRef(false);

  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(
    null,
  );
  const [dashboardLoading, setDashboardLoading] = useState<boolean>(false);

  const availableGranularityOptions = useMemo(() => {
    const days = daysBetween(startDate, endDate);
    return granularityOptions.filter((option) => {
      if (option.value === "dia") return days <= 120;
      if (option.value === "ano") return days >= 45;
      return true; // "mes" sempre disponível
    });
  }, [startDate, endDate]);

  useEffect(() => {
    if (!availableGranularityOptions.some((o) => o.value === granularity)) {
      setGranularity(availableGranularityOptions[0]?.value || "mes");
    }
  }, [availableGranularityOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetChange = (label: string) => {
    const option = presetOptions.find((o) => o.label === label);
    if (!option) return;
    setPreset(option.value);
    if (option.value !== "personalizado") {
      const range = computePresetRange(option.value, {
        start: startDate,
        end: endDate,
      });
      setStartDate(range.start);
      setEndDate(range.end);
      granularityTouchedRef.current = false;
      setGranularity(suggestGranularity(range.start, range.end));
    }
  };

  const handleStartDateChange = (value: string) => {
    const newStart = fromDatePickerString(value);
    if (!newStart) return;
    setStartDate(newStart);
    const effectiveEnd =
      newStart.getTime() > endDate.getTime() ? newStart : endDate;
    if (effectiveEnd !== endDate) setEndDate(effectiveEnd);
    if (!granularityTouchedRef.current) {
      setGranularity(suggestGranularity(newStart, effectiveEnd));
    }
  };

  const handleEndDateChange = (value: string) => {
    const newEnd = fromDatePickerString(value);
    if (!newEnd) return;
    setEndDate(newEnd);
    const effectiveStart =
      newEnd.getTime() < startDate.getTime() ? newEnd : startDate;
    if (effectiveStart !== startDate) setStartDate(effectiveStart);
    if (!granularityTouchedRef.current) {
      setGranularity(suggestGranularity(effectiveStart, newEnd));
    }
  };

  const handleGranularityChange = (label: string) => {
    const option = granularityOptions.find((o) => o.label === label);
    if (!option) return;
    granularityTouchedRef.current = true;
    setGranularity(option.value);
  };

  useEffect(() => {
    const controller = new AbortController();

    const fetchDashboardData = async () => {
      setDashboardLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("startDate", toDateOnlyString(startDate));
        params.set("endDate", toDateOnlyString(endDate));
        params.set("granularity", granularity);

        const response = await fetch(`/api/dashboard?${params.toString()}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("Falha ao buscar dados do dashboard");
        }

        const data: DashboardResponse = await response.json();
        setDashboardData(data);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Erro ao buscar dados do dashboard:", error);
        }
      } finally {
        setDashboardLoading(false);
      }
    };

    fetchDashboardData();

    return () => controller.abort();
  }, [startDate, endDate, granularity]);

  useEffect(() => {
    if (!userData?.user) {
      fetchUserData();
    }
  }, [userData, fetchUserData]);

  const navigateTo = (route: string) => {
    router.push(route);
  };

  const fallbackTotals = useMemo(() => {
    if (!userData?.user) return { ganhos: 0, despesas: 0 };
    const start = startOfDay(startDate).getTime();
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const endTime = end.getTime();

    const ganhos = (userData.user.earnings || []).reduce((acc, earning) => {
      const t = new Date(earning.createdAt).getTime();
      return t >= start && t <= endTime ? acc + toNumber(earning.amount) : acc;
    }, 0);

    const despesas = (userData.user.expenses || []).reduce((acc, expense) => {
      const t = new Date(expense.createdAt).getTime();
      return t >= start && t <= endTime ? acc + toNumber(expense.amount) : acc;
    }, 0);

    return { ganhos, despesas };
  }, [userData, startDate, endDate]);

  const summary = dashboardData?.summary;
  const totalGanhos = summary ? summary.totalGanhos : fallbackTotals.ganhos;
  const totalDespesas = summary
    ? summary.totalDespesas
    : fallbackTotals.despesas;
  const saldo = summary ? summary.saldo : totalGanhos - totalDespesas;

  const ganhoPercentageChange = summary?.ganhosPercentageChange || 0;
  const ganhoAmount = summary?.ganhosAmountChange || 0;
  const previousGanhosForCompare = summary?.previousTotalGanhos || 0;

  const despesasPercentageChange = summary?.despesasPercentageChange || 0;
  const despesasAmount = summary?.despesasAmountChange || 0;
  const previousDespesasForCompare = summary?.previousTotalDespesas || 0;

  const [showSaldo, setShowSaldo] = useState<boolean>(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedShowSaldo = localStorage.getItem("showSaldo");
      const initialShowSaldo = storedShowSaldo
        ? JSON.parse(storedShowSaldo)
        : true;
      setShowSaldo(initialShowSaldo);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("showSaldo", JSON.stringify(showSaldo));
    }
  }, [showSaldo]);

  const namePage = `Confira suas finanças, ${skeleton ? "..." : userData?.user.name} !`;

  const barSeries = (dashboardData?.series || []).map((point) => ({
    month: point.label,
    Ganhos: point.ganhos,
    Despesas: point.despesas,
  }));

  const lineSeries = (dashboardData?.series || []).reduce<
    { month: string; "Saldo Total": number }[]
  >((acc, point) => {
    const previousSaldo = acc.length ? acc[acc.length - 1]["Saldo Total"] : 0;
    acc.push({
      month: point.label,
      "Saldo Total": previousSaldo + point.saldo,
    });
    return acc;
  }, []);

  const earnings = dashboardData?.earnings || [];
  const expenses = dashboardData?.expenses || [];

  return (
    <Page
      namePage={namePage}
      description={
        <span>
          Saldo total:
          <strong> R$ {showSaldo ? formatCurrency(saldo) : "•••••••"}</strong>
        </span>
      }
    >
      <div className="layout-page">
        <div className="input-field">
          <InputSelect
            label="Período"
            options={presetOptions.map((option) => option.label)}
            value={
              presetOptions.find((option) => option.value === preset)?.label ||
              "Este mês"
            }
            onChange={(value: any) => handlePresetChange(value)}
          />

          {preset === "personalizado" && (
            <>
              <DatePicker
                label="Data Inicial"
                value={toDatePickerString(startDate)}
                onChange={(value: string) => handleStartDateChange(value)}
              />
              <DatePicker
                label="Data Final"
                value={toDatePickerString(endDate)}
                onChange={(value: string) => handleEndDateChange(value)}
              />
            </>
          )}

          <InputSelect
            label="Granularidade"
            options={availableGranularityOptions.map((option) => option.label)}
            value={
              granularityOptions.find((option) => option.value === granularity)
                ?.label || "Dia"
            }
            onChange={(value: any) => handleGranularityChange(value)}
          />
        </div>
        <div className="layout-resumo">
          <Card>
            <Card.Header>
              <h1>Ganhos</h1>
            </Card.Header>
            <Card.Content>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--s-spacing-nano)",
                }}
              >
                {skeleton === true ? (
                  <>
                    <Skeleton height="24" width="100" />
                  </>
                ) : (
                  <h1 className="dinheiro">
                    R$ {showSaldo ? formatCurrency(totalGanhos) : "•••••••"}
                  </h1>
                )}
                <div
                  className={`porcentagem-ganhos ${
                    ganhoPercentageChange === 0
                      ? "neutral"
                      : ganhoPercentageChange > 0
                        ? "positivo"
                        : "negativo"
                  }`}
                >
                  {previousGanhosForCompare === 0 && totalGanhos === 0 ? (
                    <small>Você ainda não registrou nenhuma entrada</small>
                  ) : previousGanhosForCompare === 0 ? (
                    <small>
                      +R$ {totalGanhos.toFixed(2).toString().replace(".", ",")}{" "}
                      ( 100%) comparado ao período anterior
                      <strong className="material-symbols-outlined sm">
                        trending_up
                      </strong>
                    </small>
                  ) : (
                    <small>
                      {ganhoPercentageChange < 0 ? "-" : "+"}
                      R${" "}
                      {ganhoAmount
                        .toFixed(2)
                        .toString()
                        .replace(".", ",")
                        .replace("-", "")}{" "}
                      (
                      {ganhoPercentageChange
                        .toFixed(2)
                        .toString()
                        .replace(".", ",")}
                      %) comparado ao período anterior
                      <strong className="material-symbols-outlined sm">
                        {ganhoPercentageChange < 0
                          ? "trending_down"
                          : "trending_up"}
                      </strong>
                    </small>
                  )}
                </div>
              </div>
            </Card.Content>
            <Card.Footer>
              <div
                style={{
                  display: "flex",
                  gap: "var(--s-spacing-xx-small)",
                }}
              >
                <Button
                  isSkeleton={skeleton}
                  variant="primary"
                  size="md"
                  onClick={() => navigateTo("/earnings")}
                >
                  Adicionar Ganho
                </Button>
                <Button
                  isSkeleton={skeleton}
                  variant="secondary"
                  size="md"
                  onClick={() => navigateTo("/earnings")}
                >
                  Consultar Ganhos
                </Button>
              </div>
            </Card.Footer>
          </Card>
          <Card>
            <Card.Header>
              <h1>Despesas</h1>
            </Card.Header>
            <Card.Content>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--s-spacing-nano)",
                }}
              >
                {skeleton === true ? (
                  <>
                    <Skeleton height="24" width="100" />
                  </>
                ) : (
                  <h1 className="dinheiro">
                    R$ {showSaldo ? formatCurrency(totalDespesas) : "•••••••"}
                  </h1>
                )}

                <div
                  className={`porcentagem-despesas ${
                    despesasPercentageChange === 0
                      ? "neutral"
                      : despesasPercentageChange > 0
                        ? "negativo"
                        : "positivo"
                  }`}
                >
                  {previousDespesasForCompare === 0 && totalDespesas === 0 ? (
                    <small>Você ainda não registrou nenhuma despesa</small>
                  ) : previousDespesasForCompare === 0 ? (
                    <small>
                      {despesasPercentageChange > 0 ? "-" : "+"}
                      {totalDespesas
                        .toFixed(2)
                        .toString()
                        .replace(".", ",")}{" "}
                      (100%) comparado ao período anterior
                      <strong className="material-symbols-outlined sm">
                        trending_up
                      </strong>
                    </small>
                  ) : (
                    <small>
                      {despesasPercentageChange > 0 ? "-" : "+"}
                      R${" "}
                      {despesasAmount
                        .toFixed(2)
                        .toString()
                        .replace(".", ",")
                        .replace("-", "")}{" "}
                      (
                      {despesasPercentageChange
                        .toFixed(2)
                        .toString()
                        .replace(".", ",")}
                      %) comparado ao período anterior
                      <strong className="material-symbols-outlined sm">
                        {despesasPercentageChange > 0
                          ? "trending_down"
                          : "trending_up"}
                      </strong>
                    </small>
                  )}
                </div>
              </div>
            </Card.Content>
            <Card.Footer>
              <div
                style={{
                  display: "flex",
                  gap: "var(--s-spacing-xx-small)",
                }}
              >
                <Button
                  isSkeleton={skeleton}
                  variant="primary"
                  size="md"
                  onClick={() => navigateTo("/expenses")}
                >
                  Adicionar despesa
                </Button>
                <Button
                  isSkeleton={skeleton}
                  variant="secondary"
                  size="md"
                  onClick={() => navigateTo("/expenses")}
                >
                  Consultar despesas
                </Button>
              </div>
            </Card.Footer>
          </Card>
        </div>
        <BarChart
          skeleton={skeleton}
          loading={dashboardLoading}
          series={barSeries}
        />
        <LineChart
          skeleton={skeleton}
          loading={dashboardLoading}
          series={lineSeries}
        />
        <div className="layout-resumo">
          <PieChart
            skeleton={skeleton}
            loading={dashboardLoading}
            clientDateType="fonteDeRenda"
            earnings={earnings}
            expenses={expenses}
          />
          <PieChart
            skeleton={skeleton}
            loading={dashboardLoading}
            clientDateType="formaDePagamento"
            earnings={earnings}
            expenses={expenses}
          />
        </div>
        <div className="layout-resumo">
          <PieChart
            skeleton={skeleton}
            loading={dashboardLoading}
            clientDateType="categoria"
            earnings={earnings}
            expenses={expenses}
          />
          <PieChart
            skeleton={skeleton}
            loading={dashboardLoading}
            clientDateType="subcategoria"
            earnings={earnings}
            expenses={expenses}
          />
        </div>
      </div>
    </Page>
  );
};

export default HomePage;

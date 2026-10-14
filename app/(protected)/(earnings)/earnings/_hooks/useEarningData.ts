import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { SortState } from "design-system-zeroz";
import { createEarning } from "@/actions/earning/createEarning";
import { updateEarning as updateAction } from "@/actions/earning/updateEarning";
import { deleteEarning as deleteAction } from "@/actions/earning/deleteEarning";
import { EARNING_TEXTS, TABLE_ROWS_PER_PAGE } from "../_utils/const";
import { EarningRaw } from "../_utils/transformers";

const SORT_FIELD_MAP: Record<number, string> = {
  0: "createdAt",
  1: "amount",
  2: "incomeSourceName",
};

export function useEarningData() {
  const [earnings, setEarnings] = useState<EarningRaw[]>([]);
  const [loading, setLoading] = useState(true);
  const { notification, showNotification, closeNotification } =
    useNotification();

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortState>({
    columnIndex: 0,
    direction: "desc",
  });

  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchEarnings = useCallback(
    async (searchQuery: string, sortState: SortState, pageNumber: number) => {
      try {
        setLoading(true);

        const sortField = SORT_FIELD_MAP[sortState.columnIndex] ?? "createdAt";
        const sortOrder =
          sortState.direction === "default" ? "desc" : sortState.direction;

        const params = new URLSearchParams({
          search: searchQuery,
          sortField,
          sortOrder,
          page: String(pageNumber),
          pageSize: String(TABLE_ROWS_PER_PAGE),
        });

        const res = await fetch(`/api/earnings?${params}`);
        if (!res.ok) throw new Error("Failed to fetch earnings");

        const data = await res.json();
        const results = Array.isArray(data?.items) ? data.items : [];

        if (searchQuery && results.length === 0 && pageNumber === 1) {
          const fallbackParams = new URLSearchParams({
            search: "",
            sortField,
            sortOrder,
            page: "1",
            pageSize: String(TABLE_ROWS_PER_PAGE),
          });

          const fallbackRes = await fetch(`/api/earnings?${fallbackParams}`);
          if (!fallbackRes.ok) throw new Error("Failed to fetch earnings");

          const fallbackData = await fallbackRes.json();
          setEarnings(
            Array.isArray(fallbackData?.items) ? fallbackData.items : [],
          );
          setTotalItems(fallbackData?.totalItems ?? 0);
          setPage(1);

          showNotification("Nenhum registro encontrado.", true);
        } else {
          setEarnings(results);
          setTotalItems(data?.totalItems ?? 0);

          if (results.length === 0 && pageNumber > 1) {
            setPage(pageNumber - 1);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar ganhos:", err);
        showNotification("Erro ao carregar dados", true);
      } finally {
        setLoading(false);
      }
    },
    [showNotification],
  );

  useEffect(() => {
    fetchEarnings(search, sort, page);
  }, [fetchEarnings, search, sort, page]);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
    setPage(1);
  }, []);

  const handleSort = useCallback((sortState: SortState) => {
    setSort(sortState);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const create = useCallback(
    async (values: {
      amount: string;
      incomeSourceId: string;
      date: string;
    }) => {
      try {
        const data = await createEarning(values);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Criado com sucesso!", false);
        await fetchEarnings(search, sort, page);
        return true;
      } catch {
        showNotification(EARNING_TEXTS.NOTIFICATIONS.ERROR_CREATE, true);
        return false;
      }
    },
    [fetchEarnings, search, sort, page, showNotification],
  );

  const update = useCallback(
    async (
      id: string,
      values: { amount: string; incomeSourceId: string; date: string },
    ) => {
      try {
        const data = await updateAction(values, id);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Atualizado com sucesso!", false);
        await fetchEarnings(search, sort, page);
        return true;
      } catch {
        showNotification(EARNING_TEXTS.NOTIFICATIONS.ERROR_UPDATE, true);
        return false;
      }
    },
    [fetchEarnings, search, sort, page, showNotification],
  );

  const delete_ = useCallback(
    async (ids: string[]) => {
      try {
        const data = await deleteAction(ids);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Deletado com sucesso!", false);
        await fetchEarnings(search, sort, page);
        return true;
      } catch {
        showNotification(EARNING_TEXTS.NOTIFICATIONS.ERROR_DELETE, true);
        return false;
      }
    },
    [fetchEarnings, search, sort, page, showNotification],
  );

  return {
    earnings,
    loading,
    notification,
    closeNotification,
    showNotification,
    create,
    update,
    delete: delete_,
    refetch: fetchEarnings,
    search,
    sort,
    handleSearch,
    handleSort,
    page,
    totalItems,
    onPageChange: handlePageChange,
  };
}

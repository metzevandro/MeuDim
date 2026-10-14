import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { SortState } from "design-system-zeroz";
import { createExpense } from "@/actions/expense/createExpense";
import { updateExpense as updateAction } from "@/actions/expense/updateExpense";
import { deleteExpense as deleteAction } from "@/actions/expense/deleteExpense";
import { EXPENSE_TEXTS, TABLE_ROWS_PER_PAGE } from "../_utils/const";
import { ExpenseRaw } from "../_utils/transformers";

const SORT_FIELD_MAP: Record<number, string> = {
  0: "createdAt",
  1: "amount",
  2: "paymentMethodName",
  3: "categoryName",
  4: "subcategoryName",
};

export function useExpenseData() {
  const [expenses, setExpenses] = useState<ExpenseRaw[]>([]);
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

  const fetchExpenses = useCallback(
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
          totalItems: String(TABLE_ROWS_PER_PAGE),
        });

        const res = await fetch(`/api/expenses?${params}`);
        if (!res.ok) throw new Error("Failed to fetch expenses");

        const data = await res.json();
        const results = Array.isArray(data?.items) ? data?.items : [];

        if (searchQuery && results.length === 0) {
          const fallbackParams = new URLSearchParams({
            search: "",
            sortField,
            sortOrder,
            page: "1",
            totalItems: String(TABLE_ROWS_PER_PAGE),
          });

          const fallbackRes = await fetch(`/api/expenses?${fallbackParams}`);
          if (!fallbackRes.ok) throw new Error("Failed to fetch expenses");

          const fallbackData = await fallbackRes.json();
          setExpenses(
            Array.isArray(fallbackData?.items) ? fallbackData?.items : [],
          );

          setTotalItems(fallbackData?.totalItems ?? 0);
          setPage(1);

          showNotification("Nenhum registro encontrado.", true);
        } else {
          setExpenses(results);

          setTotalItems(data?.totalItems ?? 0);

          if (results.length === 0 && pageNumber > 1) {
            setPage(pageNumber - 1);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar despesas:", err);
        showNotification("Erro ao carregar dados", true);
      } finally {
        setLoading(false);
      }
    },
    [showNotification],
  );

  useEffect(() => {
    fetchExpenses(search, sort, page);
  }, [fetchExpenses, search, sort, page]);

  const create = useCallback(
    async (values: {
      amount: string;
      paymentMethodId: string;
      categoryId: string;
      subcategoryId: string;
      date: string;
    }) => {
      try {
        const data = await createExpense(values);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Criado com sucesso!", false);
        await fetchExpenses(search, sort, page);
        return true;
      } catch {
        showNotification(EXPENSE_TEXTS.NOTIFICATIONS.ERROR_CREATE, true);
        return false;
      }
    },
    [fetchExpenses, search, sort, page, showNotification],
  );

  const update = useCallback(
    async (
      id: string,
      values: {
        amount: string;
        paymentMethodId: string;
        categoryId: string;
        subcategoryId: string;
        date: string;
      },
    ) => {
      try {
        const data = await updateAction(values, id);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Atualizado com sucesso!", false);
        await fetchExpenses(search, sort, page);
        return true;
      } catch {
        showNotification(EXPENSE_TEXTS.NOTIFICATIONS.ERROR_UPDATE, true);
        return false;
      }
    },
    [fetchExpenses, search, sort, page, showNotification],
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
        await fetchExpenses(search, sort, page);
        return true;
      } catch {
        showNotification(EXPENSE_TEXTS.NOTIFICATIONS.ERROR_DELETE, true);
        return false;
      }
    },
    [fetchExpenses, search, sort, page, showNotification],
  );

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const handleSort = useCallback((sortState: SortState) => {
    setSort(sortState);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  return {
    expenses,
    loading,
    notification,
    closeNotification,
    showNotification,
    create,
    update,
    delete: delete_,
    refetch: fetchExpenses,
    search,
    sort,
    handleSearch,
    handleSort,
    page,
    totalItems,
    onPageChange: handlePageChange,
  };
}

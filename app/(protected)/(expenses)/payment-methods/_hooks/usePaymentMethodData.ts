import { use, useCallback, useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import { SortState } from "design-system-zeroz";
import { createPaymentMethod as createAction } from "@/actions/paymentMethod/createPaymentMethod";
import { updatePaymentMethod as updateAction } from "@/actions/paymentMethod/updatePaymentMethod";
import { deletePaymenteMethod as deleteAction } from "@/actions/paymentMethod/deletePaymenteMethod";
import { PAYMENT_METHOD_TEXTS, TABLE_ROWS_PER_PAGE } from "../_utils/const";
import { PaymentMethodRaw } from "../_utils/transformers";

const SORT_FIELD_MAP: Record<number, string> = {
  0: "createdAt",
  1: "name",
};

export function usePaymentMethodData() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodRaw[]>([]);
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

  const fetchPaymentMethod = useCallback(
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

        const res = await fetch(`/api/payment-methods?${params}`);
        if (!res.ok) throw new Error("Failed to fetch payment method");

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

          const fallbackRes = await fetch(
            `/api/payment-methods?${fallbackParams}`,
          );
          if (!fallbackRes.ok)
            throw new Error("Failed to fetch payment method");

          const fallbackData = await fallbackRes.json();
          setPaymentMethod(
            Array.isArray(fallbackData?.items) ? fallbackData?.items : [],
          );

          setTotalItems(fallbackData?.totalItems ?? 0);
          setPage(1);

          showNotification("Nenhum registro encontrado.", true);
        } else {
          setPaymentMethod(results);

          setTotalItems(data?.totalItems ?? 0);

          if (results.length === 0 && pageNumber > 1) {
            setPage(pageNumber - 1);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar formas de pagamento:", err);
        showNotification("Erro ao carregar dados", true);
      } finally {
        setLoading(false);
      }
    },
    [showNotification],
  );

  useEffect(() => {
    fetchPaymentMethod(search, sort, page);
  }, [fetchPaymentMethod, search, sort, page]);

  const create = useCallback(
    async (values: { name: string }) => {
      try {
        const data = await createAction(values);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Criado com sucesso!", false);
        await fetchPaymentMethod(search, sort, page);
        return true;
      } catch {
        showNotification(PAYMENT_METHOD_TEXTS.NOTIFICATIONS.ERROR_CREATE, true);
        return false;
      }
    },
    [fetchPaymentMethod, search, sort, page, showNotification],
  );

  const update = useCallback(
    async (id: string, values: { name: string }) => {
      try {
        const data = await updateAction(values, id);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Atualizado com sucesso!", false);
        await fetchPaymentMethod(search, sort, page);
        return true;
      } catch {
        showNotification(PAYMENT_METHOD_TEXTS.NOTIFICATIONS.ERROR_UPDATE, true);
        return false;
      }
    },
    [fetchPaymentMethod, search, sort, page, showNotification],
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
        await fetchPaymentMethod(search, sort, page);
        return true;
      } catch {
        showNotification(PAYMENT_METHOD_TEXTS.NOTIFICATIONS.ERROR_DELETE, true);
        return false;
      }
    },
    [fetchPaymentMethod, search, sort, page, showNotification],
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
    paymentMethod,
    loading,
    notification,
    closeNotification,
    showNotification,
    create,
    update,
    delete: delete_,
    refetch: fetchPaymentMethod,
    handleSearch,
    handleSort,
    page,
    totalItems,
    onPageChange: handlePageChange,
  };
}

import { useCallback, useEffect, useState } from "react";
import { useNotification } from "@/hooks/useNotification";
import {
  CATEGORY_TABLE_COLUMNS,
  CATEGORY_TEXTS,
  TABLE_ROWS_PER_PAGE,
} from "../_utils/const";
import { CategoryRaw } from "../_utils/transformers";
import { createCategory as createAction } from "@/actions/category/createCategory";
import { updateCategory as updateAction } from "@/actions/category/updateCategory";
import { deleteCategory as deleteAction } from "@/actions/category/deleteCategory";
import { SortState } from "design-system-zeroz";

const SORT_FIELD_MAP: Record<number, string> = {
  0: "createdAt",
  1: "name",
};

export function useCategoryData() {
  const [categories, setCategories] = useState<CategoryRaw[]>([]);
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

  const fetchCategories = useCallback(
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

        const res = await fetch(`/api/categories?${params}`);
        if (!res.ok) throw new Error("Failed to fetch categories");

        const data = await res.json();
        const results = Array.isArray(data?.items) ? data?.items : [];

        if (searchQuery && results.length === 0) {
          const fallbackParams = new URLSearchParams({
            search: "",
            sortField,
            sortOrder,
            page: "1",
            pageSize: String(TABLE_ROWS_PER_PAGE),
          });

          const fallbackRes = await fetch(`/api/categories?${fallbackParams}`);
          if (!fallbackRes.ok) throw new Error("Failed to fetch categories");

          const fallbackData = await fallbackRes.json();
          setCategories(
            Array.isArray(fallbackData?.items) ? fallbackData?.items : [],
          );

          setTotalItems(fallbackData?.totalItems ?? 0);
          setPage(1);

          showNotification("Nenhum registro encontrado.", true);
        } else {
          setCategories(results);
          setTotalItems(data?.totalItems ?? 0);

          if (results.length === 0 && pageNumber > 1) {
            setPage(pageNumber - 1);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar categorias:", err);
        showNotification("Erro ao carregar dados", true);
      } finally {
        setLoading(false);
      }
    },
    [showNotification],
  );

  useEffect(() => {
    fetchCategories(search, sort, page);
  }, [fetchCategories, search, sort, page]);

  const create = useCallback(
    async (values: { name: string; subcategoria: string[] }) => {
      try {
        const data = await createAction(values);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Criado com sucesso!", false);
        await fetchCategories(search, sort, page);
        return true;
      } catch {
        showNotification(CATEGORY_TEXTS.NOTIFICATIONS.ERROR_CREATE, true);
        return false;
      }
    },
    [fetchCategories, search, sort, page, showNotification],
  );

  const update = useCallback(
    async (
      categoryId: string,
      values: { name: string; subcategoria: string[] },
    ) => {
      try {
        const data = await updateAction(values, categoryId);
        if (data.error) {
          showNotification(data.error, true);
          return false;
        }
        showNotification(data.success || "Atualizado com sucesso!", false);
        await fetchCategories(search, sort, page);
        return true;
      } catch {
        showNotification(CATEGORY_TEXTS.NOTIFICATIONS.ERROR_UPDATE, true);
        return false;
      }
    },
    [fetchCategories, search, sort, page, showNotification],
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
        await fetchCategories(search, sort, page);
        return true;
      } catch {
        showNotification(CATEGORY_TEXTS.NOTIFICATIONS.ERROR_DELETE, true);
        return false;
      }
    },
    [fetchCategories, search, sort, page, showNotification],
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
    categories,
    loading,
    notification,
    handleSearch,
    handleSort,
    closeNotification,
    showNotification,
    create,
    update,
    delete: delete_,
    refetch: fetchCategories,
    page: page,
    totalItems: totalItems,
    onPageChange: handlePageChange,
  };
}

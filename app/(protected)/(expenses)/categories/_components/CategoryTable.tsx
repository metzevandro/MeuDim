import React, { useCallback, useMemo } from "react";
import { Button, Bagde, DataTable, SortState } from "design-system-zeroz";
import {
  CATEGORY_TEXTS,
  TABLE_ROWS_PER_PAGE,
  SUBCATEGORIES_MAX_WIDTH,
  CATEGORY_TABLE_COLUMNS,
} from "../_utils/const";
import { CategoryFormatted, SubcategoryRaw } from "../_utils/transformers";

/**
 * Renderiza os badges de subcategorias de uma linha, agrupando o excedente
 * em um badge "+N" quando a largura estimada ultrapassa SUBCATEGORIES_MAX_WIDTH.
 */
function renderSubcategoriesCell(subcategories: SubcategoryRaw[]) {
  let totalWidth = 0;
  const displayed: SubcategoryRaw[] = [];
  let remainingCount = 0;

  subcategories.forEach((sub) => {
    const subWidth = sub.name.length * 8 + 32;
    if (totalWidth + subWidth <= SUBCATEGORIES_MAX_WIDTH) {
      displayed.push(sub);
      totalWidth += subWidth;
    } else {
      remainingCount++;
    }
  });

  return (
    <div style={{ display: "flex", gap: "4px", flexWrap: "nowrap" }}>
      {displayed.map((sub, index) => (
        <Bagde
          key={sub.id ?? index}
          label={sub.name}
          type="light"
          variant="primary"
        />
      ))}
      {remainingCount > 0 && (
        <Bagde label={`+${remainingCount}`} type="light" variant="primary" />
      )}
    </div>
  );
}

interface CategoryTableProps {
  data: CategoryFormatted[];
  skeleton?: boolean;
  selectedRows: string[];
  onSelectedRowsChange: (rows: string[]) => void;
  onUpdateSelectedRows?: (callback: (ids: string[]) => void) => void;
  onEdit: (id: string) => void;
  onDelete: (ids: string[]) => void;
  onSearch?: (query: string) => void;
  onSort?: (sort: SortState) => void;
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const CategoryTable: React.FC<CategoryTableProps> = ({
  data,
  skeleton = true,
  selectedRows,
  onSelectedRowsChange,
  onUpdateSelectedRows,
  onEdit,
  onDelete,
  onSort,
  onSearch,
  page,
  totalItems,
  onPageChange,
}) => {
  const handleEditClick = useCallback(() => {
    if (selectedRows.length !== 1) return;
    onEdit(selectedRows[0]);
  }, [selectedRows, onEdit]);

  const handleDeleteClick = useCallback(() => {
    onDelete(selectedRows);
  }, [selectedRows, onDelete]);

  const tableData = useMemo(
    () =>
      data.map((row) => ({
        id: row.id,
        Data: row.Data,
        Categoria: row.Categoria,
        Subcategorias: renderSubcategoriesCell(row.subcategorias),
      })),
    [data],
  );

  const textRowsSelected = useMemo(
    () => CATEGORY_TEXTS.TABLE.ROWS_SELECTED(selectedRows.length),
    [selectedRows.length],
  );

  return (
    <DataTable
      textRowsSelected={textRowsSelected}
      skeleton={skeleton}
      rowsPerPage={TABLE_ROWS_PER_PAGE}
      columns={CATEGORY_TABLE_COLUMNS}
      data={tableData}
      withCheckbox={true}
      onSelectedRowsChange={onSelectedRowsChange}
      onUpdateSelectedRows={onUpdateSelectedRows}
      onSearch={onSearch}
      onSort={onSort}
      onPageChange={onPageChange}
      totalItems={totalItems}
      page={page}
      headerSelectedChildren={
        <>
          <Button
            size="md"
            variant="secondary"
            icon="delete"
            onClick={handleDeleteClick}
            disabled={selectedRows.length === 0}
          >
            {CATEGORY_TEXTS.BUTTON_DELETE}
          </Button>
          {selectedRows.length === 1 && (
            <Button size="md" variant="secondary" onClick={handleEditClick}>
              {CATEGORY_TEXTS.BUTTON_EDIT}
            </Button>
          )}
        </>
      }
    />
  );
};

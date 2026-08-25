import React, { useCallback, useEffect, useRef } from "react";
import { DataTable, Button, SortState } from "design-system-zeroz";
import { INCOME_SOURCE_TEXTS, TABLE_ROWS_PER_PAGE } from "../_utils/const";
import { IncomeSourceFormatted } from "../_utils/transformers";

interface IncomeSourceTableProps {
  data: IncomeSourceFormatted[];
  skeleton?: boolean;
  selectedRows: string[];
  onSelectedRowsChange: (rows: string[]) => void;
  onUpdateSelectedRows?: (callback: (ids: string[]) => void) => void;
  onEdit: (id: string, name: string) => void;
  onDelete: (ids: string[]) => void;
  onSearch?: (query: string) => void;
  onSort?: (sort: SortState) => void;
  page: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}

export const IncomeSourceTable: React.FC<IncomeSourceTableProps> = ({
  data,
  skeleton = true,
  selectedRows,
  onSelectedRowsChange,
  onUpdateSelectedRows,
  onEdit,
  onDelete,
  onSearch,
  onSort,
  page,
  totalItems,
  onPageChange,
}) => {
  const onSelectedRowsChangeRef = useRef(onSelectedRowsChange);
  useEffect(() => {
    onSelectedRowsChangeRef.current = onSelectedRowsChange;
  }, [onSelectedRowsChange]);

  const handleEditClick = useCallback(() => {
    if (selectedRows.length !== 1) return;
    const selectedData = data.find((row) => row.id === selectedRows[0]);
    if (selectedData) {
      onEdit(selectedRows[0], selectedData["Fonte de Renda"]);
    }
  }, [selectedRows, data, onEdit]);

  const handleDeleteClick = useCallback(() => {
    onDelete(selectedRows);
  }, [selectedRows, onDelete]);

  const handleSelectedRowsChange = useCallback((rows: string[]) => {
    onSelectedRowsChangeRef.current(rows);
  }, []);

  return (
    <DataTable
      skeleton={skeleton}
      rowsPerPage={TABLE_ROWS_PER_PAGE}
      columns={INCOME_SOURCE_TEXTS.TABLE.COLS}
      data={data}
      withCheckbox={true}
      onSearch={onSearch}
      onSort={onSort}
      onSelectedRowsChange={handleSelectedRowsChange}
      onUpdateSelectedRows={onUpdateSelectedRows}
      textRowsSelected={INCOME_SOURCE_TEXTS.TABLE.ROWS_SELECTED_LABEL}
      page={page}
      onPageChange={onPageChange}
      totalItems={totalItems}
      headerSelectedChildren={
        <>
          <Button
            size="md"
            variant="secondary"
            icon="delete"
            onClick={handleDeleteClick}
            disabled={selectedRows.length === 0}
          >
            {INCOME_SOURCE_TEXTS.BUTTON_DELETE}
          </Button>
          {selectedRows.length === 1 && (
            <Button variant="secondary" size="md" onClick={handleEditClick}>
              Editar
            </Button>
          )}
        </>
      }
    />
  );
};

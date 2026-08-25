import React, { useCallback, useMemo } from "react";
import { DataTable, Button, SortState } from "design-system-zeroz";
import { EARNING_TEXTS, TABLE_ROWS_PER_PAGE } from "../_utils/const";
import { EarningFormatted } from "../_utils/transformers";

interface EarningTableProps {
  data: EarningFormatted[];
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

export const EarningTable: React.FC<EarningTableProps> = ({
  data,
  skeleton = true,
  selectedRows,
  onSelectedRowsChange,
  onUpdateSelectedRows,
  onEdit,
  onDelete,
  onSearch,
  onSort,
  totalItems,
  page,
  onPageChange,
}) => {
  const handleEditClick = useCallback(() => {
    if (selectedRows.length !== 1) return;
    onEdit(selectedRows[0]);
  }, [selectedRows, onEdit]);

  const handleDeleteClick = useCallback(() => {
    onDelete(selectedRows);
  }, [selectedRows, onDelete]);

  const HeaderActions = useCallback(
    () => (
      <>
        <Button
          size="md"
          variant="secondary"
          icon="delete"
          onClick={handleDeleteClick}
          disabled={selectedRows.length === 0}
        >
          {EARNING_TEXTS.BUTTON_DELETE}
        </Button>
        {selectedRows.length === 1 && (
          <Button variant="secondary" size="md" onClick={handleEditClick}>
            Editar
          </Button>
        )}
      </>
    ),
    [selectedRows, handleDeleteClick, handleEditClick],
  );

  const headerSelectedChildren = useMemo(
    () => <HeaderActions />,
    [HeaderActions],
  );

  const textRowsSelected = useMemo(
    () => EARNING_TEXTS.TABLE.ROWS_SELECTED(selectedRows.length),
    [selectedRows.length],
  );

  return (
    <DataTable
      skeleton={skeleton}
      rowsPerPage={TABLE_ROWS_PER_PAGE}
      columns={EARNING_TEXTS.TABLE.COLS}
      data={data}
      withCheckbox={true}
      onSearch={onSearch}
      onSort={onSort}
      onSelectedRowsChange={onSelectedRowsChange}
      onUpdateSelectedRows={onUpdateSelectedRows}
      headerSelectedChildren={headerSelectedChildren}
      textRowsSelected={textRowsSelected}
      onPageChange={onPageChange}
      page={page}
      totalItems={totalItems}
    />
  );
};

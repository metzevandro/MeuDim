import React, { useCallback, useMemo } from "react";
import { DataTable, Button, SortState } from "design-system-zeroz";
import { PAYMENT_METHOD_TEXTS, TABLE_ROWS_PER_PAGE } from "../_utils/const";
import { PaymentMethodFormatted } from "../_utils/transformers";

interface PaymentMethodTableProps {
  data: PaymentMethodFormatted[];
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

export const PaymentMethodTable: React.FC<PaymentMethodTableProps> = ({
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
          {PAYMENT_METHOD_TEXTS.BUTTON_DELETE}
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
    () => PAYMENT_METHOD_TEXTS.TABLE.ROWS_SELECTED(selectedRows.length),
    [selectedRows.length],
  );

  return (
    <DataTable
      skeleton={skeleton}
      rowsPerPage={TABLE_ROWS_PER_PAGE}
      columns={PAYMENT_METHOD_TEXTS.TABLE.COLS}
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

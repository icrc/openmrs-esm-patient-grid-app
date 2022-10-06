import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
  TableBody,
  TableCell,
  Button,
  DataTableSkeleton,
} from '@carbon/react';
import { ChevronSort, ArrowUp, ArrowDown } from '@carbon/react/icons';
import {
  flexRender,
  getCoreRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { useTranslation } from 'react-i18next';
import { FormGet, FormSchema, PatientGridReportGet } from '../api';
import { useHistoricEncountersGrid } from './useHistoricEncountersGrid';
import styles from './HistoricEncountersGrid.scss';
import { useVisibleColumnsOnly } from './useVisibleColumnsOnly';
import { ColumnNameToHiddenStateMap } from '../grid-utils';

export interface HistoricEncountersGridProps {
  patientId: string;
  form: FormGet;
  formSchema: FormSchema;
  report: PatientGridReportGet;
  columnHiddenStates: ColumnNameToHiddenStateMap;
}

const stableEmptyArray = [];

export function HistoricEncountersGrid({
  patientId,
  form,
  formSchema,
  report,
  columnHiddenStates,
}: HistoricEncountersGridProps) {
  const { t } = useTranslation();
  const { data } = useHistoricEncountersGrid(patientId, form, formSchema, report);
  const [sorting, setSorting] = useState<SortingState>([]);
  const visibleColumns = useVisibleColumnsOnly(data?.columns ?? stableEmptyArray, columnHiddenStates);
  const table = useReactTable({
    columns: visibleColumns,
    data: data?.data ?? stableEmptyArray,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
    },
  });
  const headerGroups = table.getHeaderGroups();

  if (!data) {
    <DataTableSkeleton showHeader={false} showToolbar={false} />;
  }

  return (
    <Table className={styles.table} useZebraStyles>
      <TableHead>
        {headerGroups.map((headerGroup, headerGroupIndex) => (
          <TableRow key={headerGroup.id}>
            {headerGroup.headers.map((header) => (
              <TableHeader key={header.id} colSpan={header.colSpan}>
                {header.isPlaceholder ? null : (
                  <div className={styles.headerWithActions}>
                    {flexRender(header.column.columnDef.header, header.getContext())}

                    {headerGroupIndex === headerGroups.length - 1 && (
                      <>
                        <Button
                          hasIconOnly
                          renderIcon={
                            header.column.getIsSorted() !== false
                              ? header.column.getIsSorted() === 'desc'
                                ? ArrowDown
                                : ArrowUp
                              : ChevronSort
                          }
                          size="sm"
                          kind="ghost"
                          iconDescription={t('patientGridSortColumnDescription', 'Sort')}
                          onClick={header.column.getToggleSortingHandler()}
                        />
                        {/* <PatientGridColumnFiltersButton
                          columnDisplayName={header.column.columnDef.header?.toString() ?? ''}
                          column={header.column}
                        /> */}
                      </>
                    )}
                  </div>
                )}
              </TableHeader>
            ))}
          </TableRow>
        ))}
      </TableHead>

      <TableBody>
        {table.getRowModel().rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

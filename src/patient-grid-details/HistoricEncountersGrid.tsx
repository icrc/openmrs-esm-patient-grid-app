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
import styles from './HistoricEncountersGrid.scss';
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

export interface HistoricEncountersGridProps {
  patientId: string;
  form: FormGet;
  formSchema: FormSchema;
  report: PatientGridReportGet;
}

export function HistoricEncountersGrid({ patientId, form, formSchema, report }: HistoricEncountersGridProps) {
  const { t } = useTranslation();
  const { data } = useHistoricEncountersGrid(patientId, form, formSchema, report);
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns: data?.columns ?? [],
    data: data?.data ?? [],
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
          <TableRow key={headerGroup.id} className={styles.tableHeaderRow}>
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
              <TableCell key={cell.id} className={styles.tableCell}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

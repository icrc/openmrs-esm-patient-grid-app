import {
  Button,
  Search,
  Table,
  TableHead,
  TableRow,
  TableHeader,
  TableExpandedRow,
  TableBody,
  TableCell,
  Layer,
} from '@carbon/react';
import { ChevronDown, ChevronUp, ChevronSort, ArrowUp, ArrowDown, Download, OpenPanelRight } from '@carbon/react/icons';
import React, { Fragment, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  ColumnDef,
  getFacetedUniqueValues,
} from '@tanstack/react-table';
import styles from './PatientGrid.scss';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { PatientGridColumnFiltersButton } from './PatientGridColumnFiltersButton';

export interface PatientGridProps {
  columns: Array<ColumnDef<unknown, unknown>>;
  data: Array<unknown>;
}

export function PatientGrid({ columns, data }: PatientGridProps) {
  const { t } = useTranslation();
  const [globalFilter, setGlobalFilter] = useState('');
  const handleGlobalFilterChange = useMemo(() => debounce(setGlobalFilter, 300), []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const table = useReactTable({
    columns,
    data,
    getCoreRowModel: getCoreRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      globalFilter,
    },
  });
  const headerGroups = table.getHeaderGroups();

  return (
    <main>
      <section className={styles.tableHeaderContainer}>
        <>
          <Button size="sm" kind="ghost" renderIcon={Download}>
            {t('patientGridDownloadButton', 'Download')}
          </Button>
          <Button size="sm" kind="ghost" renderIcon={OpenPanelRight}>
            {t('patientGridColumnsButton', 'Columns ({actual}/{total})', {
              actual: '?',
              total: headerGroups[headerGroups.length - 1].headers.length,
            })}
          </Button>
          <Layer className={styles.tableSearchLayer}>
            <Search
              size="sm"
              placeholder={t('patientGridSearchPlaceholder', 'Search')}
              labelText={t('patientGridSearchLabel', 'Search')}
              onChange={(e) => handleGlobalFilterChange(e.target.value)}
            />
          </Layer>
        </>
      </section>
      <div className={styles.relativeTablePositioner}>
        <section className={styles.rawTableContainer}>
          <Table className={styles.table} useZebraStyles>
            <TableHead>
              {headerGroups.map((headerGroup, headerGroupIndex) => (
                <TableRow key={headerGroup.id} className={styles.tableHeaderRow}>
                  {/* Expand header. */}
                  <TableHeader />

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
                              <PatientGridColumnFiltersButton
                                columnDisplayName={header.column.columnDef.header?.toString() ?? ''}
                                column={header.column}
                              />
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
                <Fragment key={row.id}>
                  <TableRow>
                    <TableCell>
                      <div className={styles.expandCell}>
                        Show all forms{' '}
                        <Button
                          hasIconOnly
                          renderIcon={row.getIsExpanded() ? ChevronUp : ChevronDown}
                          size="sm"
                          kind="ghost"
                          iconDescription={t('patientGridShowAllForms', 'Show all forms')}
                          onClick={() => row.toggleExpanded()}
                        />
                      </div>
                    </TableCell>

                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className={styles.tableCell}
                        onClick={() => {
                          // TODO: Open side panel which allows editing.
                        }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableExpandedRow colSpan="100%">
                      <h1>TODO: Inner Form Grid Goes here</h1>
                    </TableExpandedRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>
    </main>
  );
}

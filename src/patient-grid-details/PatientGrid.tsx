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
  Link,
  Stack,
} from '@carbon/react';
import {
  ChevronDown,
  ChevronUp,
  ChevronSort,
  ArrowUp,
  ArrowDown,
  Download,
  OpenPanelRight,
  Renew,
  WarningAltFilled,
} from '@carbon/react/icons';
import React, { Fragment, useContext, useMemo, useState } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  SortingState,
  getSortedRowModel,
  getFilteredRowModel,
  getFacetedUniqueValues,
  Cell,
  Row,
  GroupColumnDef,
} from '@tanstack/react-table';
import styles from './PatientGrid.scss';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash-es/debounce';
import { PatientGridColumnFiltersButton } from './PatientGridColumnFiltersButton';
import { HistoricEncountersTabs } from './HistoricEncountersTabs';
import { PatientGridDataRow } from './usePatientGrid';
import { DownloadModal } from './DownloadModal';
import { EditSidePanelValues } from './PatientGridDetailsPage';
import {
  isFormSchemaQuestionColumnName,
  patientDetailsNameColumnName,
  getFormEngineDataRequiredForEditing,
  InlinePatientGridEditingContext,
} from '../grid-utils';
import { interpolateUrl } from '@openmrs/esm-framework';
import { useVisibleColumnsOnly } from '../grid-utils/useVisibleColumnsOnly';
import { useGetPatientGrid } from '../api';

export interface PatientGridProps {
  patientGridId: string;
  columns: Array<GroupColumnDef<PatientGridDataRow, unknown>>;
  data: Array<PatientGridDataRow>;
  showReloadGrid: boolean;
  showEditSidePanel(values: EditSidePanelValues): void;
  showToggleColumnsSidePanel(): void;
  refreshPatientGrid(): void;
}

export function PatientGrid({
  patientGridId,
  columns,
  data,
  showReloadGrid,
  showEditSidePanel,
  showToggleColumnsSidePanel,
  refreshPatientGrid,
}: PatientGridProps) {
  const { t } = useTranslation();
  const { data: patientGrid } = useGetPatientGrid(patientGridId);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);
  const [globalFilter, setGlobalFilter] = useState('');
  const handleGlobalFilterChange = useMemo(() => debounce(setGlobalFilter, 300), []);
  const [sorting, setSorting] = useState<SortingState>([]);
  const visibleColumns = useVisibleColumnsOnly(columns);
  const table = useReactTable<PatientGridDataRow>({
    columns: visibleColumns,
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
  const { columnHiddenStates } = useContext(InlinePatientGridEditingContext);

  const handleCellClick = (cell: Cell<PatientGridDataRow, unknown>, row: Row<PatientGridDataRow>) => {
    const columnName = cell.column.id;
    const formEngineData = getFormEngineDataRequiredForEditing(row.original.__reportRow, columnName);
    showEditSidePanel(formEngineData);
  };

  return (
    <main>
      <section className={styles.tableHeaderContainer}>
        <>
          {showReloadGrid && (
            <Stack className={styles.reloadContainer} orientation="horizontal" gap={3}>
              <WarningAltFilled className={styles.reloadWarningIcon} />
              <span className={styles.reloadMessage}>
                {t('patientGridReloadWarning', 'The list contains changes that are not visible.')}
              </span>
              <Button size="sm" kind="ghost" renderIcon={Renew} onClick={refreshPatientGrid}>
                {t('patientGridReloadButton', 'Reload')}
              </Button>
            </Stack>
          )}
          <Button size="sm" kind="ghost" renderIcon={Download} onClick={() => setIsDownloadModalOpen(true)}>
            {t('patientGridDownloadButton', 'Download')}
          </Button>
          <Button size="sm" kind="ghost" renderIcon={OpenPanelRight} onClick={showToggleColumnsSidePanel}>
            {t('patientGridColumnsButton', 'Columns ({actual}/{total})', {
              actual: Object.values(columnHiddenStates).filter((x) => !x).length,
              total: patientGrid?.columns.length,
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
                <TableRow key={headerGroup.id}>
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
                                patientGridId={patientGridId}
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
              {table.getRowModel().rows.map((row, index) => (
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
                        onClick={
                          isFormSchemaQuestionColumnName(cell.column.id)
                            ? () => handleCellClick(cell, row)
                            : () => undefined
                        }
                        className={isFormSchemaQuestionColumnName(cell.column.id) ? styles.clickableCell : undefined}>
                        {cell.column.id === patientDetailsNameColumnName ? (
                          <Link
                            href={interpolateUrl(`\${openmrsSpaBase}/patient/${row.original.__reportRow.uuid}/chart`)}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </Link>
                        ) : (
                          flexRender(cell.column.columnDef.cell, cell.getContext())
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    // Carbon isn't designed, at all, for having a nested table.
                    // The nested tables' rows count towards the current zebra count of this outer table.
                    // To prevent the zebra style from being switched up by the inner table
                    // (and to also ensure that the inner table always "starts" with a light zebra row),
                    // hidden filler rows are inserted here at a location where they ensure that the
                    // outer zebra style appears in continuous colors.
                    <>
                      {index % 2 === 0 && <tr className={styles.hiddenTableRowForContinuousZebra} />}
                      <TableExpandedRow className={styles.expandRow} colSpan="100%">
                        <div className={styles.expandRowBackdrop}>
                          <HistoricEncountersTabs report={row.original.__report} reportRow={row.original.__reportRow} />
                        </div>
                      </TableExpandedRow>
                      {index % 2 === 1 && <tr className={styles.hiddenTableRowForContinuousZebra} />}
                    </>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </section>
      </div>

      <DownloadModal
        patientGridId={patientGridId}
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </main>
  );
}

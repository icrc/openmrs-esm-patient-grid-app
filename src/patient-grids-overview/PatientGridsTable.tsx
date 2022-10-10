import React, { useMemo, useState } from 'react';
import {
  DataTable,
  DataTableSkeleton,
  Search,
  Layer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  Link,
  OverflowMenu,
  OverflowMenuItem,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Link as ReactRouterLink, useNavigate } from 'react-router-dom';
import styles from './PatientGridsTable.scss';
import { routes } from '../routes';
import { PatientGridGet, useGetAllPatientGrids, PatientGridViewType, usePatientGridsOfType } from '../api';
import { ErrorState, useSession } from '@openmrs/esm-framework';
import { DeletePatientGridModal, EditPatientGridModal } from '../crosscutting-features';

export interface PatientGridsTableProps {
  type: PatientGridViewType;
}

export function PatientGridsTable({ type }: PatientGridsTableProps) {
  const { t } = useTranslation();
  const session = useSession();
  const navigate = useNavigate();
  const { data: patientGrids, error: patientGridsError } = useGetAllPatientGrids();
  const headers = useTableHeaders();
  const rows = useTableRows(type);
  const [patientGridToDelete, setPatientGridToDelete] = useState<PatientGridGet | undefined>(undefined);
  const [patientGridToEdit, setPatientGridToEdit] = useState<PatientGridGet | undefined>(undefined);

  if (patientGridsError && !patientGrids) {
    // TODO: This error state looks weird in the UI. I assume that it's better than having nothing, but
    // a designer should probably weigh in on this.
    return (
      <ErrorState
        headerTitle={t('patientGridsFetchingFailed', 'Loading the patient grids failed')}
        error={patientGridsError}
      />
    );
  }

  if (!patientGrids) {
    return <DataTableSkeleton headers={headers} showHeader={false} showToolbar={false} />;
  }

  return (
    <div>
      <DataTable headers={headers} rows={rows} overflowMenuOnHover={false} filterRows={filterTableRows}>
        {({ rows, headers, getTableProps, getHeaderProps, getRowProps, onInputChange }) => (
          <>
            <div className={styles.tableHeaderContainer}>
              <Layer className={styles.tableSearchLayer}>
                <Search
                  size="sm"
                  placeholder={t('patientGridsFilterLabelAndPlaceholder', 'Search these grids')}
                  labelText={t('patientGridsFilterLabelAndPlaceholder', 'Search these grids')}
                  onChange={onInputChange}
                />
              </Layer>
            </div>
            <Table {...getTableProps()} size="sm">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>{header.header}</TableHeader>
                  ))}
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows?.map((row) => {
                  const patientGrid = patientGrids.find((patientGrid) => patientGrid.uuid === row.id);
                  return (
                    <TableRow {...getRowProps({ row })}>
                      {row.cells.map((cell) => (
                        <TableCell key={cell.id}>
                          {typeof cell.value === 'object' ? cell.value.cellContent : cell.value}
                        </TableCell>
                      ))}
                      <TableCell className="cds--table-column-menu">
                        <OverflowMenu size="sm" ariaLabel={t('patientGridRowLabel', 'Actions')}>
                          <OverflowMenuItem
                            itemText={t('patientGridViewRowMenuItem', 'View')}
                            onClick={() =>
                              navigate(
                                routes.patientGridDetails.interpolate({
                                  id: row.id,
                                }),
                              )
                            }
                          />
                          <OverflowMenuItem
                            itemText={t('patientGridEditRowMenuItem', 'Edit')}
                            onClick={() => setPatientGridToEdit(patientGrid)}
                            disabled={patientGrid?.owner?.uuid !== session.user?.uuid}
                          />
                          <OverflowMenuItem
                            isDelete
                            itemText={t('patientGridDeleteRowMenuItem', 'Delete')}
                            onClick={() => setPatientGridToDelete(patientGrid)}
                            disabled={patientGrid?.owner?.uuid !== session.user?.uuid}
                          />
                        </OverflowMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </>
        )}
      </DataTable>

      <EditPatientGridModal patientGridToEdit={patientGridToEdit} setPatientGridToEdit={setPatientGridToEdit} />
      <DeletePatientGridModal
        patientGridToDelete={patientGridToDelete}
        setPatientGridToDelete={setPatientGridToDelete}
      />
    </div>
  );
}

function useTableHeaders() {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { key: 'name', header: t('gridNameTableHeader', 'Grid name') },
      {
        key: 'description',
        header: t('descriptionTableHeader', 'Description'),
      },
      { key: 'ownership', header: t('gridOwnershipTableHeader', 'Ownership') },
      { key: 'shared', header: t('gridSharedTableHeader', 'Shared') },
    ],
    [t],
  );
}

function useTableRows(type: PatientGridViewType) {
  const { t } = useTranslation();
  const session = useSession();
  const { data: patientGrids = [] } = usePatientGridsOfType(type);

  return useMemo(
    () =>
      patientGrids.map((patientGrid) => {
        const ownershipString = patientGrid.owner
          ? patientGrid.owner.uuid === session.user?.uuid
            ? t('patientGridsOwnerMyGrid', 'My grid')
            : t('patientGridsOwnerOtherGrid', "Other's grid")
          : t('patientGridsOwnerUnownedGrid', 'Unowned grid');

        return {
          id: patientGrid.uuid,
          name: {
            cellContent: (
              <ReactRouterLink
                to={routes.patientGridDetails.interpolate({
                  id: patientGrid.uuid,
                })}>
                <Link>{patientGrid.name}</Link>
              </ReactRouterLink>
            ),
            filterableString: patientGrid.name,
          },
          description: {
            cellContent: patientGrid.description || t('patientGridsDescriptionCellFallback', '--'),
            filterableString: patientGrid.description || t('patientGridsDescriptionCellFallback', '--'),
          },
          ownership: {
            cellContent: ownershipString,
            filterableString: ownershipString,
          },
          shared: {
            cellContent: patientGrid.shared ? t('patientGridsShared', 'Yes') : t('patientGridsNotShared', 'No'),
            filterableString: patientGrid.shared ? t('patientGridsShared', 'Yes') : t('patientGridsNotShared', 'No'),
          },
        };
      }),
    [patientGrids, t, session.user],
  );
}

function filterTableRows({ rowIds, headers, cellsById, inputValue, getCellId }) {
  return rowIds.filter((rowId) =>
    headers.some(({ key }) => {
      const cellId = getCellId(rowId, key);
      const value = cellsById[cellId].value;
      const filterableValue = value?.filterableString?.toString() ?? value?.toString() ?? '';
      return filterableValue.replace(/\s/g, '').toLowerCase().includes(inputValue.replace(/\s/g, '').toLowerCase());
    }),
  );
}

import { GroupColumnDef } from '@tanstack/react-table';
import { Checkbox, ModalFooter } from '@carbon/react';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SidePanel } from '../components';
import styles from './ToggleColumnsSidePanel.scss';
import { PatientGridDataRow } from './usePatientGrid';
import { ColumnNameToHiddenStateMap } from '../grid-utils';
import { isAccessorKeyColumnDef, isGroupColumnDef } from '../grid-utils/reactTable';

export interface ToggleColumnsSidePanelProps {
  columns: Array<GroupColumnDef<PatientGridDataRow>>;
  columnHiddenStates: ColumnNameToHiddenStateMap;
  onClose(): void;
  onSubmit(value: ColumnNameToHiddenStateMap);
}

export function ToggleColumnsSidePanel({
  columns,
  columnHiddenStates,
  onSubmit,
  onClose,
}: ToggleColumnsSidePanelProps) {
  const { t } = useTranslation();
  const [localColumnHiddenStates, setLocalColumnHiddenStates] = useState(columnHiddenStates);

  // Sync undo/redo while the panel is open.
  useEffect(() => setLocalColumnHiddenStates(columnHiddenStates), [columnHiddenStates]);

  const submit = () => {
    onSubmit(localColumnHiddenStates);
    onClose();
  };

  const setColumnHiddenState = (columnName: string, hidden: boolean) => {
    setLocalColumnHiddenStates((state) => ({
      ...state,
      [columnName]: hidden,
    }));
  };

  return (
    <SidePanel
      title={t('toggleColumnsSidePanelTitle', 'Grid columns')}
      footer={
        <ModalFooter
          primaryButtonText={t('toggleColumnsSidePanelSubmit', 'Accept')}
          secondaryButtonText={t('toggleColumnsSidePanelCancel', 'Cancel')}
          onRequestClose={onClose}
          onRequestSubmit={submit}
        />
      }
      onClose={onClose}>
      <aside className={styles.contentContainer}>
        <span className={styles.header}>{t('toggleColumnsSidePanelHeader', 'Enable/Disable columns')}</span>
        <section className={styles.columnCheckboxContainer}>
          {columns.map((column, index) => (
            <ColumnCheckboxGroup
              key={index}
              groupColumnDef={column as GroupColumnDef<unknown>}
              setColumnHiddenState={setColumnHiddenState}
              columnHiddenStates={localColumnHiddenStates}
            />
          ))}
        </section>
      </aside>
    </SidePanel>
  );
}

interface ColumnCheckboxGroupProps {
  columnHiddenStates: ColumnNameToHiddenStateMap;
  groupColumnDef: GroupColumnDef<unknown>;
  setColumnHiddenState(columnName: string, hidden: boolean): void;
}

function ColumnCheckboxGroup({ columnHiddenStates, groupColumnDef, setColumnHiddenState }: ColumnCheckboxGroupProps) {
  const columns = groupColumnDef.columns ?? [];
  const areAllChildrenHidden = areAllSubColumnsHidden(groupColumnDef, columnHiddenStates);
  const areAllChildrenVisible = areAllSubColumnsVisible(groupColumnDef, columnHiddenStates);

  const handleGroupChecked = (checked: boolean) => {
    const impl = (group: GroupColumnDef<unknown>) => {
      for (const childColumn of group.columns ?? []) {
        if (isAccessorKeyColumnDef(childColumn)) {
          setColumnHiddenState(childColumn.accessorKey, !checked);
        } else if (isGroupColumnDef(childColumn)) {
          impl(childColumn);
        }
      }
    };

    impl(groupColumnDef);
  };

  return (
    <>
      <Checkbox
        id={groupColumnDef.header}
        labelText={groupColumnDef.header}
        checked={areAllChildrenVisible}
        indeterminate={!areAllChildrenVisible && !areAllChildrenHidden}
        onChange={(_, { checked }) => handleGroupChecked(checked)}
      />
      <div className={styles.nestedColumnGroupContainer}>
        {columns.map((column, index) =>
          isAccessorKeyColumnDef(column) ? (
            <Checkbox
              key={column.accessorKey}
              id={column.accessorKey}
              labelText={column.header}
              checked={!columnHiddenStates[column.accessorKey]}
              onChange={(_, { checked }) => setColumnHiddenState(column.accessorKey, !checked)}
            />
          ) : isGroupColumnDef(column) ? (
            <ColumnCheckboxGroup
              key={`group-${index}`}
              groupColumnDef={column as GroupColumnDef<unknown>}
              columnHiddenStates={columnHiddenStates}
              setColumnHiddenState={setColumnHiddenState}
            />
          ) : null,
        )}
      </div>
    </>
  );
}

function areAllSubColumnsHidden(
  columnGroup: GroupColumnDef<unknown>,
  columnHiddenStates: ColumnNameToHiddenStateMap,
): boolean {
  return (columnGroup.columns ?? []).every((childColumn) => {
    if (isAccessorKeyColumnDef(childColumn)) {
      return columnHiddenStates[childColumn.accessorKey];
    } else if (isGroupColumnDef(childColumn)) {
      return areAllSubColumnsHidden(childColumn, columnHiddenStates);
    } else {
      return false;
    }
  });
}

function areAllSubColumnsVisible(
  columnGroup: GroupColumnDef<unknown>,
  columnHiddenStates: ColumnNameToHiddenStateMap,
): boolean {
  return (columnGroup.columns ?? []).every((childColumn) => {
    if (isAccessorKeyColumnDef(childColumn)) {
      return !columnHiddenStates[childColumn.accessorKey];
    } else if (isGroupColumnDef(childColumn)) {
      return areAllSubColumnsVisible(childColumn, columnHiddenStates);
    } else {
      return false;
    }
  });
}

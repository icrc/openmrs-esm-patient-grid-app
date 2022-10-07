import { createContext, useMemo } from 'react';
import {
  MutateFn,
  useGetAllPatientGridFilters,
  useGetAllPatientGrids,
  useGetPatientGrid,
  useMergedSwr,
  useMutation,
} from '../api';
import { ColumnNameToHiddenStateMap, useColumnHiddenStates } from '.';
import { UndoRedo, useUndoRedo } from './useUndoRedo';
import { openmrsFetch } from '@openmrs/esm-framework';

export interface LocalFilter {
  uuid?: string;
  name: string;
  operand: string;
  columnName: string;
}

export type PatientGridFilters = Array<LocalFilter>;

export interface InlinePatientGridEditingState {
  columnHiddenStates: ColumnNameToHiddenStateMap;
  filters: PatientGridFilters;
}

export interface InlinePatientGridEditingContextState extends UndoRedo<InlinePatientGridEditingState> {
  /**
   * The original state of the patient grid, without any edited values applied.
   */
  original: InlinePatientGridEditingState;
  /**
   * The current hidden states of the columns, with edited values applied.
   * May be the original value if nothing was edited.
   */
  columnHiddenStates: ColumnNameToHiddenStateMap;
  /**
   * The current list of filters, with edited values applied.
   * May be the original value if nothing was edited.
   */
  filters: PatientGridFilters;
  saveChanges: MutateFn<void, unknown, Error>;
  isSavingChanges: boolean;
  canSaveChanges: boolean;
}

export const InlinePatientGridEditingContext = createContext<InlinePatientGridEditingContextState>(null);

export function useInlinePatientGridEditingContextState(patientGridId: string): InlinePatientGridEditingContextState {
  const originalColumnHiddenStatesSwr = useColumnHiddenStates(patientGridId);
  const originalFiltersSwr = useGetAllPatientGridFilters(patientGridId);
  const { mutate: mutateAllPatientGrids } = useGetAllPatientGrids();
  const { data: patientGrid, mutate: mutatePatientGrid } = useGetPatientGrid(patientGridId);
  const { data: original } = useMergedSwr<InlinePatientGridEditingState>(
    () => ({
      columnHiddenStates: originalColumnHiddenStatesSwr.data,
      filters: originalFiltersSwr.data.map((filter) => ({
        uuid: filter.uuid,
        name: filter.name,
        operand: filter.operand,
        // In the filter representation, "display" holds the column name.
        // May be brittle. Should perhaps be improved eventually.
        columnName: filter.column.display,
      })),
    }),
    [originalColumnHiddenStatesSwr, originalFiltersSwr],
  );
  const { canUndo, canRedo, current, undo, redo, push, clear } = useUndoRedo<InlinePatientGridEditingState>();
  const columnHiddenStates = current?.columnHiddenStates ?? original?.columnHiddenStates;
  const filters = current?.filters ?? original?.filters;

  const { mutate: saveChanges, isLoading: isSavingChanges } = useMutation(
    async () => {
      // Should practically never happen, but better be save.
      if (!patientGrid) {
        return;
      }

      const requests: Array<Promise<unknown>> = [];

      // Cross check the column hidden states. Every column that changed from the original must be updated.
      for (const column of patientGrid.columns) {
        if (original.columnHiddenStates[column.name] !== columnHiddenStates[column.name]) {
          requests.push(
            openmrsFetch(`/ws/rest/v1/patientgrid/patientgrid/${patientGridId}/column/${column.uuid}`, {
              headers: { 'Content-Type': 'application/json' },
              method: 'POST',
              body: {
                hidden: columnHiddenStates[column.name],
              },
            }),
          );
        }
      }

      await Promise.all(requests);
    },
    {
      onSettled() {
        Promise.all([mutatePatientGrid(), mutateAllPatientGrids()]).then(clear);
      },
    },
  );

  return useMemo(
    () => ({
      canUndo,
      canRedo,
      current,
      undo,
      redo,
      push,
      clear,
      original,
      columnHiddenStates,
      filters,
      saveChanges,
      isSavingChanges,
      canSaveChanges: !!current,
    }),
    [
      canUndo,
      canRedo,
      current,
      undo,
      redo,
      push,
      clear,
      original,
      saveChanges,
      isSavingChanges,
      columnHiddenStates,
      filters,
    ],
  );
}

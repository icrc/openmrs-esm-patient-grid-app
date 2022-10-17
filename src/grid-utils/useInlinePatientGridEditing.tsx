import React, { createContext, PropsWithChildren, useMemo } from 'react';
import {
  deletePatientGridFilter,
  MutateFn,
  PatientGridGet,
  postPatientGridColumn,
  postPatientGridFilter,
  useGetAllPatientGridFilters,
  useGetAllPatientGrids,
  useGetPatientGrid,
  useMergedSwr,
  useMutation,
} from '../api';
import { UndoRedo, useUndoRedo } from './useUndoRedo';
import { useParams } from 'react-router-dom';
import { PatientGridDetailsParams } from '../routes';

/**
 * A special representation of a filter that can be applied to a patient grid.
 * This representation contains attributes which can come from both
 * a) a filter existing on the backend and
 * b) a filter that only exists locally (yet).
 */
export interface LocalFilter {
  uuid?: string;
  name: string;
  operand: string;
  columnName: string;
}

export type PatientGridFilters = Array<LocalFilter>;

export type ColumnNameToHiddenStateMap = Record<string, boolean>;

/**
 * Contains the state of a patient grid which can be edited locally, i.e.
 * without being synchronized with the backend.
 */
export interface InlinePatientGridEditingState {
  columnHiddenStates: ColumnNameToHiddenStateMap;
  filters: PatientGridFilters;
}

export interface InlinePatientGridEditingContextState extends Omit<UndoRedo<InlinePatientGridEditingState>, 'current'> {
  /**
   * The original state of the patient grid, without any edited values applied.
   */
  originalPatientGridState: InlinePatientGridEditingState;
  /**
   * The "final" state of the patient grid, i.e. the original values with edited values applied.
   */
  localPatientGridState: InlinePatientGridEditingState;
  /**
   * Triggers the mutation for saving the accumulated inline changes.
   */
  saveChanges: MutateFn<void, unknown, Error>;
  /**
   * A value indicating whether the mutation saving the accumulated inline changes is running at the moment.
   */
  isSavingChanges: boolean;
  /**
   * A value indicating whether saving changes is possible at the moment.
   */
  canSaveChanges: boolean;
}

export const InlinePatientGridEditingContext = createContext<InlinePatientGridEditingContextState>(null);

/**
 * A provider component providing the {@link InlinePatientGridEditingContext}.
 */
export function InlinePatientGridEditingContextProvider({ children }: PropsWithChildren) {
  const { id: patientGridId } = useParams<PatientGridDetailsParams>();
  const value = useInlinePatientGridEditingContextState(patientGridId);
  return <InlinePatientGridEditingContext.Provider value={value}>{children}</InlinePatientGridEditingContext.Provider>;
}

/**
 * Provides the value to be provided to the {@link InlinePatientGridEditingContext} for the given patient grid.
 */
function useInlinePatientGridEditingContextState(patientGridId: string): InlinePatientGridEditingContextState {
  const { data: patientGrid } = useGetPatientGrid(patientGridId);
  const { data: originalPatientGridState } = useOriginalPatientGridEditingState(patientGridId);
  const { canUndo, canRedo, current, undo, redo, push, clear } = useUndoRedo<InlinePatientGridEditingState>();
  const localPatientGridState: InlinePatientGridEditingState = useMemo(
    () => ({
      columnHiddenStates: current?.columnHiddenStates ?? originalPatientGridState?.columnHiddenStates ?? {},
      filters: current?.filters ?? originalPatientGridState?.filters ?? [],
    }),
    [current, originalPatientGridState],
  );

  const { mutate: saveChanges, isLoading: isSavingChanges } = useSubmitInlineChangesMutation(
    patientGridId,
    patientGrid,
    originalPatientGridState,
    localPatientGridState,
  );

  const canSaveChanges = !!current && !!patientGrid && !!originalPatientGridState;

  return useMemo(
    () => ({
      canUndo,
      canRedo,
      undo,
      redo,
      push,
      clear,
      originalPatientGridState,
      localPatientGridState,
      saveChanges,
      isSavingChanges,
      canSaveChanges,
    }),
    [
      canUndo,
      canRedo,
      undo,
      redo,
      push,
      clear,
      originalPatientGridState,
      localPatientGridState,
      saveChanges,
      isSavingChanges,
      canSaveChanges,
    ],
  );
}

/**
 * Returns the original {@link InlinePatientGridEditingState} for a given patient grid.
 * Original, in this context, means the state of the patient grid on the server,
 * converted to the local {@link InlinePatientGridEditingState} representation.
 */
function useOriginalPatientGridEditingState(patientGridId: string) {
  const originalColumnHiddenStatesSwr = useColumnHiddenStates(patientGridId);
  const originalFiltersSwr = useGetAllPatientGridFilters(patientGridId);
  return useMergedSwr<InlinePatientGridEditingState>(
    () => ({
      columnHiddenStates: originalColumnHiddenStatesSwr.data,
      filters: originalFiltersSwr.data.map((filter) => ({
        uuid: filter.uuid,
        name: filter.name,
        operand: filter.operand,
        // In the filter representation, "display" holds the column name.
        // This is potentially brittle (?). Should perhaps be improved, but this requires backend support.
        columnName: filter.column.display,
      })),
    }),
    [originalColumnHiddenStatesSwr, originalFiltersSwr],
  );
}

/**
 * For a given patient grid, returns a map of the columns' `hidden` states.
 * The map is keyed by the column names.
 */
function useColumnHiddenStates(patientGridId: string) {
  const patientGridSwr = useGetPatientGrid(patientGridId);
  const data = useMemo(() => {
    if (!patientGridSwr.data) {
      return undefined;
    }

    return patientGridSwr.data.columns.reduce<ColumnNameToHiddenStateMap>((acc, x) => {
      acc[x.name] = x.hidden ?? false;
      return acc;
    }, {});
  }, [patientGridSwr.data]);

  return {
    ...patientGridSwr,
    data,
  };
}

/**
 * The mutation submitting all accumulated, locally-edited changes to the patient grid.
 */
function useSubmitInlineChangesMutation(
  patientGridId: string,
  patientGrid: PatientGridGet,
  originalPatientGridState: InlinePatientGridEditingState,
  localPatientGridState: InlinePatientGridEditingState,
) {
  const { mutate: mutatePatientGrid } = useGetPatientGrid(patientGridId);
  const { mutate: mutateAllPatientGrids } = useGetAllPatientGrids();
  const { mutate: mutateAllPatientGridFilters } = useGetAllPatientGridFilters(patientGridId);
  const { columnHiddenStates, filters } = localPatientGridState;

  return useMutation(
    async () => {
      const requests: Array<Promise<unknown>> = [];

      // Cross-check the column hidden states. Every column that changed from the original must be updated.
      for (const column of patientGrid.columns) {
        if (originalPatientGridState.columnHiddenStates[column.name] !== columnHiddenStates[column.name]) {
          requests.push(postPatientGridColumn(patientGridId, column.uuid, { hidden: columnHiddenStates[column.name] }));
        }
      }

      // Filters. We have two tasks:
      // 1) Remove deleted filters.
      // 2) Create new filters.
      const deletedFilters = originalPatientGridState.filters.filter(
        (filter) =>
          !filters.some(
            (localFilter) => localFilter.columnName === filter.columnName && localFilter.operand === filter.operand,
          ),
      );

      const newFilters = filters.filter(
        (localFilter) =>
          !originalPatientGridState.filters.find(
            (originalFilter) =>
              originalFilter.columnName === localFilter.columnName && originalFilter.operand === localFilter.operand,
          ),
      );

      for (const filter of deletedFilters) {
        requests.push(deletePatientGridFilter(patientGridId, filter.uuid));
      }

      for (const filter of newFilters) {
        requests.push(
          postPatientGridFilter(patientGridId, {
            name: filter.name,
            column: patientGrid.columns.find((column) => column.name === filter.columnName)?.uuid,
            operand: filter.operand,
          }),
        );
      }

      await Promise.all(requests);
    },
    {
      onSettled() {
        Promise.allSettled([mutatePatientGrid(), mutateAllPatientGrids(), mutateAllPatientGridFilters]);
      },
    },
  );
}

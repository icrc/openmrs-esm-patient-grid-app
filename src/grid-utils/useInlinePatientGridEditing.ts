import { createContext, useMemo } from 'react';
import { useGetAllPatientGridFilters, useMergedSwr } from '../api';
import { ColumnNameToHiddenStateMap, useColumnHiddenStates } from '.';
import { UndoRedo, useUndoRedo } from './useUndoRedo';

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
}

export const InlinePatientGridEditingContext = createContext<InlinePatientGridEditingContextState>(null);

export function useInlinePatientGridEditingContextState(patientGridId: string): InlinePatientGridEditingContextState {
  const originalColumnHiddenStatesSwr = useColumnHiddenStates(patientGridId);
  const originalFiltersSwr = useGetAllPatientGridFilters(patientGridId);
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
      columnHiddenStates: current?.columnHiddenStates ?? original?.columnHiddenStates ?? {},
      filters: current?.filters ?? original?.filters ?? [],
    }),
    [canUndo, canRedo, current, undo, redo, push, clear, original],
  );
}

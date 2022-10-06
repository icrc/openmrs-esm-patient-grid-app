import { useMemo } from 'react';
import { ColumnNameToHiddenStateMap, useColumnHiddenStates } from '../grid-utils';
import { useUndoRedo } from './useUndoRedo';

export interface InlinePatientGridEditingState {
  columnHiddenStates: ColumnNameToHiddenStateMap;
}

export function useInlinePatientGridEditing(patientGridId: string) {
  const originalColumnHiddenStatesSwr = useColumnHiddenStates(patientGridId);
  const original = useMemo<InlinePatientGridEditingState>(
    () => ({
      columnHiddenStates: originalColumnHiddenStatesSwr.data,
    }),
    [originalColumnHiddenStatesSwr],
  );

  const undoRedoState = useUndoRedo<InlinePatientGridEditingState>();

  return {
    ...undoRedoState,
    original,
    columnHiddenStates: undoRedoState.current?.columnHiddenStates ?? original?.columnHiddenStates,
  };
}

import { useCallback, useState } from 'react';

interface InternalUndoRedoState<T> {
  undoStack: Array<T>;
  redoStack: Array<T>;
}

const initialState = {
  undoStack: [],
  redoStack: [],
};

export function useUndoRedo<T>() {
  const [state, setState] = useState<InternalUndoRedoState<T>>(initialState);

  const canUndo = state.undoStack.length > 0;
  const canRedo = state.redoStack.length > 0;
  const current = state.undoStack[state.undoStack.length - 1];

  const undo = useCallback(
    () =>
      setState((state) => ({
        redoStack: [...state.redoStack, state.undoStack[state.undoStack.length - 1]],
        undoStack: state.undoStack.slice(0, -1),
      })),
    [],
  );

  const redo = useCallback(
    () =>
      setState((state) => ({
        undoStack: [...state.undoStack, state.redoStack[state.redoStack.length - 1]],
        redoStack: state.redoStack.slice(0, -1),
      })),
    [],
  );

  const clear = useCallback(() => setState(initialState), []);

  const push = useCallback(
    (entry: T) =>
      setState((state) => ({
        undoStack: [...state.undoStack, entry],
        redoStack: [],
      })),
    [],
  );

  return {
    canUndo,
    canRedo,
    current,
    undo,
    redo,
    clear,
    push,
  };
}

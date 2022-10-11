import { useMemo } from 'react';
import { useGetPatientGrid } from '../api';

export type ColumnNameToHiddenStateMap = Record<string, boolean>;

/**
 * For a given patient grid, returns a map of the columns' `hidden` states.
 * The map is keyed by the column names.
 */
export function useColumnHiddenStates(patientGridId: string) {
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

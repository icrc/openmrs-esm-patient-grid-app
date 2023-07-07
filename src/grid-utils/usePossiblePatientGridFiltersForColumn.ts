import { SWRResponse } from 'swr';
import { useGetPatientGrid, useGetPatientGridReport, useMergedSwr } from '../api';
import { LocalFilter } from './useInlinePatientGridEditing';
import uniqBy from 'lodash-es/uniqBy';
import sortBy from 'lodash-es/sortBy';
import { formatDate } from '@openmrs/esm-framework';

export function usePossiblePatientGridFiltersForColumn(
  patientGridId: string,
  columnName: string,
): SWRResponse<Array<LocalFilter>> {
  const patientGridSwr = useGetPatientGrid(patientGridId);
  const reportSwr = useGetPatientGridReport(patientGridId);

  function isValidDate(date) {
    return date instanceof Date && !isNaN(date.getTime());
  }

  return useMergedSwr(
    () => {
      // const { data: patientGrid } = patientGridSwr;
      const { data: report } = reportSwr;

      const allColumnValues = report.report.map((row) => row[columnName]);
      const allFiltersFromRows = allColumnValues
        .map<LocalFilter>((columnValue) => {
          // Obs column with UUID.
          if (columnValue && typeof columnValue === 'object') {
            if (columnValue.value && typeof columnValue.value === 'object') {
              return {
                name: columnValue.value.display,
                display: columnValue.value.display,
                operand: columnValue.value.uuid,
                columnName,
              };
            } else {
              return {
                name: `${columnValue.value}`,
                display:
                  typeof columnValue.value === 'string' && isValidDate(new Date(columnValue.value))
                    ? formatDate(new Date(columnValue.value), { time: true })
                    : `${columnValue.value}`,
                operand: `${columnValue.value}`,
                columnName,
              };
            }
          } else if (columnValue !== null && columnValue !== undefined) {
            return {
              name: `${columnValue}`,
              display:
                typeof columnValue === 'string' && isValidDate(new Date(columnValue))
                  ? formatDate(new Date(columnValue), { time: true })
                  : `${columnValue}`,
              operand: `${columnValue}`,
              columnName,
            };
          } else {
            return undefined;
          }
        })
        .filter(Boolean);

      return sortBy(uniqBy(allFiltersFromRows, 'operand'), 'name');
    },
    [patientGridSwr, reportSwr],
    [columnName],
  );
}

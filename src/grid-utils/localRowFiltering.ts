import { PatientGridReportRowGet } from '../api';
import { LocalFilter } from './useInlinePatientGridEditing';

export function getLocallyFilteredReportRows(rows: Array<PatientGridReportRowGet>, filters: Array<LocalFilter>) {
  const localFilters = filters.filter((filter) => !('uuid' in filter));

  if (!localFilters.length) {
    return rows;
  }

  return rows.filter((row) =>
    localFilters.some((filter) => {
      const rowValue = row[filter.columnName];
      if (!rowValue) {
        return false;
      }

      if (typeof rowValue === 'object') {
        if (rowValue.value && typeof rowValue.value === 'object') {
          return rowValue.value.uuid === filter.operand;
        } else {
          return `${rowValue.value}` === filter.operand;
        }
      }

      return `${rowValue}` === filter.operand;
    }),
  );
}

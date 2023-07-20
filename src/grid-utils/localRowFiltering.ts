import { PatientGridReportRowGet } from '../api';
import { LocalFilter } from './useInlinePatientGridEditing';

export function getLocallyFilteredReportRows(rows: Array<PatientGridReportRowGet>, filters: Array<LocalFilter>) {
  const localFilters = filters?.filter((filter) => !('uuid' in filter)) || [];
  const filteredRows = [];
  if (!localFilters.length) {
    return rows;
  }

  localFilters.forEach((filter) => {
    const _rows = rows.filter((row) => {
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
    });
    filteredRows.push(..._rows);
  });

  return filteredRows;
}

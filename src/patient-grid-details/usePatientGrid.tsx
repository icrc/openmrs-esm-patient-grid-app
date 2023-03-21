import { GroupColumnDef } from '@tanstack/react-table';
import {
  useGetAllPrivilegeFilteredForms,
  useMergedSwr,
  PatientGridReportRowGet,
  useGetPatientGridReport,
  FormGet,
  FormSchema,
  PatientGridReportGet,
  useFormSchemasOfForms,
} from '../api';
import {
  getFormSchemaReferenceUuid,
  patientDetailsNameColumnName,
  patientDetailsCountryColumnName,
  patientDetailsStructureColumnName,
  patientDetailsGenderColumnName,
  patientDetailsAgeCategoryColumnName,
  useColumnNameToHeaderLabelMap,
  getReactTableColumnDefForForm,
  ColumnNameToHeaderLabelMap,
  getAllReportColumnNames,
  LocalFilter,
} from '../grid-utils';
import { TFunction, useTranslation } from 'react-i18next';
import { getLocallyFilteredReportRows } from '../grid-utils/localRowFiltering';
import { formatDate } from '@openmrs/esm-framework';

export interface PatientGridDataRow extends Record<string, unknown> {
  __report: PatientGridReportGet;
  __reportRow: PatientGridReportRowGet;
}

/**
 * The central hook fetching and manipulating the data that is required for rendering a patient grid.
 * @param id The ID of the patient grid report for which data should be returned.
 * @returns The columns and data to be forwarded to the `useReactTable` hook that renders the actual patient grid.
 */
export function usePatientGrid(id: string, filters: Array<LocalFilter>) {
  const { t } = useTranslation();
  const reportSwr = useGetPatientGridReport(id);
  const formsSwr = useGetAllPrivilegeFilteredForms();
  const formSchemasSwr = useFormSchemasOfForms(formsSwr.data);
  const columnNameToHeaderLabelMapSwr = useColumnNameToHeaderLabelMap();

  return useMergedSwr(
    () => {
      const { data: forms } = formsSwr;
      const { data: formSchemas } = formSchemasSwr;
      const { data: columnNameToHeaderLabelMap } = columnNameToHeaderLabelMapSwr;
      const { data: report } = reportSwr;
      const locallyFilteredReportRows = getLocallyFilteredReportRows(report.report, filters);
      const columns = getColumns(forms, formSchemas, columnNameToHeaderLabelMap, report, t);
      const data = mapReportEntriesToGridData(report, locallyFilteredReportRows);
      return { columns, data };
    },
    [formsSwr, formSchemasSwr, columnNameToHeaderLabelMapSwr, reportSwr],
    [t, filters],
  );
}

function getColumns(
  forms: Array<FormGet>,
  formSchemas: Record<string, FormSchema>,
  columnNameToHeaderLabelMap: ColumnNameToHeaderLabelMap,
  report: PatientGridReportGet,
  t: TFunction,
) {
  // The task of this memo is to filter out the columns that should actually be rendered in the grid.
  // This is done by comparing all *possibly renderable* columns to the patient grid report.
  // Each column that exists in the report is kept - all others are discarded.
  //
  // For determining whether a column should be displayed, we can grab any row from the report.
  // All rows have the same attributes. Any row is therefore okay for checking whether a column
  // should be displayed.
  const columnNamesToInclude = getAllReportColumnNames(report);
  const columns: Array<GroupColumnDef<PatientGridDataRow>> = [];

  // Step 1: Construct the patient details columns.
  // These are simply hardcoded, but should still only appear if they are present in the report.
  const patientDetailsColumn = {
    header: t('patientGridColumnHeaderPatientDetails', 'Healthcare user'),
    columns: [],
  };

  if (columnNamesToInclude.includes(patientDetailsNameColumnName)) {
    patientDetailsColumn.columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsNameColumnName],
      accessorKey: patientDetailsNameColumnName,
    });
  }

  if (columnNamesToInclude.includes(patientDetailsNameColumnName)) {
    patientDetailsColumn.columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsCountryColumnName],
      accessorKey: patientDetailsCountryColumnName,
    });
  }

  if (columnNamesToInclude.includes(patientDetailsNameColumnName)) {
    patientDetailsColumn.columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsStructureColumnName],
      accessorKey: patientDetailsStructureColumnName,
    });
  }

  if (columnNamesToInclude.includes(patientDetailsNameColumnName)) {
    patientDetailsColumn.columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsGenderColumnName],
      accessorKey: patientDetailsGenderColumnName,
    });
  }

  if (columnNamesToInclude.includes(patientDetailsNameColumnName)) {
    patientDetailsColumn.columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsAgeCategoryColumnName],
      accessorKey: patientDetailsAgeCategoryColumnName,
    });
  }

  if (patientDetailsColumn.columns.length) {
    columns.push(patientDetailsColumn);
  }

  // Step 2: Construct the form columns.
  // This is done by iterating through all forms (to generate/check all possible columns)
  // and then only adding those to the result set that actually appear in the report.
  for (const form of forms) {
    const formSchema = formSchemas[getFormSchemaReferenceUuid(form)];
    if (!formSchema) {
      continue;
    }

    const formColumn = getReactTableColumnDefForForm(
      form,
      formSchema,
      columnNameToHeaderLabelMap,
      columnNamesToInclude,
    );

    // Only add the entire form column if there is at least 1 section column.
    // Checking for length > 2 because there is *always* 2 columns (the "Age"/"Date" columns).
    if (formColumn.columns.length > 2) {
      columns.push(formColumn as unknown as GroupColumnDef<PatientGridDataRow>);
    }
  }

  return columns;
}

/**
 * Maps the results of a patient grid report to the shape expected by `react-table`.
 * Essentially converts `obs` to `strings`.
 */
function mapReportEntriesToGridData(report: PatientGridReportGet, reportRows: Array<PatientGridReportRowGet>) {
  return reportRows.map((reportRow) => {
    const result: PatientGridDataRow = {
      __report: report,
      __reportRow: reportRow,
    };

    for (const [key, reportRowCell] of Object.entries(reportRow)) {
      if (typeof reportRowCell === 'string') {
        // The cell is already a raw string.
        result[key] = reportRowCell;
      } else if (reportRowCell === null || reportRowCell === undefined) {
        // The cell is null/undefined. -> Use empty strings here to enable filtering/sorting.
        result[key] = '';
      } else if (typeof reportRowCell === 'object') {
        // The cell is an obs.
        result[key] = `${typeof reportRowCell.value === 'object' ? reportRowCell.value.display : reportRowCell.value}`;
      } else {
        // Anything else (e.g. numbers) is just optimistically converted to a string.
        result[key] = `${reportRowCell}`;
      }
      // TODO: What about other obs values? (Could there be UUIDs? Probably...)
      if (key.includes('formDate')) {
        result[key] = formatDate(new Date(reportRowCell.toString()), {
          time: true,
        });
      }
    }

    return result;
  });
}

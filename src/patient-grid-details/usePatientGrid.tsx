import { GroupColumnDef } from '@tanstack/react-table';
import {
  useFormSchemas,
  useGetAllPublishedPrivilegeFilteredForms,
  useMergedSwr,
  PatientGridReportColumnGet,
  useGetPatientGridReport,
  FormGet,
  FormSchema,
  PatientGridReportGet,
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
} from '../grid-utils';
import { TFunction, useTranslation } from 'react-i18next';

/**
 * The central hook fetching and manipulating the data that is required for rendering a patient grid.
 * @param id The ID of the patient grid report for which data should be returned.
 * @returns The columns and data to be forwarded to the `useReactTable` hook that renders the actual patient grid.
 */
export function usePatientGrid(id: string) {
  const { t } = useTranslation();
  const reportSwr = useGetPatientGridReport(id);
  const formsSwr = useGetAllPublishedPrivilegeFilteredForms();
  const formSchemasSwr = useFormSchemas(
    formsSwr.data?.map((form) => form.resources.find((resource) => resource.name === 'JSON schema').valueReference),
  );
  const columnNameToHeaderLabelMapSwr = useColumnNameToHeaderLabelMap();

  return useMergedSwr(
    () => {
      const { data: forms } = formsSwr;
      const { data: formSchemas } = formSchemasSwr;
      const { data: columnNameToHeaderLabelMap } = columnNameToHeaderLabelMapSwr;
      const { data: report } = reportSwr;
      const columns = getColumns(forms, formSchemas, columnNameToHeaderLabelMap, report, t);
      const data = mapReportEntriesToGridData(report.report);
      return { columns, data };
    },
    [formsSwr, formSchemasSwr, columnNameToHeaderLabelMapSwr, reportSwr],
    [t],
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
  const reportRow = report?.report?.[0] ?? {};
  const columnNamesToInclude = Object.keys(reportRow);
  const columns: Array<GroupColumnDef<unknown, unknown>> = [];

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
    // Checking for length > 1 because there is *always* 1 column (the "Date" column).
    if (formColumn.columns.length > 1) {
      columns.push(formColumn);
    }
  }

  return columns;
}

/**
/**
 * Maps the results of a patient grid report to the shape expected by `react-table`.
 * Essentially converts `obs` to `strings`.
 */
function mapReportEntriesToGridData(reportColumns: Array<PatientGridReportColumnGet>) {
  return reportColumns.map((column) => {
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(column)) {
      if (typeof value === 'string') {
        // The cell is already a raw string.
        result[key] = value;
      } else if (value === null || value === undefined) {
        // The cell is null/undefined. -> Use empty strings here to enable filtering/sorting.
        result[key] = '';
      } else if (typeof value === 'object') {
        // The cell is an obs.
        result[key] = `${value.value}`;
      } else {
        // Anything else (e.g. numbers) is just optimistically converted to a string.
        result[key] = `${value}`;
      }
      // TODO: What about other obs values? (Could there be UUIDs? Probably...)
    }

    return result;
  });
}

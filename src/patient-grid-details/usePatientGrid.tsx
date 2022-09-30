/* eslint-disable @typescript-eslint/no-explicit-any */
import { ColumnDef } from '@tanstack/react-table';
import { PatientGridReportColumnGet, PatientGridReportGet, useGetPatientGridReport } from '../api/patientGridReport';
import { FormSchema, useFormSchemas, useGetAllPublishedPrivilegeFilteredForms, useMergedSwr } from '../api';
import {
  getFormSchemaReferenceUuid,
  getFormSchemaQuestionColumnName,
  patientDetailsNameColumnName,
  patientDetailsCountryColumnName,
  patientDetailsStructureColumnName,
  patientDetailsGenderColumnName,
  patientDetailsAgeCategoryColumnName,
  getFormDateColumnName,
  getUnlabeledConceptIdentifiersFromSchema,
} from '../crosscutting-features';
import { useTranslation } from 'react-i18next';
import { useGetBulkConceptsByReferences } from '../api/concept';
import { useMemo } from 'react';

/**
 * The central hook fetching and manipulating the data that is required for rendering a patient grid.
 * @param id The ID of the patient grid report for which data should be returned.
 * @returns The columns and data to be forwarded to the `useReactTable` hook that renders the actual patient grid.
 */
export function usePatientGrid(id: string) {
  const reportSwr = useGetPatientGridReport(id);
  const columnsSwr = useColumns(reportSwr.data);
  return useMergedSwr(
    () => ({
      columns: columnsSwr.data,
      data: mapReportEntriesToGridData(reportSwr.data.report),
    }),
    [reportSwr, columnsSwr],
  );
}

/**
 * Generates the {@link ColumnDef} instances required for rendering the patient grid of a specific report.
 * Internally,
 * @param report The patient grid report for which the grid's columns should be generated.
 */
function useColumns(report?: PatientGridReportGet) {
  const { t } = useTranslation();
  const formsSwr = useGetAllPublishedPrivilegeFilteredForms();
  const formSchemasSwr = useFormSchemas(
    formsSwr.data?.map((form) => form.resources.find((resource) => resource.name === 'JSON schema').valueReference),
  );
  const formLabelConceptsSwr = useConceptLabelsOfFormSchemas(formSchemasSwr.data);

  return useMergedSwr(
    () => {
      const { data: forms } = formsSwr;
      const { data: formSchemas } = formSchemasSwr;
      const { data: formLabelConcepts } = formLabelConceptsSwr;

      // The task of this memo is to filter out the columns that should actually be rendered in the grid.
      // This is done by comparing all *possibly renderable* columns to the patient grid report.
      // Each column that exists in the report is kept - all others are discarded.
      //
      // For determining whether a column should be displayed, we can grab any row from the report.
      // All rows have the same attributes. Any row is therefore okay for checking whether a column
      // should be displayed.
      const reportRow = report?.report?.[0] ?? {};
      const columns: Array<ColumnDef<unknown, unknown>> = [];

      // Step 1: Construct the patient details columns.
      // These are simply hardcoded, but should still only appear if they actually appear in the report.
      const patientDetailsColumn = {
        header: t('patientGridColumnHeaderPatientDetails', 'Healthcare user'),
        columns: [],
      };

      if (patientDetailsNameColumnName in reportRow) {
        patientDetailsColumn.columns.push({
          header: t('patientGridColumnHeaderPatientName', 'Patient name'),
          accessorKey: patientDetailsNameColumnName,
        });
      }

      if (patientDetailsNameColumnName in reportRow) {
        patientDetailsColumn.columns.push({
          header: t('patientGridColumnHeaderCountry', 'Country'),
          accessorKey: patientDetailsCountryColumnName,
        });
      }

      if (patientDetailsNameColumnName in reportRow) {
        patientDetailsColumn.columns.push({
          header: t('patientGridColumnHeaderStructure', 'Structure'),
          accessorKey: patientDetailsStructureColumnName,
        });
      }

      if (patientDetailsNameColumnName in reportRow) {
        patientDetailsColumn.columns.push({
          header: t('patientGridColumnHeaderGender', 'Gender'),
          accessorKey: patientDetailsGenderColumnName,
        });
      }

      if (patientDetailsNameColumnName in reportRow) {
        patientDetailsColumn.columns.push({
          header: t('patientGridColumnHeaderAgeCategory', 'Age category'),
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

        const formColumn = {
          header: form.name,
          columns: [
            // Each form column group always has the "Date" column hard-coded.
            {
              header: t('patientGridColumnHeaderFormDate', 'Date'),
              accessorKey: getFormDateColumnName(form),
            },
          ],
        };

        for (const page of formSchema.pages ?? []) {
          for (const section of page.sections ?? []) {
            const sectionColumn: ColumnDef<any> = {
              header: section.label,
              columns: [],
            };

            for (const question of section.questions ?? []) {
              // It only makes sense to generate a question column if the corresponding question
              // is contained in the report.
              // Otherwise the column is skipped.
              const requiredColumnName = getFormSchemaQuestionColumnName(form, question);
              if (requiredColumnName in reportRow) {
                sectionColumn.columns.push({
                  // Questions may be localized via concept labels.
                  // Those are already prefetched, but if they don't exist, fallback to values inside the schema itself
                  // to display *something*.
                  header: formLabelConcepts[question.questionOptions.concept]?.display ?? question.label ?? question.id,
                  accessorKey: getFormSchemaQuestionColumnName(form, question),
                });
              }
            }

            // Only add the column for this specific section if there's at least 1 question column.
            if (sectionColumn.columns.length) {
              formColumn.columns.push(sectionColumn as any);
            }
          }
        }

        // Only add the entire form column if there is at least 1 section column.
        // Checking for length > 1 because there is *always* 1 column (the "Date" column).
        if (formColumn.columns.length > 1) {
          columns.push(formColumn);
        }
      }

      return columns;
    },
    [formsSwr, formSchemasSwr, formLabelConceptsSwr],
    [t, report],
  );
}

/**
 * Given a set of multiple form schemas, returns the flattened concept labels of all referenced
 * concepts inside that form schema.
 * @param formSchemas A lookup of the form schemas. This structure is returned by {@link useFormSchemas}.
 */
function useConceptLabelsOfFormSchemas(formSchemas: Record<string, FormSchema> = {}) {
  const formLabelConceptIds = useMemo(
    () =>
      Object.values(formSchemas ?? {}).flatMap((formSchema) => getUnlabeledConceptIdentifiersFromSchema(formSchema)),
    [formSchemas],
  );
  return useGetBulkConceptsByReferences(formLabelConceptIds);
}

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
        result[key] = value.value;
      } else {
        // Anything else (e.g. numbers) is just optimistically converted to a string.
        result[key] = `${value}`;
      }
    }

    return result;
  });
}
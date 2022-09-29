/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { useParams } from 'react-router-dom';
import { PatientGridDetailsParams } from '../routes';
import { PatientGridReportGet, useGetPatientGridReport } from '../api/patientGridReport';
import { useFormSchemas, useGetAllPublishedPrivilegeFilteredForms } from '../api';
import {
  getFormSchemaReferenceUuid,
  getFormSchemaQuestionColumnName,
  patientDetailsNameColumnName,
  patientDetailsCountryColumnName,
  patientDetailsStructureColumnName,
  patientDetailsGenderColumnName,
  patientDetailsAgeCategoryColumnName,
  getFormDateColumnName,
} from '../crosscutting-features';
import { useTranslation } from 'react-i18next';

export function usePatientGrid() {
  const { id } = useParams<PatientGridDetailsParams>();
  const { data: report } = useGetPatientGridReport(id);
  const columns = useColumns(report);
  return { columns, data: report?.report };
}

export function useColumns(report?: PatientGridReportGet) {
  const { t } = useTranslation();
  const { data: forms } = useGetAllPublishedPrivilegeFilteredForms();
  const { data: formSchemas } = useFormSchemas(
    forms?.map((form) => form.resources.find((resource) => resource.name === 'JSON schema').valueReference),
  );

  return useMemo(() => {
    if (!report || !forms || !formSchemas) {
      return undefined;
    }

    // The task of this memo is to filter out the columns that should actually be rendered in the grid.
    // This is done by comparing all *possibly renderable* columns to the patient grid report.
    // Each column that exists in the report is kept - all others are discarded.
    //
    // For determining whether a column should be displayed, we can grab any row from the report.
    // All rows have the same attributes. Any row is therefore okay for checking whether a column
    // should be displayed.
    const reportRow = report?.report?.[0] ?? {};
    const columns: Array<ColumnDef<any>> = [];

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
                header: question.label ?? question.id, // TODO: i18n via form schema labels.
                accessorKey: question.id,
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
  }, [report, forms, formSchemas, t]);
}

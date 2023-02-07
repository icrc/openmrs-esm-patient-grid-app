import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { SWRResponse } from 'swr';
import {
  useGetAllPublishedPrivilegeFilteredForms,
  useGetBulkConceptsByReferences,
  useMergedSwr,
  useFormSchemasOfForms,
} from '../api';
import {
  patientDetailsNameColumnName,
  patientDetailsCountryColumnName,
  patientDetailsStructureColumnName,
  patientDetailsGenderColumnName,
  patientDetailsAgeCategoryColumnName,
  getFormDateColumnName,
  getFormSchemaQuestionColumnName,
  getFormAgeColumnName,
  patientDetailsPeriodColumnName,
} from './columnNames';
import {
  getUnlabeledConceptIdentifiersFromSchema,
  getFormSchemaReferenceUuid,
  getFormSchemaQuestionsMappableToColumns,
} from './formSchema';

/**
 * A dictionary which maps the unique name of a patient grid column resource to a display string
 * which is the column header/label that should be displayed to the user in the UI.
 *
 * This map is not guaranteed to be exhaustive. It can happen that a column's name is not contained.
 * (For example, if the column's display name is supposed to be retrieved via a concept referenced
 * by a form schema, but that concept doesn't exist.) In such cases, a fallback must be manually
 * provided.
 */
export type ColumnNameToHeaderLabelMap = Record<string, string>;

/**
 * Returns a map which allows to easy retrieval of the patient grid column labels that should be displayed to the user.
 * The map is keyed by the unique name of the column.
 * The map is supposed to contain labels for all columns which:
 * 1. Are hard-coded inside this module (e.g. all patient detail columns, see, for example, {@link patientDetailsNameColumnName}).
 * 2. Are created from a form schema question that has a concept label defined.
 *
 * It can happen that this map doesn't contain a label for a column name, e.g. when a concept label doesn't exist
 * in the backend. In such cases, a fallback must be manually provided by the user.
 * @returns A map which maps unique column names to the labels that should be displayed to the user.
 */
export function useColumnNameToHeaderLabelMap(): SWRResponse<ColumnNameToHeaderLabelMap> {
  const { t } = useTranslation();
  const formsSwr = useGetAllPublishedPrivilegeFilteredForms();
  const formSchemasSwr = useFormSchemasOfForms(formsSwr.data);
  const formLabelConceptIds = useMemo(
    () =>
      Object.values(formSchemasSwr.data ?? {}).flatMap((formSchema) =>
        getUnlabeledConceptIdentifiersFromSchema(formSchema),
      ),
    [formSchemasSwr.data],
  );
  const formLabelConceptsSwr = useGetBulkConceptsByReferences(formLabelConceptIds);

  return useMergedSwr(
    () => {
      const { data: forms } = formsSwr;
      const { data: formSchemas } = formSchemasSwr;
      const { data: formLabelConcepts } = formLabelConceptsSwr;
      const result: ColumnNameToHeaderLabelMap = {
        // Hardcoded names which always have the same key.
        [patientDetailsNameColumnName]: t('patientGridColumnHeaderPatientName', 'Patient name'),
        [patientDetailsCountryColumnName]: t('patientGridColumnHeaderCountry', 'Country'),
        [patientDetailsStructureColumnName]: t('patientGridColumnHeaderStructure', 'Structure'),
        [patientDetailsGenderColumnName]: t('patientGridColumnHeaderGender', 'Gender'),
        [patientDetailsAgeCategoryColumnName]: t('patientGridColumnHeaderAgeCategory', 'Age category'),
        [patientDetailsPeriodColumnName]: t('patientGridColumnHeaderPeriod', 'Period'),
      };

      for (const form of forms) {
        const formSchema = formSchemas[getFormSchemaReferenceUuid(form)];
        if (!formSchema) {
          continue;
        }

        // Each form column group always has the "Age"/"Date" columns.
        result[getFormAgeColumnName(form)] = t('patientGridColumnHeaderFormAge', 'Age');
        result[getFormDateColumnName(form)] = t('patientGridColumnHeaderFormDate', 'Date');

        // Each question column might have a header coming from concept labels.
        const formQuestions = getFormSchemaQuestionsMappableToColumns(form, formSchema);
        for (const { question } of formQuestions) {
          const columnName = getFormSchemaQuestionColumnName(form, question);
          const conceptLabel = formLabelConcepts[question.questionOptions?.concept]?.display;

          if (conceptLabel) {
            result[columnName] = conceptLabel;
          }
        }
      }

      return result;
    },
    [formsSwr, formSchemasSwr, formLabelConceptsSwr],
    [t],
  );
}

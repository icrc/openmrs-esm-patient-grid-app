import { FormGet, FormSchemaQuestion } from '../api';

// Column names which are hardcoded. Those do not come from any dynamic data source (e.g. forms),
// but are always "manually" created by this module.
export const patientDetailsNameColumnName = 'patientDetails-name';
export const patientDetailsCountryColumnName = 'patientDetails-country';
export const patientDetailsStructureColumnName = 'patientDetails-structure';
export const patientDetailsGenderColumnName = 'patientDetails-Gender';
export const patientDetailsAgeCategoryColumnName = 'patientDetails-ageCategory';

/**
 * Returns a unique patient grid column name for a given form schema question.
 */
export function getFormSchemaQuestionColumnName(form: FormGet, question: FormSchemaQuestion) {
  return `formQuestion-${form.uuid}-${question.id}`;
}

/**
 * Given a column created by {@link getFormSchemaQuestionColumnName}, extracts the form UUID
 * which is included in that name. Returns `undefined` if the name is invalid/without form UUID.
 *
 * This is introduced as a workaround to be able to edit cells without an encounter reference in a report.
 */
export function extractFormUuidFromFormSchemaQuestionColumnName(columnName: string) {
  return columnName.split('-')[1];
}

/**
 * Returns whether the given column name is a column for a question of the form with the given ID.
 *
 * This is introduced as a workaround to be able to edit cells without an encounter reference in a report.
 */
export function isFormSchemaQuestionColumnNameForForm(columnName: string, formId: string) {
  return columnName.startsWith(`formQuestion-${formId}`);
}

export function isFormSchemaQuestionColumnName(columnName: string) {
  return columnName.startsWith('formQuestion-');
}

/**
 * Returns a unique patient grid column name for a form's "Date" column.
 */
export function getFormDateColumnName(form: FormGet) {
  return `form-${form.uuid}-formDate`;
}

export function getFormAgeColumnName(form: FormGet) {
  return `form-${form.uuid}-age`;
}

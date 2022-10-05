import { FormGet, FormSchemaQuestion } from '../api';

// Column names which are hardcoded. Those do not come from any dynamic data source (e.g. forms),
// but are always "manually" created by this module.
export const patientDetailsNameColumnName = 'patientDetails__name';
export const patientDetailsCountryColumnName = 'patientDetails__country';
export const patientDetailsStructureColumnName = 'patientDetails__structure';
export const patientDetailsGenderColumnName = 'patientDetails__Gender';
export const patientDetailsAgeCategoryColumnName = 'patientDetails__ageCategory';

/**
 * Returns a unique patient grid column name for a given form schema question.
 */
export function getFormSchemaQuestionColumnName(form: FormGet, question: FormSchemaQuestion) {
  return `formQuestion__${form.uuid}__${question.id}`;
}

/**
 * Given a column created by {@link getFormSchemaQuestionColumnName}, extracts the form UUID
 * which is included in that name. Returns `undefined` if the name is invalid/without form UUID.
 *
 * This is introduced as a workaround to be able to edit cells without an encounter reference in a report.
 */
export function extractFormUuidFromFormSchemaQuestionColumnName(columnName: string) {
  return columnName.split('__')[1];
}

/**
 * Returns whether the given column name is a column for a question of the form with the given ID.
 *
 * This is introduced as a workaround to be able to edit cells without an encounter reference in a report.
 */
export function isFormSchemaQuestionColumnNameForForm(columnName: string, formId: string) {
  return columnName.startsWith(`formQuestion__${formId}`);
}

export function isFormSchemaQuestionColumnName(columnName: string) {
  return columnName.startsWith('formQuestion__');
}

/**
 * Returns a unique patient grid column name for a form's "Date" column.
 */
export function getFormDateColumnName(form: FormGet) {
  return `form__${form.uuid}__formDate`;
}

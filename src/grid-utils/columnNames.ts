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
 * Returns a unique patient grid column name for a form's "Date" column.
 */
export function getFormDateColumnName(form: FormGet) {
  return `form__${form.uuid}__formDate`;
}

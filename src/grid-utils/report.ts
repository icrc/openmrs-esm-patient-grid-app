import { FormGet, FormSchema, PatientGridReportGet } from '../api';
import { getFormSchemaQuestionColumnName } from './columnNames';
import { getFormSchemaQuestionsMappableToColumns, getFormSchemaReferenceUuid } from './formSchema';

/**
 * Returns all unique column names of the given report.
 * @param report The report whose unique column names should be returned.
 */
export function getAllReportColumnNames(report: PatientGridReportGet) {
  // A report has the same names in each row. Picking any one of them yields the same results.
  const referenceRow = report.report?.[0] ?? {};
  return Object.keys(referenceRow);
}

/**
 * From the given {@link forms}, returns those forms that are referenced by the given {@link report}.
 * As soon as the report has an entry for even one question of the given form, that form is returned.
 * @param report The report which references forms.
 * @param forms The list of known forms.
 * @param formSchemas The list of known form schemas.
 */
export function getFormsReferencedInGridReport(
  report: PatientGridReportGet,
  forms: Array<FormGet>,
  formSchemas: Record<string, FormSchema>,
) {
  const reportColumns = getAllReportColumnNames(report);
  return forms.filter((form) => {
    const formSchema = formSchemas[getFormSchemaReferenceUuid(form)];
    if (!formSchema) {
      return false;
    }

    const relevantQuestions = getFormSchemaQuestionsMappableToColumns(form, formSchema);
    return relevantQuestions.some(({ question }) =>
      reportColumns.includes(getFormSchemaQuestionColumnName(form, question)),
    );
  });
}

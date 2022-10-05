import { PatientGridReportObsGet, PatientGridReportRowGet } from '../api';
import { extractFormUuidFromFormSchemaQuestionColumnName, isFormSchemaQuestionColumnNameForForm } from './columnNames';

export function getFormEngineDataRequiredForEditing(reportRow: PatientGridReportRowGet, columnNameToEdit: string) {
  const formId = extractFormUuidFromFormSchemaQuestionColumnName(columnNameToEdit);
  const rowValue = reportRow[columnNameToEdit];
  let matchingObs: PatientGridReportObsGet | undefined = typeof rowValue === 'object' ? rowValue : undefined;

  // If there was no obs for that given question, we don't have any information about what encounter we're dealing with.
  // This requires a workaround:
  // Given the form UUID, we try to find another question of the same form inside the report row.
  // If such a question exists, we can grab its encounter (because it is the same one of the current column).
  if (!matchingObs) {
    matchingObs = Object.entries(reportRow).find(
      ([otherColumnName, value]) =>
        isFormSchemaQuestionColumnNameForForm(otherColumnName, formId) && value && typeof value === 'object',
    )?.[1] as PatientGridReportObsGet | undefined;
  }

  return {
    encounterId: matchingObs?.encounter.uuid,
    formId: formId,
    patientId: reportRow.uuid,
  };
}

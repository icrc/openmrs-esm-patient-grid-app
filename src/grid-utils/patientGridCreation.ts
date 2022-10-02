import { PatientGridColumnPost, FormGet, FormSchema } from '../api';
import {
  patientDetailsNameColumnName,
  patientDetailsCountryColumnName,
  patientDetailsStructureColumnName,
  patientDetailsGenderColumnName,
  patientDetailsAgeCategoryColumnName,
  getFormSchemaQuestionColumnName,
} from './columnNames';
import { getFormSchemaReferenceUuid, getFormSchemaQuestionsMappableToColumns } from './formSchema';

/**
 * Returns the {@link PatientGridColumnPost} resources for the hardcoded patient details grid sections.
 */
export function getPatientDetailsPatientGridColumnPostResources(): Array<PatientGridColumnPost> {
  return [
    {
      name: patientDetailsNameColumnName,
      type: 'column',
      datatype: 'NAME',
    },
    {
      name: patientDetailsCountryColumnName,
      type: 'column',
      datatype: 'DATAFILTER_LOCATION',
    },
    {
      name: patientDetailsStructureColumnName,
      type: 'column',
      datatype: 'DATAFILTER_LOCATION',
    },
    {
      name: patientDetailsGenderColumnName,
      type: 'column',
      datatype: 'GENDER',
    },
    {
      name: patientDetailsAgeCategoryColumnName,
      type: 'agecolumn',
      datatype: 'ENC_AGE',
      encounterType: '0c63150d-ff39-42e1-9048-834mh76p2s72', // TODO: Use encounter type from form.
      convertToAgeRange: false, // TODO: Decide on true/false.
      filters: [
        // TODO: Remove
        {
          name: 'equal 12',
          operand: '12',
        },
      ],
    },
  ];
}

/**
 * Given a set of forms (selected by the user in the create patient grid wizard) and their associated schemas,
 * converts those form's questions into {@link PatientGridColumnPost} resources that should be sent with
 * the patient grid resource that is being created.
 */
export function getPatientGridColumnPostResourcesForForms(
  forms: Array<FormGet>,
  formSchemas: Record<string, FormSchema>,
): Array<PatientGridColumnPost> {
  return forms.flatMap((form) => {
    const schemaId = getFormSchemaReferenceUuid(form);
    const formSchema = formSchemas[schemaId];
    if (!formSchema) {
      return [];
    }

    // TODO: Each form needs an "encounterDatetime" column *if* there is a question of type "encounterDatetime"
    // inside the form schema. That column should be added exactly here.
    // Right now this is not supported by the backend, hence this TODO.

    const questionInfoMappableToColumns = getFormSchemaQuestionsMappableToColumns(form, formSchema);
    return questionInfoMappableToColumns.map(({ question, form }) => ({
      name: getFormSchemaQuestionColumnName(form, question),
      type: 'obscolumn',
      datatype: 'OBS',
      concept: question.questionOptions.concept,
      encounterType: form.encounterType.uuid,
    }));
  });
}

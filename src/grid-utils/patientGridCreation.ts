import { PatientGridColumnPost, FormGet, FormSchema, PatientGridFilterPost } from '../api';
import {
  patientDetailsNameColumnName,
  patientDetailsCountryColumnName,
  patientDetailsStructureColumnName,
  patientDetailsGenderColumnName,
  patientDetailsAgeCategoryColumnName,
  getFormSchemaQuestionColumnName,
  getFormAgeColumnName,
  getFormDateColumnName,
  patientDetailsPeriodColumnName,
} from './columnNames';
import { getFormSchemaReferenceUuid, getFormSchemaQuestionsMappableToColumns } from './formSchema';

/**
 * Returns the {@link PatientGridColumnPost} resources for the hardcoded patient details grid sections.
 */
export function getPatientDetailsPatientGridColumnPostResources(
  ageCategoryEncounterType: string,
  countryFilter?: Array<PatientGridFilterPost>,
  structureFilter?: Array<PatientGridFilterPost>,
  genderFilter?: Array<PatientGridFilterPost>,
  ageCategoryFilters?: Array<PatientGridFilterPost>,
  periodFilter?: Array<PatientGridFilterPost>,
): Array<PatientGridColumnPost> {
  return [
    {
      name: patientDetailsNameColumnName,
      type: 'column',
      datatype: 'NAME',
    },
    {
      name: patientDetailsCountryColumnName,
      type: 'column',
      datatype: 'DATAFILTER_COUNTRY',
      filters: countryFilter,
    },
    {
      name: patientDetailsStructureColumnName,
      type: 'column',
      datatype: 'DATAFILTER_LOCATION',
      filters: structureFilter,
    },
    {
      name: patientDetailsGenderColumnName,
      type: 'column',
      datatype: 'GENDER',
      filters: genderFilter,
    },
    {
      name: patientDetailsAgeCategoryColumnName,
      type: 'agecolumn',
      datatype: 'ENC_AGE',
      encounterType: ageCategoryEncounterType,
      convertToAgeRange: true,
      filters: ageCategoryFilters,
    },
    {
      name: patientDetailsPeriodColumnName,
      type: 'encounterdatecolumn',
      datatype: 'ENC_DATE',
      encounterType: ageCategoryEncounterType,
      filters: periodFilter,
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

    const specialColumns: Array<PatientGridColumnPost> = [
      // TODO: Uncomment once it exists on the BE.
      {
        name: getFormDateColumnName(form),
        type: 'encounterdatecolumn',
        datatype: 'ENC_DATE',
        encounterType: form.encounterType.uuid,
      },
      {
        name: getFormAgeColumnName(form),
        type: 'agecolumn',
        datatype: 'ENC_AGE',
        encounterType: form.encounterType.uuid,
        convertToAgeRange: false,
      },
    ];

    const questionInfoMappableToColumns = getFormSchemaQuestionsMappableToColumns(form, formSchema);
    const formQuestionColumns = questionInfoMappableToColumns.map<PatientGridColumnPost>(({ question, form }) => ({
      name: getFormSchemaQuestionColumnName(form, question),
      type: 'obscolumn',
      datatype: 'OBS',
      concept: question.questionOptions.concept,
      encounterType: form.encounterType.uuid,
    }));

    return formQuestionColumns.length ? [...specialColumns, ...formQuestionColumns] : [];
  });
}

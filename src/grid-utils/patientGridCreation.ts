import { PatientGridColumnPost, FormGet, FormSchema, PatientGridFilterPost } from '../api';
import {
  patientDetailsNameColumnName,
  patientDetailsLegacyIdColumnName,
  patientDetailsCountryColumnName,
  patientDetailsStructureColumnName,
  patientDetailsGenderColumnName,
  patientDetailsAgeCategoryColumnName,
  getFormSchemaQuestionColumnName,
  getFormAgeColumnName,
  getFormDateColumnName,
} from './columnNames';
import { getFormSchemaReferenceUuid, getFormSchemaQuestionsMappableToColumns } from './formSchema';
import { GridFormConfig } from '../config-schema';

/**
 * Returns the {@link PatientGridColumnPost} resources for the hardcoded patient details grid sections.
 */
export function getPatientDetailsPatientGridColumnPostResources(
  ageCategoryEncounterType: string,
  countryFilter?: Array<PatientGridFilterPost>,
  structureFilter?: Array<PatientGridFilterPost>,
  genderFilter?: Array<PatientGridFilterPost>,
  ageCategoryFilters?: Array<PatientGridFilterPost>,
): Array<PatientGridColumnPost> {
  return [
    {
      name: patientDetailsNameColumnName,
      type: 'column',
      datatype: 'NAME',
    },
    {
      name: patientDetailsLegacyIdColumnName,
      type: 'column',
      datatype: 'LEGACY_ID',
    },
    {
      name: patientDetailsCountryColumnName,
      type: 'column',
      datatype: 'ENC_COUNTRY',
      filters: countryFilter,
    },
    {
      name: patientDetailsStructureColumnName,
      type: 'column',
      datatype: 'ENC_LOCATION',
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
  periodFilter?: Array<PatientGridFilterPost>,
  gridFormConfig?: Array<GridFormConfig>,
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
        filters: periodFilter,
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
    const formQuestionColumns = questionInfoMappableToColumns.map<PatientGridColumnPost>(({ question, form }) => {
      const formConfig = gridFormConfig.find((f) => f.formUuid === form.uuid);
      return {
        name: getFormSchemaQuestionColumnName(form, question),
        type: 'obscolumn',
        datatype: 'OBS',
        concept: question.questionOptions.concept,
        encounterType: form.encounterType.uuid,
        hidden: new Set(formConfig.defaultHiddenQuestionIds).has(question.id),
      };
    });

    return formQuestionColumns.length ? [...specialColumns, ...formQuestionColumns] : [];
  });
}

import {
  FormGet,
  FormSchema,
  FormSchemaPage,
  FormSchemaQuestion,
  FormSchemaSection,
  PatientGridColumnPost,
} from '../api';

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

/**
 * Given a form, resolves the UUID of a potentially referenced form schema (clobdata) resource.
 */
export function getFormSchemaReferenceUuid(form: FormGet) {
  return form.resources?.find((resource) => resource.name === 'JSON schema')?.valueReference;
}

/**
 * Given a form and its associated schema, extracts all questions which are mappable to a column
 * inside the patient grid, along with all the data that is associated with the question
 * (e.g. its parent section, its parent page, ...).
 * The results can then be mapped to columns during the creation of a patient grid or alternatively
 * used for knowing which columns can be rendered.
 */
export function getFormSchemaQuestionsMappableToColumns(form: FormGet, formSchema: FormSchema) {
  const results: Array<{
    form: FormGet;
    formSchema: FormSchema;
    page: FormSchemaPage;
    section: FormSchemaSection;
    question: FormSchemaQuestion;
  }> = [];

  for (const page of formSchema.pages ?? []) {
    for (const section of page.sections ?? []) {
      for (const question of section.questions ?? []) {
        if (question.type === 'obs' && question.questionOptions.concept && form.encounterType?.uuid) {
          results.push({ form, formSchema, page, section, question });
        }
      }
    }
  }

  return results;
}

/**
 * Returns the {@link PatientGridColumnPost} resources for the special patient details grid sections.
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

/**
 * Returns the UUIDs of concepts that can be extracted from the form schema for the purpose of i18n.
 * This is borrowed from https://github.com/openmrs/openmrs-esm-patient-chart/blob/a29fed2bad3ea6c10f0b2dd4f154e5f558c56d11/packages/esm-form-entry-app/src/app/form-schema/form-schema.service.ts#L182
 * @param formSchema The form schema for which the concepts should be extracted.
 */
export function getUnlabeledConceptIdentifiersFromSchema(formSchema: FormSchema): Array<string> {
  const results = new Set<string>();
  const walkQuestions = (questions: Array<FormSchemaQuestion>) => {
    for (const question of questions) {
      if (typeof question.concept === 'string') {
        results.add(question.concept);
      }

      if (typeof question.questionOptions?.concept === 'string') {
        results.add(question.questionOptions.concept);
      }

      for (const answer of question.questionOptions?.answers ?? []) {
        if (typeof answer.concept === 'string') {
          results.add(answer.concept);
        }
      }

      if (Array.isArray(question.questions)) {
        walkQuestions(question.questions);
      }
    }
  };

  for (const page of formSchema.pages ?? []) {
    for (const section of page.sections ?? []) {
      walkQuestions(section.questions ?? []);
    }
  }

  return [...results];
}

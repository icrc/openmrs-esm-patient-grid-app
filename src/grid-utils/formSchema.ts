import { FormGet, FormSchema, FormSchemaPage, FormSchemaSection, FormSchemaQuestion } from '../api';

/**
 * Given a form, resolves the UUID of a referenced form schema (clobdata) resource (if one exists - returns
 * `undefined` otherwise).
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

  function extractQuestions(page, section, questions) {
    for (const question of questions ?? []) {
      if (question.type === 'obs' && question.questionOptions.concept) {
        results.push({ form, formSchema, page, section, question });
      } else if (question.questions) {
        extractQuestions(page, section, question.questions);
      }
    }
  }

  for (const page of formSchema.pages ?? []) {
    for (const section of page.sections ?? []) {
      extractQuestions(page, section, section.questions);
    }
  }

  return results;
}

/**
 * Returns the UUIDs of concepts that can be extracted from the form schema for the purpose of i18n.
 * This is borrowed from https://github.com/openmrs/openmrs-esm-patient-chart/blob/a29fed2bad3ea6c10f0b2dd4f154e5f558c56d11/packages/esm-form-entry-app/src/app/form-schema/form-schema.service.ts#L182
 * @param formSchema The form schema for which the concepts should be extracted.
 */
export function getUnlabeledConceptIdentifiersFromSchema(formSchema: FormSchema): Array<string> {
  const results = new Set<string>();
  const walkQuestions = (questions: Array<FormSchemaQuestion>) => {
    for (const question of questions ?? []) {
      if (question.questions) {
        walkQuestions(question.questions);
      }

      if (typeof question.questionOptions?.concept === 'string') {
        results.add(question.questionOptions.concept);
      }

      for (const answer of question.questionOptions?.answers ?? []) {
        if (typeof answer.concept === 'string') {
          results.add(answer.concept);
        }
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

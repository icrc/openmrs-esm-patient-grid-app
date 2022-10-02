import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { getFormSchemaReferenceUuid } from '../grid-utils';
import { FormGet } from './form';

// This file, among other things, defines the types of the various form schema parts.
// The documentation may be helpful in that context: https://ampath-forms.vercel.app/docs/core-concepts/forms
//
// It is not exactly clear or documented which of the type's attributes are optional.
// Type annotations are, in that regard, best guesses and inferred from sample API responses.
//
// Also: Not all of these attributes here are needed for the patient-grid feature.
// They are still defined for completion's sake.

export interface FormSchema extends OpenmrsResource {
  name: string;
  processor: string;
  pages?: Array<FormSchemaPage>;
  description?: string;
  encounter?: string;
  version?: string;
  published?: boolean;
  retired?: boolean;
}

export interface FormSchemaPage {
  label: string;
  sections?: Array<FormSchemaSection>;
}

export interface FormSchemaSection {
  label: string;
  isExpanded: boolean;
  questions?: Array<FormSchemaQuestion>;
}

export interface FormSchemaQuestion {
  id: string;
  label: string;
  type: string;
  questionOptions: QuestionOption;
  questionInfo?: string;
  questions?: Array<FormSchemaQuestion>;
  required?: boolean;
  hide?: boolean;
}

export interface QuestionOption {
  rendering: string;
  concept?: string;
  answers?: Array<QuestionOptionAnswer>;
}

export interface QuestionOptionAnswer {
  label: string;
  concept: string;
}

export function getFormSchema(id: string) {
  return openmrsFetch<FormSchema>(`/ws/rest/v1/clobdata/${id}`).then(({ data }) => data);
}

/**
 * Fetches multiple form schemas in parallel, by the UUID of the requested IDs.
 * @param ids The IDs of the form schemas to be fetched (this is the `valueReference` in the form's resources).
 * @returns A record containing the form schemas, keyed by their respective UUID.
 */
export async function getFormSchemas(ids: Array<string>) {
  const schemas = await Promise.all(ids.map((id) => getFormSchema(id).then((schema) => ({ id, schema }))));
  return schemas.reduce<Record<string, FormSchema>>((acc, { id, schema }) => {
    acc[id] = schema;
    return acc;
  }, {});
}

export function useFormSchemas(ids?: Array<string>) {
  const keyProvider = () => (ids ? `formSchemas/${[...ids].sort().join(',')}` : null);
  return useSWR(keyProvider, () => getFormSchemas(ids));
}

export function useFormSchemasOfForms(forms?: Array<FormGet>) {
  return useFormSchemas(forms?.map((form) => getFormSchemaReferenceUuid(form)).filter(Boolean));
}

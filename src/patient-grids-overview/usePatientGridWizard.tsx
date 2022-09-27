import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import {
  GenderRepresentation,
  FormGet,
  FormSchema,
  getFormSchemas,
  PatientGridColumnPost,
  PatientGridPost,
} from '../api';
import { PatientGridBuilderDetailsPage } from './PatientGridBuilderDetailsPage';
import { PatientGridBuilderFiltersPage } from './PatientGridBuilderFiltersPage';
import { PatientGridBuilderSectionsPage } from './PatientGridBuilderSectionsPage';

export interface PatientGridWizardState {
  name?: string;
  description?: string;
  countryLocationId?: string;
  structureLocationId?: string;
  gender?: GenderRepresentation;
  generatePatientDetailsColumns: boolean;
  selectedForms: Array<FormGet>;
}

export interface WizardPageProps {
  state: PatientGridWizardState;
  setState: Dispatch<SetStateAction<PatientGridWizardState>>;
  page: number;
  pages: number;
  goToNext(): void;
  goToPrevious(): void;
}

const initialWizardState: PatientGridWizardState = {
  generatePatientDetailsColumns: true,
  selectedForms: [],
};

export function usePatientGridWizard() {
  const [state, setState] = useState<PatientGridWizardState>(initialWizardState);
  const [page, setPage] = useState(0);
  const pageFactories = useMemo(
    () => [
      (props: WizardPageProps) => <PatientGridBuilderDetailsPage {...props} />,
      (props: WizardPageProps) => <PatientGridBuilderSectionsPage {...props} />,
      (props: WizardPageProps) => <PatientGridBuilderFiltersPage {...props} />,
    ],
    [],
  );

  const currentPage = useMemo(
    () =>
      pageFactories[page]({
        state,
        setState,
        page,
        pages: pageFactories.length,
        goToNext() {
          setPage((page) => page + 1);
        },
        goToPrevious() {
          setPage((page) => page - 1);
        },
      }),
    [state, page, pageFactories],
  );

  const isStateValidForSubmission = useMemo(() => {
    // TODO: This should return whether "state" can be sent to the backend.
    // -> Should return false if, for example, values are missing.
    // -> Might potentially be covered via validation inside the respective pages. Let's keep it for now though.
    return true;
  }, []);

  const createPostBody = useCallback(() => createPostBodyFromWizardState(state), [state]);

  return {
    currentPage,
    state,
    isStateValidForSubmission,
    createPostBody,
    page,
    isAtLastPage: page === pageFactories.length - 1,
  };
}

export async function createPostBodyFromWizardState(input: PatientGridWizardState) {
  const formSchemas = await getFormSchemas(
    input.selectedForms.map(
      (form) => form.resources.find((resource) => resource.name === 'JSON schema').valueReference,
    ),
  );

  const body: PatientGridPost = {
    name: input.name,
    description: input.description,
    owner: undefined, // TODO: Should this be the current owner?
    columns: [
      ...createPatientGridPatientDetailsColumns(),
      ...createPatientGridPostFormColumns(input.selectedForms, formSchemas),
    ],
  };

  return body;
}

function createPatientGridPatientDetailsColumns(): Array<PatientGridColumnPost> {
  return [
    {
      name: 'patientDetails.name',
      type: 'column',
      datatype: 'NAME',
    },
    {
      name: 'patientDetails.country',
      type: 'column',
      datatype: 'DATAFILTER_LOCATION',
    },
    {
      name: 'patientDetails.structure',
      type: 'column',
      datatype: 'DATAFILTER_LOCATION',
    },
    {
      name: 'patientDetails.gender',
      type: 'column',
      datatype: 'GENDER',
    },
    // TODO: Age category column.
  ];
}

function createPatientGridPostFormColumns(forms: Array<FormGet>, formSchemas: Record<string, FormSchema>) {
  const columns: Array<PatientGridColumnPost> = [];

  for (const form of forms) {
    const schemaId = form.resources.find((resource) => resource.name === 'JSON schema').valueReference;
    const formSchema = formSchemas[schemaId];
    if (!formSchema) {
      continue;
    }

    // TODO: Each form needs an "encounterDatetime" column *if* there is a question of type "encounterDatetime"
    // inside the form schema. That column should be added exactly here.
    // Right now this is not supported by the backend, hence this TODO.

    for (const page of formSchema.pages ?? []) {
      for (const section of page.sections ?? []) {
        for (const question of section.questions ?? []) {
          if (question.type === 'obs' && question.questionOptions.concept && form.encounterType?.uuid) {
            columns.push({
              name: question.id,
              type: 'obscolumn',
              datatype: 'OBS',
              concept: question.questionOptions.concept,
              encounterType: form.encounterType.uuid,
            });
          }
        }
      }
    }
  }

  return columns;
}

import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { GenderRepresentation, FormGet, getFormSchemas, PatientGridPost } from '../api';
import {
  getFormSchemaReferenceUuid,
  getPatientDetailsPatientGridColumnPostResources,
  getPatientGridColumnPostResourcesForForms,
} from '../crosscutting-features';
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
    // TODO: Enhance with additional criteria.
    return state.name?.trim().length && (state.generatePatientDetailsColumns || state.selectedForms.length);
  }, [state]);

  const createPostBody = useCallback(async () => {
    const formSchemas = await getFormSchemas(state.selectedForms.map(getFormSchemaReferenceUuid));
    const body: PatientGridPost = {
      name: state.name,
      description: state.description,
      owner: undefined, // TODO: Should this be the current owner?
      columns: [
        ...getPatientDetailsPatientGridColumnPostResources(),
        ...getPatientGridColumnPostResourcesForForms(state.selectedForms, formSchemas),
      ],
    };

    return body;
  }, [state]);

  return {
    currentPage,
    state,
    isStateValidForSubmission,
    createPostBody,
    page,
    isAtLastPage: page === pageFactories.length - 1,
  };
}

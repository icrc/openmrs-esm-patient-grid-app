import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { FormGet, PatientGridPost, PatientGridFilterPost, FormSchema } from '../api';
import {
  getPatientDetailsPatientGridColumnPostResources,
  getPatientGridColumnPostResourcesForForms,
} from '../grid-utils';
import { PatientGridBuilderDetailsPage } from './PatientGridBuilderDetailsPage';
import { PatientGridBuilderFiltersPage } from './PatientGridBuilderFiltersPage';
import { PatientGridBuilderSectionsPage } from './PatientGridBuilderSectionsPage';

export interface PatientGridWizardState {
  name?: string;
  description?: string;
  countryFilter?: PatientGridFilterPost;
  structureFilter?: PatientGridFilterPost;
  genderFilter?: PatientGridFilterPost;
  ageCategoryFilter?: PatientGridFilterPost;
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
  selectedForms: [],
};

export function usePatientGridWizard(formSchemas: Record<string, FormSchema>) {
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
    return state.name?.trim().length && state.selectedForms.length;
  }, [state]);

  const createPostBody = useCallback(() => {
    const body: PatientGridPost = {
      name: state.name,
      description: state.description,
      owner: undefined, // TODO: Should this be the current owner?
      columns: [
        ...getPatientDetailsPatientGridColumnPostResources(
          state.countryFilter ? [state.countryFilter] : undefined,
          state.structureFilter ? [state.structureFilter] : undefined,
          state.genderFilter ? [state.genderFilter] : undefined,
          state.ageCategoryFilter ? [state.ageCategoryFilter] : undefined,
        ),
        ...getPatientGridColumnPostResourcesForForms(state.selectedForms, formSchemas),
      ],
    };

    return body;
  }, [state, formSchemas]);

  return {
    currentPage,
    state,
    isStateValidForSubmission,
    createPostBody,
    page,
    isAtLastPage: page === pageFactories.length - 1,
  };
}

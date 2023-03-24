import { useConfig, useSession } from '@openmrs/esm-framework';
import React, { Dispatch, SetStateAction, useCallback, useMemo, useState } from 'react';
import { FormGet, PatientGridPost, PatientGridFilterPost, FormSchema } from '../api';
import { Config } from '../config-schema';
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
  shared?: boolean;
  countryFilter?: PatientGridFilterPost;
  structureFilter?: PatientGridFilterPost;
  genderFilter?: PatientGridFilterPost;
  ageCategoryFilter?: PatientGridFilterPost;
  selectedForms: Array<FormGet>;
  periodFilterType?: string;
  periodFilter?: PatientGridFilterPost;
}

export interface WizardPageProps {
  state: PatientGridWizardState;
  setState: Dispatch<SetStateAction<PatientGridWizardState>>;
  page: number;
  pages: number;
  goToNext(): void;
  goToPrevious(): void;
}
const setLastPeriodFilter = (value: string) => {
  const periodFilter: PatientGridFilterPost = {
    name: '',
    operand: '',
  };
  periodFilter.name = value;
  periodFilter.operand = JSON.stringify({
    fromDate: '',
    toDate: '',
    code: value,
  });
  return periodFilter;
};
const initialWizardState: PatientGridWizardState = {
  selectedForms: [],
  periodFilterType: 'relative',
  periodFilter: setLastPeriodFilter('lastThirtyDays'),
};

export function usePatientGridWizard(formSchemas: Record<string, FormSchema>) {
  const config = useConfig() as Config;
  const session = useSession();
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
    return (
      state.name?.trim().length &&
      state.selectedForms.length &&
      (state.countryFilter?.name || state.structureFilter?.name) &&
      state.periodFilter?.name
    );
  }, [state]);

  const createPostBody = useCallback(() => {
    // The age category column may use a configurable form UUID.
    // If that isn't configured, use the encounter type of the first form that we can find as fallback.
    const ageCategoryEncounterType =
      config.ageRangeEncounterTypeUuid ?? state.selectedForms.find((f) => !!f.encounterType.uuid).encounterType.uuid;

    const body: PatientGridPost = {
      name: state.name,
      description: state.description,
      owner: session.user?.uuid,
      shared: state.shared,
      columns: [
        ...getPatientDetailsPatientGridColumnPostResources(
          ageCategoryEncounterType,
          state.countryFilter ? [state.countryFilter] : undefined,
          state.structureFilter ? [state.structureFilter] : undefined,
          state.genderFilter ? [state.genderFilter] : undefined,
          state.ageCategoryFilter ? [state.ageCategoryFilter] : undefined,
        ),
        ...getPatientGridColumnPostResourcesForForms(
          state.selectedForms,
          formSchemas,
          state.periodFilter ? [state.periodFilter] : undefined,
        ),
      ],
    };

    return body;
  }, [state, formSchemas, config.ageRangeEncounterTypeUuid, session.user]);

  return {
    currentPage,
    state,
    isStateValidForSubmission,
    createPostBody,
    page,
    isAtLastPage: page === pageFactories.length - 1,
  };
}

import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { GenderRepresentation } from "../api";
import { PatientGridBuilderDetailsPage } from "./PatientGridBuilderDetailsPage";
import { PatientGridBuilderFiltersPage } from "./PatientGridBuilderFiltersPage";
import { PatientGridBuilderSectionsPage } from "./PatientGridBuilderSectionsPage";

export interface PatientGridWizardState {
  countryLocationId?: string;
  structureLocationId?: string;
  gender?: GenderRepresentation;
}

export interface WizardPageProps {
  state: PatientGridWizardState;
  setState: Dispatch<SetStateAction<PatientGridWizardState>>;
  page: number;
  pages: number;
  goToNext(): void;
  goToPrevious(): void;
}

export function usePatientGridWizard() {
  const [state, setState] = useState<PatientGridWizardState>({});
  const [page, setPage] = useState(0);
  const pageFactories = useMemo(
    () => [
      (props: WizardPageProps) => <PatientGridBuilderDetailsPage {...props} />,
      (props: WizardPageProps) => <PatientGridBuilderSectionsPage {...props} />,
      (props: WizardPageProps) => <PatientGridBuilderFiltersPage {...props} />,
    ],
    []
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
    [state, page, pageFactories]
  );

  const isStateValidForSubmission = useMemo(() => {
    // TODO: This should return whether "state" can be sent to the backend.
    // -> Should return false if, for example, values are missing.
    // -> Might potentially be covered via validation inside the respective pages. Let's keep it for now though.
    return true;
  }, []);

  return {
    currentPage,
    state,
    isStateValidForSubmission,
    page,
    isAtLastPage: page === pageFactories.length - 1,
  };
}

import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import { PatientGridBuilderDetailsPage } from "./PatientGridBuilderDetailsPage";
import { PatientGridBuilderFiltersPage } from "./PatientGridBuilderFiltersPage";
import { PatientGridBuilderSectionsPage } from "./PatientGridBuilderSectionsPage";

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PatientGridWizardState {
  // TODO: This is to contain the values for submitting the new patient grid.
  // This is ideally modeled as close as possible to the real object to be POSTed.
  //
  // The individual wizard pages fill the attributes of this object.
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
  const pages = useMemo(
    () => [
      (props: WizardPageProps) => <PatientGridBuilderDetailsPage {...props} />,
      (props: WizardPageProps) => <PatientGridBuilderSectionsPage {...props} />,
      (props: WizardPageProps) => <PatientGridBuilderFiltersPage {...props} />,
    ],
    []
  );

  const currentPage = useMemo(
    () =>
      pages[page]({
        state,
        setState,
        page,
        pages: pages.length,
        goToNext() {
          setPage((page) => page + 1);
        },
        goToPrevious() {
          setPage((page) => page - 1);
        },
      }),
    [state, page, pages]
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
    isAtLastPage: page === pages.length - 1,
  };
}

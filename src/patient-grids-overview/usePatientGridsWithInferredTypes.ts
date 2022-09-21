import { useSession } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import { useGetAllPatientGrids } from '../api';

// TODO: "system" might be named wrongly.
// -> Should be verified. This is supposed to be a grid which is not owned by anyone
//    and is thus only displayed in the "All" tab.
export type PatientGridType = 'my' | 'system' | 'other';

export function usePatientGridsWithInferredTypes() {
  const patientGridsSwr = useGetAllPatientGrids();
  const myUserUuid = useSession().user?.uuid;
  const data = useMemo(
    () =>
      patientGridsSwr.data?.map((patientGrid) => {
        let type: PatientGridType;
        if (patientGrid.owner === myUserUuid) {
          type = 'my';
        } else if (!patientGrid.owner) {
          type = 'system';
        } else {
          type = 'other';
        }

        return {
          ...patientGrid,
          type,
        };
      }),
    [patientGridsSwr.data, myUserUuid],
  );

  return {
    ...patientGridsSwr,
    data,
  };
}

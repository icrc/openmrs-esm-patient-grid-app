import { useSession } from "@openmrs/esm-framework";
import { useMemo } from "react";
import { usePatientGrids } from "../api";

// TODO: "system" might be named wrongly.
// -> Should be verified. This is supposed to be a list which is not owned by anyone
//    and is thus only displayed in the "All" tab.
export type PatientGridType = "my" | "shared" | "system";

export function usePatientGridsWithInferredTypes() {
  const patientGridsSwr = usePatientGrids();
  const myUserUuid = useSession().user?.uuid;
  const data = useMemo(
    () =>
      patientGridsSwr.data?.map((patientGrid) => {
        let type: PatientGridType = "system";
        if (patientGrid.owner === myUserUuid) {
          type = "my";
        } else if (patientGrid.owner) {
          type = "shared";
        }

        return {
          ...patientGrid,
          type,
        };
      }),
    [patientGridsSwr.data, myUserUuid]
  );

  return {
    ...patientGridsSwr,
    data,
  };
}

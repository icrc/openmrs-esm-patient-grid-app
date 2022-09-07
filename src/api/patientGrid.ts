import { useSession } from "@openmrs/esm-framework";
import useSWR from "swr";
import { mockApiCall } from "./mockUtils";
import { useMutation } from "./useMutation";

export interface PatientGridGet {
  uuid: string;
  name: string;
  description: string;
  owner?: string;
  cohort: string;
  columns: Array<PatientGridColumnGet>;
}

export interface PatientGridColumnGet {
  name: string;
  description: string;
  datatype: string;
  concept?: string;
  encounterType?: string;
  convertToAgeRange?: boolean;
}

export function useGetAllPatientGrids() {
  const myUserUuid = useSession().user?.uuid;
  return useSWR("/ws/rest/v1/icrc/patientgrid", () =>
    mockApiCall<Array<PatientGridGet>>([
      {
        uuid: "1",
        name: "First list",
        description: "First list description",
        owner: myUserUuid,
        cohort: "123",
        columns: [],
      },
      {
        uuid: "2",
        name: "Second list",
        description: "Second list description",
        owner: "123",
        cohort: "123",
        columns: [],
      },
      {
        uuid: "3",
        name: "Third list",
        description: "Third list description",
        owner: "456",
        cohort: "123",
        columns: [],
      },
      {
        uuid: "4",
        name: "Fourth list",
        description: "Fourth list description",
        owner: undefined,
        cohort: "123",
        columns: [],
      },
    ])
  );
}

export function useDeletePatientGridMutation() {
  const { mutate: mutateGetAllPatientGrids } = useGetAllPatientGrids();
  return useMutation<{ id: string }>(
    async ({ id }) => {
      // TODO: Uncomment and replace with mock once resolved.
      // await openmrsFetch(`/ws/rest/v1/icrc/patientgrid/${id}`, {
      //   method: "DELETE",
      // });
      console.info(`Mock delete patient grid with ID ${id}.`);
      return mockApiCall(id);
    },
    {
      onSuccess: () => mutateGetAllPatientGrids(),
    }
  );
}

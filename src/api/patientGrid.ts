import { useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { mockApiCall } from './mockUtils';
import { useMutation } from './useMutation';

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
  return useSWR('/ws/rest/v1/icrc/patientgrid', () =>
    mockApiCall<Array<PatientGridGet>>([
      {
        uuid: '1',
        name: 'First grid',
        description: 'First grid description',
        owner: myUserUuid,
        cohort: '123',
        columns: [],
      },
      {
        uuid: '2',
        name: 'Second grid',
        description: 'Second grid description',
        owner: '123',
        cohort: '123',
        columns: [],
      },
      {
        uuid: '3',
        name: 'Third grid',
        description: 'Third grid description',
        owner: '456',
        cohort: '123',
        columns: [],
      },
      {
        uuid: '4',
        name: 'Fourth grid',
        description: 'Fourth grid description',
        owner: undefined,
        cohort: '123',
        columns: [],
      },
    ]),
  );
}

export function useGetPatientGrid(id: string) {
  return useSWR(`/ws/rest/v1/icrc/patientgrid/${id}`, () =>
    mockApiCall<PatientGridGet>({
      uuid: '1',
      name: 'Example grid',
      description: 'Example grid description',
      owner: '123',
      cohort: '123',
      columns: [],
    }),
  );
}

export function useEditPatientGridMutation() {
  const { mutate: mutateGetAllPatientGrids } = useGetAllPatientGrids();
  return useMutation<{ id: string; body: unknown }>(
    async ({ id, body }) => {
      // TODO: Uncomment and replace with mock once resolved.
      // await openmrsFetch(`/ws/rest/v1/icrc/patientgrid/${id}`, {
      //   method: "POST",
      //   body,
      // });
      console.info(`Mock edit patient grid with ID ${id} and body.`, body);
      return mockApiCall(id);
    },
    {
      onSuccess: () => mutateGetAllPatientGrids(),
    },
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
    },
  );
}

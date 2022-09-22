import { OpenmrsResource, useSession } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { mockApiCall } from './mockUtils';
import { useMutation } from './useMutation';

export interface PatientGridGet extends OpenmrsResource {
  name: string;
  description?: string;
  retired: boolean;
  owner?: OpenmrsResource;
  cohort: OpenmrsResource;
  columns: Array<PatientGridColumnGet>;
}

export interface PatientGridColumnGet extends OpenmrsResource {
  name: string;
  description?: string;
  datatype: string;
  type: string;
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
        owner: { uuid: myUserUuid },
        cohort: { uuid: '123' },
        retired: false,
        columns: [],
      },
      {
        uuid: '2',
        name: 'Second grid',
        description: 'Second grid description',
        owner: { uuid: '123' },
        cohort: { uuid: '123' },
        retired: false,
        columns: [],
      },
      {
        uuid: '3',
        name: 'Third grid',
        description: 'Third grid description',
        owner: { uuid: '456' },
        cohort: { uuid: '123' },
        retired: false,
        columns: [],
      },
      {
        uuid: '4',
        name: 'Fourth grid',
        description: 'Fourth grid description',
        owner: undefined,
        cohort: { uuid: '123' },
        retired: false,
        columns: [],
      },
    ]),
  );
}

export function useGetPatientGrid(id: string) {
  return useSWR(`/ws/rest/v1/patientgrid/patientgrid/${id}`, () =>
    mockApiCall<PatientGridGet>({
      uuid: '1',
      name: 'Example grid',
      description: 'Example grid description',
      owner: { uuid: '123' },
      cohort: { uuid: '123' },
      retired: false,
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

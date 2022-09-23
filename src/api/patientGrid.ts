import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import useSWR, { useSWRConfig } from 'swr';
import { PatientGridColumnGet, PatientGridColumnPost } from './patientGridColumn';
import { FetchAllResponse } from './shared';
import { useMutation } from './useMutation';

export interface PatientGridGet extends OpenmrsResource {
  name: string;
  description?: string;
  retired: boolean;
  owner?: OpenmrsResource;
  cohort: OpenmrsResource;
  columns: Array<PatientGridColumnGet>;
}

export interface PatientGridPost {
  uuid?: string;
  name?: string;
  description?: string;
  columns?: Array<PatientGridColumnPost>;
  owner?: OpenmrsResource;
}

export function useGetAllPatientGrids() {
  return useSWR('/ws/rest/v1/patientgrid/patientgrid?v=full', (url) =>
    openmrsFetch<FetchAllResponse<PatientGridGet>>(url).then(({ data }) => data.results),
  );
}

export function useGetPatientGrid(id: string) {
  return useSWR(`/ws/rest/v1/patientgrid/patientgrid/${id}?v=full`, (url) =>
    openmrsFetch<PatientGridGet>(url).then(({ data }) => data),
  );
}

export function useCreatePatientGridMutation() {
  const { mutate: mutateGetAllPatientGrids } = useGetAllPatientGrids();
  return useMutation<{ body: PatientGridPost }>(
    ({ body }) =>
      openmrsFetch(`/ws/rest/v1/patientgrid/patientgrid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }),
    {
      onSuccess: () => mutateGetAllPatientGrids(),
    },
  );
}

export function useEditPatientGridMutation() {
  const { mutate: mutateGetAllPatientGrids } = useGetAllPatientGrids();
  const { mutate } = useSWRConfig();
  return useMutation<{ id: string; body: PatientGridPost }, PatientGridGet>(
    ({ id, body }) =>
      openmrsFetch<PatientGridGet>(`/ws/rest/v1/patientgrid/patientgrid/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).then(({ data }) => data),
    {
      onSuccess: ({ uuid }) => {
        mutateGetAllPatientGrids();
        mutate(`/ws/rest/v1/patientgrid/patientgrid/${uuid}?v=full`);
      },
    },
  );
}

export function useDeletePatientGridMutation() {
  const { mutate: mutateGetAllPatientGrids } = useGetAllPatientGrids();
  return useMutation<{ id: string }>(
    ({ id }) =>
      openmrsFetch(`/ws/rest/v1/patientgrid/patientgrid/${id}`, {
        method: 'DELETE',
      }),
    {
      onSuccess: () => mutateGetAllPatientGrids(),
    },
  );
}

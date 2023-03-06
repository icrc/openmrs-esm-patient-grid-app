import { openmrsFetch, OpenmrsResource, useSession } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import { PatientGridColumnGet, PatientGridColumnPost } from './patientGridColumn';
import { FetchAllResponse } from './shared';
import { useMutation } from './useMutation';

export interface PatientGridGet extends OpenmrsResource {
  name: string;
  description?: string;
  retired: boolean;
  shared?: boolean;
  owner?: OpenmrsResource;
  cohort: OpenmrsResource;
  columns: Array<PatientGridColumnGet>;
}

export interface PatientGridPost {
  uuid?: string;
  name?: string;
  description?: string;
  columns?: Array<PatientGridColumnPost>;
  owner?: string;
  shared?: boolean;
}

/** Used on the frontend for placing a grid into a category. */
export type PatientGridType = 'my' | 'system' | 'other';

export function useGetAllPatientGrids() {
  return useSWR('/ws/rest/v1/patientgrid/patientgrid?v=default', (url) =>
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
  return useMutation<{ body: PatientGridPost }, PatientGridGet>(
    ({ body }) =>
      openmrsFetch<PatientGridGet>(`/ws/rest/v1/patientgrid/patientgrid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).then(({ data }) => data),
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

export type PatientGridViewType = 'my' | 'shared' | 'system' | 'all';

const patientGridTypeFilters: Record<PatientGridViewType, (patientGrid: PatientGridGet, userId: string) => boolean> = {
  my: (grid, userId) => grid.owner?.uuid === userId,
  shared: (grid) => grid.shared,
  system: (grid) => !grid.owner,
  all: (grid, userId) => !(grid.owner && grid.owner.uuid !== userId && !grid.shared),
};

export function usePatientGridsOfType(type: PatientGridViewType) {
  const patientGridsSwr = useGetAllPatientGrids();
  const userId = useSession().user?.uuid;
  const data = useMemo(
    () => patientGridsSwr.data?.filter((grid) => patientGridTypeFilters[type](grid, userId)),
    [patientGridsSwr.data, userId, type],
  );

  return {
    ...patientGridsSwr,
    data,
  };
}

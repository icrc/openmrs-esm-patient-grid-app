import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PatientGridColumnGet } from './patientGridColumn';
import { FetchAllResponse } from './shared';
import { useMutation } from './useMutation';

export interface PatientGridFilterGet extends OpenmrsResource {
  name: string;
  operand: string;
  column: PatientGridColumnGet;
}

export interface PatientGridFilterPost {
  name?: string;
  operand?: unknown;
}

export function useGetAllPatientGridFilters(patientGridId: string) {
  return useSWR(`/ws/rest/v1/patientgrid/patientgrid/${patientGridId}/filter`, (url) =>
    openmrsFetch<FetchAllResponse<PatientGridFilterGet>>(url).then(({ data }) => data.results),
  );
}

export function useDeletePatientGridFilterMutation(patientGridId: string) {
  const { mutate: mutateGetAllPatientGridFilters } = useGetAllPatientGridFilters(patientGridId);
  return useMutation<{ patientGridId: string; filterId: string }>(
    ({ patientGridId, filterId }) =>
      openmrsFetch(`/ws/rest/v1/patientgrid/patientgrid/${patientGridId}/filter/${filterId}`, {
        method: 'DELETE',
      }),
    {
      onSuccess: () => mutateGetAllPatientGridFilters(),
    },
  );
}

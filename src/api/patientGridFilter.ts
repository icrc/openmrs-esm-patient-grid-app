import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { PatientGridColumnGet } from './patientGridColumn';
import { FetchAllResponse } from './shared';

export interface PatientGridFilterGet extends OpenmrsResource {
  name: string;
  operand: string;
  column: PatientGridColumnGet;
}

export interface PatientGridFilterPost {
  name?: string;
  operand?: unknown;
  column?: string;
}

export function useGetAllPatientGridFilters(patientGridId: string) {
  return useSWR(`/ws/rest/v1/patientgrid/patientgrid/${patientGridId}/filter`, (url) =>
    openmrsFetch<FetchAllResponse<PatientGridFilterGet>>(url).then(({ data }) => data.results),
  );
}

export function postPatientGridFilter(patientGridId: string, body: PatientGridFilterPost) {
  return openmrsFetch(`/ws/rest/v1/patientgrid/patientgrid/${patientGridId}/filter`, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body,
  });
}

export function deletePatientGridFilter(patientGridId: string, filterId: string) {
  return openmrsFetch(`/ws/rest/v1/patientgrid/patientgrid/${patientGridId}/filter/${filterId}`, {
    method: 'DELETE',
  });
}

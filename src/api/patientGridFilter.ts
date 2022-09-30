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
}

export function useGetPatientGridFilter(id: string) {
  return useSWR(`/ws/rest/v1/patientgrid/patientgrid/${id}/filter`, (url) =>
    openmrsFetch<FetchAllResponse<PatientGridFilterGet>>(url).then(({ data }) => data.results),
  );
}

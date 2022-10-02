import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FetchAllResponse } from './shared';

export interface PatientGridReportGet {
  patientGrid: OpenmrsResource;
  report: Array<PatientGridReportRowGet>;
}

export interface PatientGridReportRowGet extends Record<string, undefined | null | string | PatientGridReportObsGet> {
  uuid: string;
}

export interface PatientGridReportObsGet {
  uuid: string;
  concept: string;
  value: string;
  formFieldPath?: string;
  formFieldNamespace?: string;
  encounter: {
    uuid: string;
    form: string;
    encounterType: string;
  };
}

export function useGetPatientGridReport(id: string) {
  return useSWR(`/ws/rest/v1/patientgrid/patientgrid/${id}/report`, (url) =>
    openmrsFetch<FetchAllResponse<PatientGridReportGet>>(url).then(({ data }) => data.results[0]),
  );
}

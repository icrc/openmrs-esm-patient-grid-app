import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import useSWR, { useSWRConfig } from 'swr';
import { FetchAllResponse } from './shared';
import { useMutation } from './useMutation';

export interface PatientGridReportGet {
  patientGrid: OpenmrsResource;
  report: Array<PatientGridReportRowGet>;
  reportMetadata: PatientGridReportMetaData;
}

export interface PatientGridReportRowGet
  extends Record<string, undefined | null | string | number | boolean | PatientGridReportObsGet> {
  uuid: string;
}
export interface PatientGridReportMetaData {
  truncated: string;
  rowsCountLimit: number;
  initialRowsCount: number;
  periodOperand: {
    fromDate: string;
    toDate: string;
    code: string;
  };
}

export interface PatientGridReportObsGet {
  uuid: string;
  concept: string;
  value:
    | string
    | number
    | boolean
    | {
        uuid: string;
        display: string;
      };
  formFieldPath?: string;
  formFieldNamespace?: string;
  encounter: {
    uuid: string;
    form: string;
    encounterType: string;
  };
}

export function useGetPatientGridReport(id: string) {
  return useSWR(
    `/ws/rest/v1/patientgrid/patientgrid/${id}/report`,
    (url) => openmrsFetch<FetchAllResponse<PatientGridReportGet>>(url).then(({ data }) => data.results[0]),
    {
      // We do manual revalidation/mutation of this one.
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    },
  );
}

export function useRefreshPatientGridReportMutation() {
  const { mutate } = useSWRConfig();
  return useMutation<{ id: string }>(async ({ id }) => {
    const newReport = await openmrsFetch<FetchAllResponse<PatientGridReportGet>>(
      `/ws/rest/v1/patientgrid/patientgrid/${id}/report?refresh=true`,
    ).then(({ data }) => data.results[0]);
    mutate(`/ws/rest/v1/patientgrid/patientgrid/${id}/report`, () => newReport);
  });
}

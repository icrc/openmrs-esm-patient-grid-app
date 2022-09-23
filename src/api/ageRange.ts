import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FetchAllResponse } from './shared';

export type AgeRangeUnit = 'YEARS' | 'MONTHS';

export interface AgeRangeGet {
  minAge?: number;
  minAgeUnit?: AgeRangeUnit;
  maxAge?: number;
  maxAgeUnit?: AgeRangeUnit;
  label: string;
  display: string;
}

export function useGetAllAgeRanges() {
  return useSWR(`/ws/rest/v1/patientgrid/agerange?v=full`, (url) =>
    openmrsFetch<FetchAllResponse<AgeRangeGet>>(url).then(({ data }) => data.results),
  );
}

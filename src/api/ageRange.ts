import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
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
  return useSWRImmutable(`/ws/rest/v1/patientgrid/agerange?v=full`, (url) =>
    openmrsFetch<FetchAllResponse<AgeRangeGet>>(url).then(({ data }) => data.results),
  );
}

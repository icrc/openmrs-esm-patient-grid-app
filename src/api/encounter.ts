import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FetchAllResponse } from './shared';

export interface PastEncounterGet extends OpenmrsResource {
  obs: Array<PastEncounterObsGet>;
}

export interface PastEncounterObsGet extends OpenmrsResource {
  concept: OpenmrsResource;
  value?: unknown;
  formFieldNamespace?: string;
  formFieldPath?: string;
  encounter: OpenmrsResource;
}

export function useGetAllPastEncounters(patientId: string, encounterType: string) {
  const v =
    'custom:uuid,display,obs:(uuid,concept:ref,value,formFieldNamespace,formFieldPath,encounter:(uuid,encounterType:ref)))';
  return useSWR(
    `/ws/rest/v1/encounter?s=patientgridGetEncounterHistory&patient=${patientId}&encounterType=${encounterType}&v=${v}`,
    (url) => openmrsFetch<FetchAllResponse<PastEncounterGet>>(url).then(({ data }) => data.results),
  );
}

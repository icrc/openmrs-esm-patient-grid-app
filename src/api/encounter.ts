import { openmrsFetch, OpenmrsResource, Visit } from '@openmrs/esm-framework';
import useSWR, { SWRConfiguration } from 'swr';
import { FetchAllResponse } from './shared';

export interface EncounterGet extends OpenmrsResource {
  patient: OpenmrsResource;
  visit: Visit;
}

export interface PastEncounterGet extends OpenmrsResource {
  encounterDatetime: string;
  obs: Array<PastEncounterObsGet>;
}

export interface PastEncounterObsGet extends OpenmrsResource {
  concept: OpenmrsResource;
  value?: null | string | number | OpenmrsResource;
  formFieldNamespace?: string;
  formFieldPath?: string;
  encounter: OpenmrsResource;
}

export function useGetAllPastEncounters(patientId: string, encounterType: string, reportUuid: string) {
  const v =
    'custom:uuid,display,encounterDatetime,obs:(uuid,concept:ref,value,formFieldNamespace,formFieldPath,encounter:(uuid,encounterType:ref)))';
  return useSWR(
    `/ws/rest/v1/encounter?s=patientgridGetEncounterHistory&patientGridUuid=${reportUuid}&patient=${patientId}&encounterType=${encounterType}&v=${v}`,
    (url) => openmrsFetch<FetchAllResponse<PastEncounterGet>>(url).then(({ data }) => data.results),
  );
}

export function useGetEncounter(id: string, config?: SWRConfiguration) {
  return useSWR(
    `/ws/rest/v1/encounter/${id}?v=full`,
    (url) => openmrsFetch<EncounterGet>(url).then(({ data }) => data),
    config,
  );
}

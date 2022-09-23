import { openmrsFetch } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FhirBundleResponse } from './shared';

export interface LocationGet {
  id: string;
  name: string;
}

export function useGetAllCountryLocations() {
  return useFilteredLocations('?_tag=Country Location');
}

export function useGetAllStructureLocations(countryLocationName: string | undefined) {
  return useFilteredLocations(
    countryLocationName ? `?_tag=Visit Location&address-country=${countryLocationName}` : undefined,
  );
}

function useFilteredLocations(filter: string | undefined) {
  const url = `/ws/fhir2/R4/Location${filter}`;
  const swrKey = filter ? url : null;

  return useSWR(swrKey, (url) =>
    openmrsFetch<FhirBundleResponse<LocationGet>>(url).then(
      (res) => res.data.entry?.map((entry) => entry.resource) ?? [],
    ),
  );
}

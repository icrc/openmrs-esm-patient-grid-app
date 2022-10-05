import { openmrsFetch } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import { FhirBundleResponse } from './shared';
import range from 'lodash-es/range';

export interface LocationGet {
  id: string;
  name: string;
}

export function useGetAllCountryLocations() {
  return useFilteredLocations('?_tag=Country Location&');
}

export function useGetAllStructureLocations(countryLocationName: string | undefined) {
  return useFilteredLocations(
    countryLocationName ? `?_tag=Visit Location&address-country=${countryLocationName}&` : '?',
    !!countryLocationName,
  );
}

function useFilteredLocations(filter: string, enabled = true, maxCount = 100) {
  const url = `/ws/fhir2/R4/Location${filter}`;
  const swrKey = enabled ? url : null;

  return useSWRImmutable(swrKey, async (url) => {
    // Locations are returning a max. value of 100 per query.
    // -> We must therefore do multiple requests to get them all.

    // Make one discovery request here that simply requests the total amount of entries.
    const {
      data: { total },
    } = await openmrsFetch<FhirBundleResponse<LocationGet>>(`${url}_count=0`);

    const results = await Promise.all(
      range(Math.ceil(total / maxCount)).map((page) =>
        openmrsFetch<FhirBundleResponse<LocationGet>>(`${url}_count=${maxCount}&_getpagesoffset=${page * maxCount}`),
      ),
    );

    return results.flatMap((result) => result.data.entry ?? []).map((x) => x.resource);
  });
}

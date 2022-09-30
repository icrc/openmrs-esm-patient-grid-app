import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { FetchAllResponse } from './shared';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ConceptGet extends OpenmrsResource {}

/**
 * Bulk-fetches a set of known concepts.
 * This reuses the logic used by the `esm-form-entry` widget. For reference, see:
 * https://github.com/openmrs/openmrs-esm-patient-chart/blob/a29fed2bad3ea6c10f0b2dd4f154e5f558c56d11/packages/esm-form-entry-app/src/app/services/concept.service.ts#L62
 * @param referenceIds The UUIDs of the concepts to be bulk-fetched.
 */
export function useGetBulkConceptsByReferences(referenceIds: Array<string>) {
  return useSWR(['concepts', ...[...referenceIds].sort()], async () => {
    const chunkSize = 100;
    const urlsToRequest = [...new Set(referenceIds)]
      .reduceRight((acc, _, __, array) => [...acc, array.splice(0, chunkSize)], [])
      .map((uuidPartition) => `/ws/rest/v1/concept?references=${uuidPartition.join(',')}`);
    // TODO: The above URL doesn't seem to include any language/lang parameter.
    // Considering that we're only fetching the concepts for the purpose of i18n, this should
    // probably be added.
    // The question is how? esm-form-entry doesn't have this parameter either.

    // We don't want the entire thing to fail only because a few concepts cannot be found. -> Swallow errors.
    const results = await Promise.all(
      urlsToRequest.map((url) =>
        openmrsFetch<FetchAllResponse<ConceptGet>>(url)
          .then(({ data }) => data.results)
          .catch<undefined>(() => undefined),
      ),
    );

    return results
      .filter(Boolean)
      .flatMap((x) => x)
      .reduce<Record<string, ConceptGet>>((acc, concept) => {
        acc[concept.uuid] = concept;
        return acc;
      }, {});
  });
}

import { openmrsFetch, OpenmrsResource, userHasAccess, useSession } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';
import { EncounterTypeGet } from './encounterType';
import { FetchAllResponse } from './shared';

export interface FormGet extends OpenmrsResource {
  name: string;
  description?: string;
  retired: boolean;
  version: string;
  build?: number;
  published: boolean;
  encounterType: EncounterTypeGet;
  resources?: Array<FormResourceGet>;
}

export interface FormResourceGet extends OpenmrsResource {
  name: string;
  valueReference: string;
}

export function useGetAllForms() {
  return useSWRImmutable('/ws/rest/v1/form?v=full', (url) =>
    openmrsFetch<FetchAllResponse<FormGet>>(url).then(({ data }) => data.results),
  );
}

export function useGetAllPublishedPrivilegeFilteredForms() {
  const session = useSession();
  const getAllFormsSwr = useGetAllForms();
  const filteredForms = useMemo(() => {
    return getAllFormsSwr.data?.filter(
      (form) =>
        // TODO: Verify/Let someone review that this filter is doing the right thing.
        form.published &&
        form.resources?.some((resource) => resource.name === 'JSON schema' && resource.valueReference) &&
        !/component/i.test(form.name) &&
        Boolean(userHasAccess(form.encounterType?.editPrivilege?.display, session?.user)),
    );
  }, [getAllFormsSwr.data, session]);

  return {
    ...getAllFormsSwr,
    data: filteredForms,
  };
}

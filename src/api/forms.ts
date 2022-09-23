import { openmrsFetch, OpenmrsResource, userHasAccess, useSession } from '@openmrs/esm-framework';
import { useMemo } from 'react';
import useSWR from 'swr';
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
}

export function useGetAllForms() {
  return useSWR('/ws/rest/v1/form?v=full', (url) =>
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
        !/component/i.test(form.name) &&
        Boolean(userHasAccess(form.encounterType?.editPrivilege?.display, session?.user)),
    );
  }, [getAllFormsSwr.data, session]);

  return {
    ...getAllFormsSwr,
    data: filteredForms,
  };
}

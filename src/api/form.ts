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
  return useSWRImmutable(
    '/ws/rest/v1/form?includeAll=true&v=custom:(uuid,name,display,encounterType:(uuid,name,viewPrivilege,editPrivilege),version,published,retired,resources:(uuid,name,dataType,valueReference))',
    (url) => openmrsFetch<FetchAllResponse<FormGet>>(url).then(({ data }) => data.results),
  );
}

export function useGetAllPublishedPrivilegeFilteredForms() {
  const session = useSession();
  const getAllFormsSwr = useGetAllForms();
  const filteredForms = useMemo(() => {
    return getAllFormsSwr.data?.filter(
      (form) =>
        form.published &&
        !form.retired &&
        form.resources?.some((resource) => resource.name === 'JSON schema' && resource.valueReference) &&
        !/component/i.test(form.name) &&
        Boolean(
          userHasAccess(form.encounterType?.editPrivilege?.display, session?.user) ||
            userHasAccess(form.encounterType?.viewPrivilege?.display, session?.user),
        ),
    );
  }, [getAllFormsSwr.data, session]);

  return {
    ...getAllFormsSwr,
    data: filteredForms,
  };
}
export function useGetAllPrivilegeFilteredForms() {
  const session = useSession();
  const getAllFormsSwr = useGetAllForms();
  const filteredForms = useMemo(() => {
    return getAllFormsSwr.data?.filter(
      (form) =>
        form.resources?.some((resource) => resource.name === 'JSON schema' && resource.valueReference) &&
        !/component/i.test(form.name) &&
        Boolean(
          userHasAccess(form.encounterType?.editPrivilege?.display, session?.user) ||
            userHasAccess(form.encounterType?.viewPrivilege?.display, session?.user),
        ),
    );
  }, [getAllFormsSwr.data, session]);

  return {
    ...getAllFormsSwr,
    data: filteredForms,
  };
}

/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, useMemo } from 'react';
import { SWRResponse } from 'swr';

export function useMergedSwr<T>(
  merge: () => T,
  swrResponses: Array<SWRResponse>,
  deps: DependencyList = [],
): SWRResponse<T> {
  return useMemo(() => {
    const areAllLoaded = swrResponses.every((res) => !!res.data);
    const data = areAllLoaded ? merge() : null;
    const error = swrResponses.find((res) => res.error);
    const mutate = () => Promise.all(swrResponses.map((res) => res.mutate())).then(merge);
    const isValidating = swrResponses.some((res) => res.isValidating);

    return {
      data,
      error,
      mutate,
      isValidating,
    };
  }, [merge, ...swrResponses.flatMap((res) => [res.data, res.error, res.isValidating]), ...deps]);
}

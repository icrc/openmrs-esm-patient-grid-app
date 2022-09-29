import { useMemo } from 'react';
import { SWRResponse } from 'swr';

export function useMergedSwr<T>(merge: () => T, swrResponses: Array<SWRResponse>): SWRResponse<T> {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    merge,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ...swrResponses.flatMap((res) => [res.data, res.error, res.isValidating]),
  ]);
}

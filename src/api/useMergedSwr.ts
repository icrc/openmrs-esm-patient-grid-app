/* eslint-disable react-hooks/exhaustive-deps */
import { DependencyList, useMemo, useRef } from 'react';
import { SWRResponse } from 'swr';

/**
 * Allows combining multile separate SWR calls into one single {@link SWRResponse}, using custom logic
 * to map/merge the results of the SWR calls.
 *
 * ```ts
 * // Imagine, for example, that two resources are fetched via 2 separate SWRs inside a custom hook:
 * function useTwoResources() {
 *   const swr1 = useFirstSwr();
 *   const swr2 = useSecondSwr();
 *
 *   // Now assume that we want to do combine those two resources into one object while
 *   // still retaining the `data`, `error`, `isValidating` and `mutate` behavior
 *   // that SWR provides.
 *   // We can use this hook:
 *   return useMergedSwr(
 *     () => ({ data1: swr1.data, data2: swr2.data }),
 *     [swr1, swr2]
 *   );
 * }
 * ```
 *
 * When this hook is called, it behaves as if it was one single SWR call:
 * ```ts
 * const { data, error, isValidating, mutate } = useTwoResources();
 * ```
 * @param merge The function which merges the results of the SWR dependencies.
 * @param swrResponses A dependency array of the SWR responses that should be merged.
 * @param deps Optional, additional dependencies that should trigger a reevaluation of {@link merge}.
 */
export function useMergedSwr<T>(
  merge: () => T,
  swrResponses: Array<SWRResponse>,
  deps: DependencyList = [],
): SWRResponse<T> {
  const mergeRef = useRef(merge);
  mergeRef.current = merge;

  return useMemo(() => {
    const areAllLoaded = swrResponses.every((res) => !!res.data);
    const data = areAllLoaded ? mergeRef.current() : null;
    const error = swrResponses.find((res) => res.error);
    const mutate = () => Promise.all(swrResponses.map((res) => res.mutate())).then(mergeRef.current);
    const isValidating = swrResponses.some((res) => res.isValidating);

    return {
      data,
      error,
      mutate,
      isValidating,
    };
  }, [mergeRef, ...swrResponses.flatMap((res) => [res.data, res.error, res.isValidating]), ...deps]);
}

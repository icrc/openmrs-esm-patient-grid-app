/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { useCallback, useRef, useState } from "react";

/**
 * Represents an asynchronous mutation function which mutates arbitrary data.
 * This is, essentially, the user provided function which can run arbitrary mutation logic.
 * The function can return a result (for example, an updated value).
 */
export type MutationFn<TData, TArgs> = (args: TArgs) => Promise<TData>;

/**
 * Represents the potential status of a mutation.
 * * `idle`: The mutation never ran and is not currently running.
 * * `loading`: The mutation is currently running.
 * * `success`: The mutation successfully ran and provided a result.
 * * `error`: The mutation ran, but failed with an error.
 */
export type MutationStatus = "idle" | "loading" | "success" | "error";

/**
 * Represents the arguments which can be passed to the {@link useMutation} hook.
 */
export interface UseMutationArgs<TData, TError> {
  onSuccess?(data: TData): void;
  onError?(error: TError): void;
  onSettled?(): void;
}

/**
 * Represents a function which triggers a mutation.
 * It can optionally receive additional inline arguments for reacting to mutation state changes.
 */
export type MutateFn<TArgs, TData, TError> = (
  args: TArgs,
  options?: {
    onSuccess?(data: TData): void;
    onError?(error: TError): void;
    onSettled?(): void;
  }
) => Promise<void>;

/**
 * The shape of the internal state tracked by useMutation.
 */
interface InternalMutationState<TData, TError> {
  status: MutationStatus;
  data?: TData;
  error?: TError;
}

// Internal singleton states that can be reused accross multiple useMutation invocations.
const idleState: InternalMutationState<any, any> = { status: "idle" };
const loadingState: InternalMutationState<any, any> = { status: "loading" };

/**
 * A hook for running asynchronous data mutations.
 * This is heavily inspired by the `useMutation` hook of the `react-query` library (though much
 * simpler in its current version).
 * See the following links for details:
 * * https://tanstack.com/query/v4/docs/guides/mutations
 * * https://tanstack.com/query/v4/docs/reference/useMutation
 * @param mutationFn The mutation function which performs some arbitrary, asynchronous data mutation.
 * @param args Optional arguments which enable hooking into the mutation lifecycle.
 * @returns An object providing the current state of the mutation, as well as a function to trigger it.
 */
export function useMutation<TArgs = unknown, TData = unknown, TError = Error>(
  mutationFn: MutationFn<TData, TArgs>,
  options?: UseMutationArgs<TData, TError>
) {
  const stabilizedMutationDeps = useStabilized({ mutationFn, options });
  const [state, setState] =
    useState<InternalMutationState<TData, TError>>(idleState);

  const mutate = useCallback<MutateFn<TArgs, TData, TError>>(
    async (args, mutateOptions) => {
      const { mutationFn, options } = stabilizedMutationDeps.current;
      setState(loadingState);
      const [hasData, data, error] = await safeUnwrap(mutationFn(args));

      if (hasData) {
        setState({ status: "success", data });
        options?.onSuccess?.(data!);
        options?.onSettled?.();
        mutateOptions?.onSuccess?.(data!);
        mutateOptions?.onSettled?.();
      } else {
        setState({ status: "error", error });
        options?.onError?.(error);
        options?.onSettled?.();
        mutateOptions?.onError?.(error);
        mutateOptions?.onSettled?.();
      }
    },
    [stabilizedMutationDeps]
  );

  return {
    ...state,
    mutate,
    isIdle: state.status === "idle",
    isLoading: state.status === "loading",
    isSuccess: state.status === "success",
    isError: state.status === "error",
  };
}

/**
 * Stabilizes the given value by wrapping it inside a ref.
 * The ref is ensured to always contain the latest value, just without the associated change notifications.
 * @param value The value to be stabilized.
 * @returns A ref containing the latest value.
 */
function useStabilized<T>(value: T) {
  const stableWrapper = useRef<T>(value);

  // Ensure to reassign on every render. This doesn't trigger updates itself, but ensures that the ref
  // always holds the latest value.
  stableWrapper.current = value;

  return stableWrapper;
}

function safeUnwrap<T>(promise: Promise<T>) {
  return promise
    .then((result) => [true, result, undefined] as const)
    .catch((error) => [false, undefined, error] as const);
}

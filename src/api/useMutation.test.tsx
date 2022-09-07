import { useMutation } from "./useMutation";
import { act, renderHook } from "@testing-library/react";
import { useState } from "react";

describe(useMutation, () => {
  it("has correct result transitions", async () => {
    const [getMutatePromise, res, rej, reset] = createControlledPromise();
    const { result } = renderHook(() => useMutation(() => getMutatePromise()));

    expect(result.current.status).toBe("idle");
    expect(result.current.isIdle).toBe(true);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await act(() => {
      result.current.mutate(null);
    });
    expect(result.current.status).toBe("loading");
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await act(() => res("result"));
    expect(result.current.status).toBe("success");
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(true);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBe("result");
    expect(result.current.error).toBeUndefined();

    reset();
    await act(() => {
      result.current.mutate(null);
    });
    expect(result.current.status).toBe("loading");
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBeUndefined();

    await act(() => rej("error"));
    expect(result.current.status).toBe("error");
    expect(result.current.isIdle).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isSuccess).toBe(false);
    expect(result.current.isError).toBe(true);
    expect(result.current.data).toBeUndefined();
    expect(result.current.error).toBe("error");
  });

  it("calls success and settled callbacks when mutation function resolves", async () => {
    const [getMutatePromise, res] = createControlledPromise();
    const mutationFn = jest.fn().mockImplementation(() => getMutatePromise());
    const useMutationOnSettled = jest.fn();
    const useMutationOnSuccess = jest.fn();
    const mutateOnSettled = jest.fn();
    const mutateOnSuccess = jest.fn();

    const { result } = renderHook(() =>
      useMutation(mutationFn, {
        onSuccess: useMutationOnSuccess,
        onSettled: useMutationOnSettled,
      })
    );

    await act(() => {
      result.current.mutate(null, {
        onSuccess: mutateOnSuccess,
        onSettled: mutateOnSettled,
      });
    });
    expect(mutationFn).toHaveBeenCalledTimes(1);

    await act(() => res("result"));
    expect(useMutationOnSettled).toHaveBeenCalled();
    expect(useMutationOnSuccess).toHaveBeenCalledWith("result");
    expect(mutateOnSettled).toHaveBeenCalled();
    expect(mutateOnSuccess).toHaveBeenCalledWith("result");
  });

  it("calls error and settled callbacks when mutation function rejects", async () => {
    const [getMutatePromise, , rej] = createControlledPromise();
    const mutationFn = jest.fn().mockImplementation(() => getMutatePromise());
    const useMutationOnSettled = jest.fn();
    const useMutationOnError = jest.fn();
    const mutateOnSettled = jest.fn();
    const mutateOnError = jest.fn();

    const { result } = renderHook(() =>
      useMutation(mutationFn, {
        onError: useMutationOnError,
        onSettled: useMutationOnSettled,
      })
    );

    await act(() => {
      result.current.mutate(null, {
        onError: mutateOnError,
        onSettled: mutateOnSettled,
      });
    });
    expect(mutationFn).toHaveBeenCalledTimes(1);

    await act(() => rej("error"));
    expect(useMutationOnSettled).toHaveBeenCalled();
    expect(useMutationOnError).toHaveBeenCalledWith("error");
    expect(mutateOnSettled).toHaveBeenCalled();
    expect(mutateOnError).toHaveBeenCalledWith("error");
  });

  it("returns stable values even when inputs change", async () => {
    const { result } = renderHook(() => {
      const [mutationFn, setMutationFn] = useState(
        () => () => Promise.resolve()
      );
      const [options, setOptions] = useState({});
      const mutation = useMutation(mutationFn, options);
      return { mutation, setMutationFn, setOptions };
    });
    const initialMutation = result.current.mutation;

    await act(() => {
      result.current.setMutationFn(() => () => Promise.resolve());
      result.current.setOptions({});
    });

    const currentMutation = result.current.mutation;
    expect(currentMutation).not.toBe(initialMutation);
    expect(currentMutation.mutate).toBe(initialMutation.mutate);
    expect(currentMutation.data).toBe(initialMutation.data);
    expect(currentMutation.error).toBe(initialMutation.error);
    expect(currentMutation.status).toBe(initialMutation.status);
    expect(currentMutation.isLoading).toBe(initialMutation.isLoading);
    expect(currentMutation.isIdle).toBe(initialMutation.isIdle);
    expect(currentMutation.isSuccess).toBe(initialMutation.isSuccess);
    expect(currentMutation.isError).toBe(initialMutation.isError);
  });
});

function createControlledPromise<T>() {
  let currentRes: (result: T) => void;
  let currentRej: (error: any) => void;
  let currentPromise: Promise<T>;
  const reset = () =>
    (currentPromise = new Promise((resolve, reject) => {
      currentRes = resolve;
      currentRej = reject;
    }));
  const getPromise = () => currentPromise;
  const res = (result: T) => currentRes(result);
  const rej = (error: any) => currentRej(error);

  reset();
  return [getPromise, res, rej, reset] as const;
}

// TODO: Delete me once the actual endpoints are hooked up.
export async function mockApiCall<T>(result: T, timeoutMs = 1000) {
  return new Promise<T>((res) => setTimeout(() => res(result), timeoutMs));
}

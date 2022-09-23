export interface FhirBundleResponse<T> {
  entry?: Array<{
    resource: T;
  }>;
}

export interface FetchAllResponse<T> {
  results: Array<T>;
}

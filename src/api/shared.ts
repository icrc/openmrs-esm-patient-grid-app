export interface FhirBundleResponse<T> {
  entry?: Array<{
    resource: T;
  }>;
  total: number;
}

export interface FetchAllResponse<T> {
  results: Array<T>;
}

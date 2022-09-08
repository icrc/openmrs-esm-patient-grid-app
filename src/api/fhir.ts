export interface FhirBundleResponse<T> {
  entry?: Array<{
    resource: T;
  }>;
}

import { SWRConfiguration } from 'swr';

export const onlyStaleRevalidationConfig: SWRConfiguration = {
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

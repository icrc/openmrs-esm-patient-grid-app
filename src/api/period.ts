import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type PeriodRepresentation = 'last' | 'custom';

export interface PeriodDetails {
  period: PeriodRepresentation;
  display: string;
}

export function useAllPeriods() {
  // The period(s) remain, for the moment, hard coded until further notice.
  const { t } = useTranslation();
  return useMemo<Array<PeriodDetails>>(
    () => [
      {
        period: 'last',
        display: t('lastPeriod', 'Last'),
      },
      {
        period: 'custom',
        display: t('customPeriod', 'Custom'),
      },
    ],
    [t],
  );
}

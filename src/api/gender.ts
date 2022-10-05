import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export type GenderRepresentation = 'M' | 'F' | 'U' | 'O';

export interface GenderDetails {
  gender: GenderRepresentation;
  display: string;
}

export function useAllGenders() {
  // The gender(s) remain, for the moment, hard coded until further notice.
  const { t } = useTranslation();
  return useMemo<Array<GenderDetails>>(
    () => [
      {
        gender: 'M',
        display: t('genderMale', 'Male'),
      },
      {
        gender: 'F',
        display: t('genderFemale', 'Female'),
      },
      {
        gender: 'U',
        display: t('genderUnknown', 'Unknown'),
      },
      {
        gender: 'O',
        display: t('genderOther', 'Other'),
      },
    ],
    [t],
  );
}

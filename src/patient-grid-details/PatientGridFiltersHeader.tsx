import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack } from '@carbon/react';
import styles from './PatientGridFiltersHeader.scss';
import { CloseableTag } from '../components';

export function PatientGridFiltersHeader() {
  const { t } = useTranslation();
  const filters = useMemo(() => ['Mocked filter 1', 'Mocked filter 2'], []);

  return (
    <Stack as="section" orientation="horizontal" gap={4} className={styles.filtersContainer}>
      <span className={styles.filtersCaption}>{t('patientGridFiltersHeaderFilterCaption', 'Filters:')}</span>

      {filters.length ? (
        filters.map((filter) => (
          <CloseableTag
            size="md"
            type="gray"
            iconDescription={t('patientGridFiltersHeaderRemoveFilter', 'Remove filter')}>
            {filter}
          </CloseableTag>
        ))
      ) : (
        <span className={styles.filtersFallback}>{t('patientGridFiltersHeaderNoFiltersFallback', '--')}</span>
      )}
    </Stack>
  );
}

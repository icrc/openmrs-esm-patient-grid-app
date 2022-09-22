import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, ButtonSkeleton } from '@carbon/react';
import styles from './PatientGridFiltersHeader.scss';
import { CloseableTag } from '../components';

export function PatientGridFiltersHeader() {
  const { t } = useTranslation();
  const filters = useMemo(() => ['Mocked filter 1', 'Mocked filter 2'], []); // TODO: Use real data.

  return (
    <Stack as="section" orientation="horizontal" gap={4} className={styles.filtersContainer}>
      <span className={styles.filtersCaption}>{t('patientGridFiltersHeaderFilterCaption', 'Filters:')}</span>

      {filters?.length ? (
        filters.map((filter) => (
          <CloseableTag
            className={styles.filterTag}
            size="md"
            type="gray"
            iconDescription={t('patientGridFiltersHeaderRemoveFilter', 'Remove filter')}>
            {filter}
          </CloseableTag>
        ))
      ) : filters ? (
        <span className={styles.filtersFallback}>{t('patientGridFiltersHeaderNoFiltersFallback', '--')}</span>
      ) : (
        <>
          <ButtonSkeleton small />
          <ButtonSkeleton small />
        </>
      )}
    </Stack>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, ButtonSkeleton } from '@carbon/react';
import styles from './PatientGridFiltersHeader.scss';
import { CloseableTag } from '../components';
import { useGetPatientGridFilter } from '../api/patientGridFilter';
import { useColumnNameToHeaderLabelMap } from '../crosscutting-features';

export interface PatientGridFiltersHeaderProps {
  patientGridId: string;
}

export function PatientGridFiltersHeader({ patientGridId }: PatientGridFiltersHeaderProps) {
  const { t } = useTranslation();
  const { data: columnNameToHeaderLabelMap } = useColumnNameToHeaderLabelMap();
  const { data: filters } = useGetPatientGridFilter(patientGridId);

  return (
    <Stack as="section" orientation="horizontal" gap={4} className={styles.filtersContainer}>
      <span className={styles.filtersCaption}>{t('patientGridFiltersHeaderFilterCaption', 'Filters:')}</span>

      {filters?.length && columnNameToHeaderLabelMap ? (
        filters.map((filter) => (
          <CloseableTag
            key={filter.uuid}
            className={styles.filterTag}
            size="md"
            type="gray"
            iconDescription={t('patientGridFiltersHeaderRemoveFilter', 'Remove filter')}>
            {columnNameToHeaderLabelMap[filter.column.display] ?? filter.column.display ?? filter.display}:{' '}
            {filter.operand}
          </CloseableTag>
        ))
      ) : filters && columnNameToHeaderLabelMap ? (
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

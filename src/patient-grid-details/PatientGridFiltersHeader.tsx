import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, ButtonSkeleton, Tag } from '@carbon/react';
import styles from './PatientGridFiltersHeader.scss';
import { InlinePatientGridEditingContext, LocalFilter, useColumnNameToHeaderLabelMap } from '../grid-utils';

export interface PatientGridFiltersHeaderProps {
  patientGridId: string;
}

export function PatientGridFiltersHeader({ patientGridId }: PatientGridFiltersHeaderProps) {
  const { t } = useTranslation();
  const { data: columnNameToHeaderLabelMap } = useColumnNameToHeaderLabelMap();
  const { filters } = useContext(InlinePatientGridEditingContext);

  // Every filter with a UUID must come from the backend.
  // Those should appear before the local ones.
  const originalFilters = filters.filter((x) => 'uuid' in x);
  const localFilters = filters.filter((x) => !('uuid' in x));

  return (
    <Stack as="section" orientation="horizontal" gap={4} className={styles.filtersContainer}>
      <span className={styles.filtersCaption}>{t('patientGridFiltersHeaderFilterCaption', 'Filters:')}</span>

      {filters?.length && columnNameToHeaderLabelMap ? (
        <>
          {originalFilters.map((filter) => (
            <FilterTag key={filter.uuid} filter={filter} columnNameToHeaderLabelMap={columnNameToHeaderLabelMap} />
          ))}
          {localFilters.map((filter) => (
            <FilterTag
              key={`${filter.name}-${filter.operand}`}
              filter={filter}
              columnNameToHeaderLabelMap={columnNameToHeaderLabelMap}
            />
          ))}
        </>
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

interface FilterTagProps {
  filter: LocalFilter;
  columnNameToHeaderLabelMap: Record<string, string>;
}

function FilterTag({ filter, columnNameToHeaderLabelMap }: FilterTagProps) {
  const { t } = useTranslation();
  const isLocalFilter = !('uuid' in filter);
  const filterName = `${columnNameToHeaderLabelMap[filter.columnName] ?? filter.columnName}: ${
    filter.display ?? filter.operand
  }`;

  const { filters } = useContext(InlinePatientGridEditingContext);
  const { push } = useContext(InlinePatientGridEditingContext);
  const handleDelete = () => {
    push((state) => ({
      ...state,
      filters: filters.filter((x) => x.columnName !== filter.columnName && x.operand !== filter.operand),
    }));
  };

  return (
    <Tag
      className={`${styles.filterTag} ${isLocalFilter ? styles.localFilterTag : ''}`}
      size="md"
      type="gray"
      filter={
        isLocalFilter ||
        filter.columnName.includes('formQuestion') ||
        filter.columnName.includes('GENDER') ||
        filter.columnName.includes('ENC_AGE_RANGE')
          ? true
          : false
      }
      title={t('patientGridFiltersHeaderRemoveFilter', 'Remove filter')}
      onClose={handleDelete}>
      {filterName}
    </Tag>
  );
}

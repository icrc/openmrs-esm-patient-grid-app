import React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, ButtonSkeleton, Tag } from '@carbon/react';
import styles from './PatientGridFiltersHeader.scss';
import { PatientGridFilterGet, useDeletePatientGridFilterMutation, useGetAllPatientGridFilters } from '../api';
import { showToast } from '@openmrs/esm-framework';
import { useColumnNameToHeaderLabelMap } from '../grid-utils';

export interface PatientGridFiltersHeaderProps {
  patientGridId: string;
}

export function PatientGridFiltersHeader({ patientGridId }: PatientGridFiltersHeaderProps) {
  const { t } = useTranslation();
  const { data: columnNameToHeaderLabelMap } = useColumnNameToHeaderLabelMap();
  const { data: filters } = useGetAllPatientGridFilters(patientGridId);

  return (
    <Stack as="section" orientation="horizontal" gap={4} className={styles.filtersContainer}>
      <span className={styles.filtersCaption}>{t('patientGridFiltersHeaderFilterCaption', 'Filters:')}</span>

      {filters?.length && columnNameToHeaderLabelMap ? (
        filters.map((filter) => (
          <FilterTag
            key={filter.uuid}
            filter={filter}
            patientGridId={patientGridId}
            columnNameToHeaderLabelMap={columnNameToHeaderLabelMap}
          />
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

interface FilterTagProps {
  filter: PatientGridFilterGet;
  columnNameToHeaderLabelMap: Record<string, string>;
  patientGridId: string;
}

function FilterTag({ filter, columnNameToHeaderLabelMap, patientGridId }: FilterTagProps) {
  const { t } = useTranslation();
  const filterName = `${
    columnNameToHeaderLabelMap[filter.column.display] ?? filter.column.display ?? filter.display
  }: ${filter.operand}`;
  const deleteFilterMutation = useDeletePatientGridFilterMutation(patientGridId);
  const handleDelete = () =>
    deleteFilterMutation.mutate(
      { patientGridId, filterId: filter.uuid },
      {
        onSuccess: () =>
          showToast({
            kind: 'success',
            title: t('deletePatientGridFilterSuccessToastTitle', 'Filter deleted successfully'),
            description: t(
              'deletePatientGridFilterSuccessToastDescription',
              'Successfully deleted the filter "{name}".',
              {
                name: filterName,
              },
            ),
          }),
        onError: () =>
          showToast({
            kind: 'error',
            title: t('deletePatientGridFilterErrorToastTitle', 'Filter deletion failed'),
            description: t('deletePatientGridFilterErrorToastDescription', 'Deleting the filter "{name}" failed.', {
              name: filterName,
            }),
          }),
      },
    );

  return (
    <Tag
      className={styles.filterTag}
      size="md"
      type="gray"
      filter
      title={t('patientGridFiltersHeaderRemoveFilter', 'Remove filter')}
      disabled={deleteFilterMutation.isLoading}
      onClose={handleDelete}>
      {filterName}
    </Tag>
  );
}

import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, ButtonSkeleton, Tag, Modal } from '@carbon/react';
import styles from './PatientGridFiltersHeader.scss';
import { InlinePatientGridEditingContext, LocalFilter } from '../grid-utils';
import { PatientGridGet } from '../api';

export interface PatientGridFiltersHeaderProps {
  patientGridId: string;
  patientGrid: PatientGridGet;
  refreshGrid(): void;
}

export function PatientGridFiltersHeader({ patientGridId, patientGrid, refreshGrid }: PatientGridFiltersHeaderProps) {
  const { t } = useTranslation();
  //  const { data: columnNameToHeaderLabelMap } = useColumnNameToHeaderLabelMap();
  const { filters, saveChanges } = useContext(InlinePatientGridEditingContext);
  const [gridHasPendingChanges, setGridHasPendingChanges] = useState(false);

  // Every filter with a UUID must come from the backend.
  // Those should appear before the local ones.
  const originalFilters = filters.filter((x) => 'uuid' in x);
  const localFilters = filters.filter((x) => !('uuid' in x));

  useEffect(() => {
    if (gridHasPendingChanges) {
      saveChanges().then(() => {
        refreshGrid();
      });
    }
  }, [gridHasPendingChanges, refreshGrid, saveChanges]);

  return (
    <Stack as="section" orientation="horizontal" gap={4} className={styles.filtersContainer}>
      <span className={styles.filtersCaption}>{t('patientGridFiltersHeaderFilterCaption', 'Filters:')}</span>

      {filters?.length ? (
        <>
          {originalFilters.map((filter) => (
            <FilterTag
              key={filter.uuid}
              saveChanges={() => {
                setGridHasPendingChanges(true);
              }}
              filter={filter}
              //columnNameToHeaderLabelMap={columnNameToHeaderLabelMap}
            />
          ))}
          {localFilters.map((filter) => (
            <FilterTag
              key={`${filter.name}-${filter.operand}`}
              filter={filter}
              saveChanges={() => {
                setGridHasPendingChanges(true);
              }}
              //columnNameToHeaderLabelMap={}
            />
          ))}
        </>
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

interface FilterTagProps {
  filter: LocalFilter;
  saveChanges(): void;
}

function FilterTag({ filter, saveChanges }: FilterTagProps) {
  const { t } = useTranslation();
  const isLocalFilter = !('uuid' in filter);
  const filterName = `${filter.columnName ?? filter.columnName}: ${filter.display ?? filter.operand}`;

  const { filters } = useContext(InlinePatientGridEditingContext);
  const { push } = useContext(InlinePatientGridEditingContext);
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async () => {
    await push((state) => ({
      ...state,
      filters: filters.filter((x) => x.columnName !== filter.columnName || x.operand !== filter.operand),
    }));
    push((state) => ({
      ...state,
      isDirty: true,
    }));
    // TODO: Consider whether we should save changes to the server when removing a local filter
    // if (!isLocalFilter) {
    //   saveChanges();
    // }
    saveChanges();
  };

  const handleModal = () => {
    // TODO: Consider whether we should save changes to the server when removing a local filter
    // if (isLocalFilter) {
    //   handleDelete();
    // } else {
    //   setShowModal(true);
    // }
    setShowModal(true);
  };

  const handleClose = () => setShowModal(false);

  return (
    <div>
      <Tag
        className={`${styles.filterTag} ${isLocalFilter ? styles.localFilterTag : ''}`}
        size="md"
        type="gray"
        filter={
          filter.columnName.includes('NAME') ||
          filter.columnName.includes('ENC_COUNTRY') ||
          filter.columnName.includes('ENC_DATE') ||
          filter.columnName.includes('ENC_LOCATION')
            ? false
            : true
        }
        title={t('patientGridFiltersHeaderRemoveFilter', 'Remove filter')}
        onClose={handleModal}>
        {filterName}
      </Tag>

      <Modal
        open={showModal}
        className={styles.filterDeleteModal}
        modalHeading={t('patientGridFiltersHeaderModalHeading', 'Save Grid')}
        modalLabel
        primaryButtonText={t('patientGridFiltersHeaderPrimaryButton', 'Save')}
        secondaryButtonText={t('patientGridFiltersHeaderSecButton', 'Cancel')}
        onRequestClose={handleClose}
        onRequestSubmit={handleDelete}>
        <p>
          {t(
            'patientGridFiltersHeaderModalBody',
            'You removed some filters. Please, save the grid to retrieve all data',
          )}
        </p>
      </Modal>
    </div>
  );
}

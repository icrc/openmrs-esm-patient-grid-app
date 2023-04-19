import React, { useContext, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, ButtonSkeleton, Tag, Modal } from '@carbon/react';
import styles from './PatientGridFiltersHeader.scss';
import { InlinePatientGridEditingContext, LocalFilter } from '../grid-utils';
import { MutateFn, PatientGridGet } from '../api';

export interface PatientGridFiltersHeaderProps {
  patientGridId: string;
  patientGrid: PatientGridGet;
}

export function PatientGridFiltersHeader({ patientGridId, patientGrid }: PatientGridFiltersHeaderProps) {
  const { t } = useTranslation();
  //  const { data: columnNameToHeaderLabelMap } = useColumnNameToHeaderLabelMap();
  const { filters, saveChanges } = useContext(InlinePatientGridEditingContext);

  // Every filter with a UUID must come from the backend.
  // Those should appear before the local ones.
  const originalFilters = filters.filter((x) => 'uuid' in x);
  const localFilters = filters.filter((x) => !('uuid' in x));

  return (
    <Stack as="section" orientation="horizontal" gap={4} className={styles.filtersContainer}>
      <span className={styles.filtersCaption}>{t('patientGridFiltersHeaderFilterCaption', 'Filters:')}</span>

      {filters?.length ? (
        <>
          {originalFilters.map((filter) => (
            <FilterTag
              key={filter.uuid}
              saveChanges={saveChanges}
              filter={filter}
              //columnNameToHeaderLabelMap={columnNameToHeaderLabelMap}
            />
          ))}
          {localFilters.map((filter) => (
            <FilterTag
              key={`${filter.name}-${filter.operand}`}
              filter={filter}
              saveChanges={saveChanges}
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
  saveChanges: MutateFn<void, unknown, Error>;
  //columnNameToHeaderLabelMap: Record<string, string>;
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
      filters: filters.filter((x) => x.columnName !== filter.columnName && x.operand !== filter.operand),
    }));
    await saveChanges();
  };

  const handleModal = () => {
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

import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { useGetPatientGrid } from '../api';
import { InlinePatientGridEditingContext } from '../grid-utils';
import { PatientGridDetailsParams } from '../routes';
import { Button, Search, Layer, Stack } from '@carbon/react';
import { Download, OpenPanelRight, Renew, WarningAltFilled } from '@carbon/react/icons';
import styles from './PatientGridHeader.scss';

export interface PatientGridHeaderProps {
  showReloadGrid: boolean;
  onFilterChange(filter: string): void;
  onShowToggleColumnsSidePanelClick(): void;
  onRefreshPatientGridClick(): void;
  onDownloadClick(): void;
}

export function PatientGridHeader({
  showReloadGrid,
  onFilterChange,
  onShowToggleColumnsSidePanelClick,
  onRefreshPatientGridClick,
  onDownloadClick,
}: PatientGridHeaderProps) {
  const { t } = useTranslation();
  const { id: patientGridId } = useParams<PatientGridDetailsParams>();
  const { data: patientGrid } = useGetPatientGrid(patientGridId);
  const { localPatientGridState } = useContext(InlinePatientGridEditingContext);

  return (
    <section className={styles.tableHeaderContainer}>
      {showReloadGrid && (
        <Stack className={styles.reloadContainer} orientation="horizontal" gap={3}>
          <WarningAltFilled className={styles.reloadWarningIcon} />
          <span className={styles.reloadMessage}>
            {t('patientGridReloadWarning', 'The list contains changes that are not visible.')}
          </span>
          <Button size="sm" kind="ghost" renderIcon={Renew} onClick={onRefreshPatientGridClick}>
            {t('patientGridReloadButton', 'Reload')}
          </Button>
        </Stack>
      )}
      <Button size="sm" kind="ghost" renderIcon={Download} onClick={onDownloadClick}>
        {t('patientGridDownloadButton', 'Download')}
      </Button>
      <Button size="sm" kind="ghost" renderIcon={OpenPanelRight} onClick={onShowToggleColumnsSidePanelClick}>
        {t('patientGridColumnsButton', 'Columns ({actual}/{total})', {
          actual: Object.values(localPatientGridState.columnHiddenStates).filter((x) => !x).length,
          total: patientGrid?.columns.length,
        })}
      </Button>
      <Layer className={styles.tableSearchLayer}>
        <Search
          size="sm"
          placeholder={t('patientGridSearchPlaceholder', 'Search')}
          labelText={t('patientGridSearchLabel', 'Search')}
          onChange={(e) => onFilterChange(e.target.value)}
        />
      </Layer>
    </section>
  );
}

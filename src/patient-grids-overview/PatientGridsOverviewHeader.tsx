import React from 'react';
import { Button } from '@carbon/react';
import { Add } from '@carbon/react/icons';
import { PageHeader } from '../components';
import styles from './PatientGridsOverviewHeader.scss';
import { useTranslation } from 'react-i18next';

export interface PatientGridsOverviewHeaderProps {
  onNewGridClick?(): void;
}

export function PatientGridsOverviewHeader({ onNewGridClick }: PatientGridsOverviewHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={<h1 className={styles.title}>{t('patientGridsOverviewTitle', 'Patient grids')}</h1>}
      actions={
        <Button kind="ghost" size="sm" renderIcon={Add} onClick={onNewGridClick}>
          {t('newGrid', 'New grid')}
        </Button>
      }
    />
  );
}

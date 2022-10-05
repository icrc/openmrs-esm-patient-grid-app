import React from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components';
import { Button, ButtonSkeleton, OverflowMenu, OverflowMenuItem, SkeletonText } from '@carbon/react';
import { Save } from '@carbon/react/icons';
import styles from './PatientGridDetailsHeader.scss';
import { useGetPatientGrid, useGetPatientGridReport } from '../api';
import { useParams } from 'react-router-dom';
import { PatientGridDetailsParams } from '../routes';

export interface PatientGridDetailsHeaderProps {
  onEditClick?(): void;
  onDeleteClick?(): void;
}

export function PatientGridDetailsHeader({ onEditClick, onDeleteClick }: PatientGridDetailsHeaderProps) {
  const { t } = useTranslation();
  const { id: patientGridId } = useParams<PatientGridDetailsParams>();
  const { data: patientGrid } = useGetPatientGrid(patientGridId);
  const { data: patientGridReport } = useGetPatientGridReport(patientGridId);

  return (
    <PageHeader
      title={
        <h1 className={styles.title}>
          {patientGrid ? (
            patientGrid?.description ?? patientGrid?.name ?? t('patientGridDetailsHeaderTitleFallback', '--')
          ) : (
            <SkeletonText width="30%" />
          )}
        </h1>
      }
      subTitle={
        patientGridReport ? (
          <span className={styles.subTitle}>{patientGridReport.report.length} patients</span>
        ) : (
          <SkeletonText width="30%" />
        )
      }
      actions={
        patientGrid ? (
          <>
            <Button kind="ghost" size="md" renderIcon={Save}>
              {t('patientGridDetailsHeaderSaveChanges', 'Save changes')}
            </Button>
            <OverflowMenu ariaLabel={t('patientGridDetailsHeaderActionsLabel', 'Actions')} size="md" flipped>
              <OverflowMenuItem
                itemText={t('patientGridDetailsHeaderEditNameDescriptionMenuItem', 'Edit name / description')}
                onClick={onEditClick}
              />
              <OverflowMenuItem
                isDelete
                itemText={t('patientGridDetailsHeaderDeleteGridMenuItem', 'Delete')}
                onClick={onDeleteClick}
              />
            </OverflowMenu>
          </>
        ) : (
          <ButtonSkeleton small />
        )
      }
    />
  );
}

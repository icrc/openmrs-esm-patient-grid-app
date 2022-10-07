import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components';
import { Button, ButtonSkeleton, OverflowMenu, OverflowMenuItem, SkeletonText } from '@carbon/react';
import { Save, Undo, Redo } from '@carbon/react/icons';
import styles from './PatientGridDetailsHeader.scss';
import { useGetPatientGrid, useGetPatientGridReport } from '../api';
import { useParams } from 'react-router-dom';
import { PatientGridDetailsParams } from '../routes';
import { InlinePatientGridEditingContext } from '../grid-utils';
import { useSession } from '@openmrs/esm-framework';

export interface PatientGridDetailsHeaderProps {
  canEdit?: boolean;
  canDelete?: boolean;
  onEditClick?(): void;
  onRefreshGridClick?(): void;
  onDeleteClick?(): void;
}

export function PatientGridDetailsHeader({
  canEdit,
  canDelete,
  onEditClick,
  onRefreshGridClick,
  onDeleteClick,
}: PatientGridDetailsHeaderProps) {
  const { t } = useTranslation();
  const session = useSession();
  const { id: patientGridId } = useParams<PatientGridDetailsParams>();
  const { data: patientGrid } = useGetPatientGrid(patientGridId);
  const { data: patientGridReport } = useGetPatientGridReport(patientGridId);
  const { canUndo, canRedo, undo, redo, saveChanges, isSavingChanges, canSaveChanges } = useContext(
    InlinePatientGridEditingContext,
  );

  const handleSaveClick = async () => {
    // TODO: Error handling.
    await saveChanges();
  };

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
            <Button kind="ghost" size="md" renderIcon={Undo} disabled={!canUndo} onClick={undo}>
              {t('patientGridDetailsHeaderUndo', 'Undo')}
            </Button>
            <Button kind="ghost" size="md" renderIcon={Redo} disabled={!canRedo} onClick={redo}>
              {t('patientGridDetailsHeaderRedo', 'Redo')}
            </Button>
            <Button
              kind="ghost"
              size="md"
              renderIcon={Save}
              disabled={patientGrid.owner?.uuid !== session.user?.uuid || !canSaveChanges || isSavingChanges}
              onClick={handleSaveClick}>
              {t('patientGridDetailsHeaderSaveChanges', 'Save changes')}
            </Button>
            <OverflowMenu ariaLabel={t('patientGridDetailsHeaderActionsLabel', 'Actions')} size="md" flipped>
              <OverflowMenuItem
                itemText={t('patientGridDetailsHeaderEditNameDescriptionMenuItem', 'Edit name / description')}
                disabled={!canEdit}
                onClick={onEditClick}
              />
              <OverflowMenuItem
                itemText={t('patientGridDetailsHeaderRefreshGridMenuItem', 'Reload grid')}
                onClick={onRefreshGridClick}
              />
              <OverflowMenuItem
                isDelete
                itemText={t('patientGridDetailsHeaderDeleteGridMenuItem', 'Delete')}
                disabled={!canDelete}
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

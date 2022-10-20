import React, { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '../components';
import { Button, ButtonSkeleton, OverflowMenu, OverflowMenuItem, SkeletonText } from '@carbon/react';
import { Redo, Save, Undo } from '@carbon/react/icons';
import styles from './PatientGridDetailsHeader.scss';
import { PatientGridGet, useGetPatientGrid, useGetPatientGridReport } from '../api';
import { useParams } from 'react-router-dom';
import { PatientGridDetailsParams } from '../routes';
import { InlinePatientGridEditingContext } from '../grid-utils';
import { showToast, useSession } from '@openmrs/esm-framework';

export interface PatientGridDetailsHeaderProps {
  onRefreshGridClick(): void;

  onEditClick(patientGrid: PatientGridGet): void;

  onDeleteClick(patientGrid: PatientGridGet): void;
}

export function PatientGridDetailsHeader({
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
  const canEdit = session.user?.uuid === patientGrid?.owner?.uuid;
  const canDelete = session.user?.uuid === patientGrid?.owner?.uuid;

  const handleSaveClick = async () => {
    await saveChanges(undefined, {
      onSuccess: () => {
        showToast({
          kind: 'success',
          title: t('patientGridDetailsHeaderSaveSuccessToastTitle', 'Grid saved successfully'),
          description: t(
            'patientGridDetailsHeaderSaveSuccessToastDescription',
            'Successfully saved the grid "{name}".',
            {
              name: patientGrid?.name,
            },
          ),
        });
      },
      onError: () =>
        showToast({
          kind: 'error',
          title: t('patientGridDetailsHeaderSaveErrorToastTitle', 'Grid saving failed'),
          description: t('patientGridDetailsHeaderSaveErrorToastDescription', 'Saving the grid "{name}" failed.', {
            name: patientGrid?.name,
          }),
        }),
    });
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
                onClick={() => onEditClick(patientGrid)}
              />
              <OverflowMenuItem
                itemText={t('patientGridDetailsHeaderRefreshGridMenuItem', 'Reload grid')}
                onClick={onRefreshGridClick}
              />
              <OverflowMenuItem
                isDelete
                itemText={t('patientGridDetailsHeaderDeleteGridMenuItem', 'Delete')}
                disabled={!canDelete}
                onClick={() => onDeleteClick(patientGrid)}
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

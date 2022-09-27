import React from 'react';
import { useTranslation } from 'react-i18next';
import { SidePanel, SidePanelProps } from '../components';
import { ModalFooter } from '@carbon/react';
import styles from './PatientGridBuilderSidePanel.scss';
import { usePatientGridWizard } from './usePatientGridWizard';
import { useCreatePatientGridMutation } from '../api';
import { showToast } from '@openmrs/esm-framework';

export type PatientGridBuilderSidePanelProps = Pick<SidePanelProps, 'onClose'>;

export function PatientGridBuilderSidePanel({ onClose }: PatientGridBuilderSidePanelProps) {
  const { t } = useTranslation();
  const { currentPage, isAtLastPage, isStateValidForSubmission, createPostBody, state } = usePatientGridWizard();
  const { isLoading: isSubmitting, mutate } = useCreatePatientGridMutation();

  const submit = async () => {
    const body = await createPostBody();
    await mutate(
      { body },
      {
        onSuccess: () => {
          showToast({
            kind: 'success',
            title: t('patientGridSidePanelSuccessToastTitle', 'Grid created successfully'),
            description: t('patientGridSidePanelSuccessToastDescription', 'Successfully created the grid "{name}".', {
              name: state.name,
            }),
          });
          onClose();
        },
        onError: (e) => {
          showToast({
            kind: 'error',
            title: t('patientGridSidePanelErrorToastTitle', 'Grid creation failed'),
            description: t('patientGridSidePanelErrorToastDescription', 'Creating the grid "{name}" failed.', {
              name: state.name,
            }),
          });
        },
      },
    );
  };

  return (
    <SidePanel
      title={t('newPatientGridSidePanelTitle', 'New patient grid')}
      footer={
        <ModalFooter
          primaryButtonText={t('patientGridSidePanelCreate', 'Create grid')}
          secondaryButtonText={
            isSubmitting ? t('patientGridSidePanelClose', 'Close') : t('patientGridSidePanelCancel', 'Cancel')
          }
          onRequestClose={onClose}
          onRequestSubmit={submit}
          primaryButtonDisabled={!isAtLastPage || !isStateValidForSubmission || isSubmitting}
        />
      }
      onClose={onClose}>
      <section className={styles.contentContainer}>{currentPage}</section>
    </SidePanel>
  );
}

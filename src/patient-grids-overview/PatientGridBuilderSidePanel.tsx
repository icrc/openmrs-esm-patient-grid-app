import React from 'react';
import { useTranslation } from 'react-i18next';
import { SidePanel, SidePanelProps } from '../components';
import { ModalFooter } from '@carbon/react';
import styles from './PatientGridBuilderSidePanel.scss';
import { usePatientGridWizard } from './usePatientGridWizard';

export type PatientGridBuilderSidePanelProps = Pick<SidePanelProps, 'onClose'>;

export function PatientGridBuilderSidePanel({ onClose }: PatientGridBuilderSidePanelProps) {
  const { t } = useTranslation();
  const { currentPage, isAtLastPage, isStateValidForSubmission, state } = usePatientGridWizard();

  const submit = () => {
    // TODO: Perform real logic/mutations here.
    console.info('Submitting new patient grid...', state);
    onClose();
  };

  return (
    <SidePanel
      title={t('newPatientGridSidePanelTitle', 'New patient grid')}
      footer={
        <ModalFooter
          primaryButtonText={t('patientGridSidePanelCreate', 'Create grid')}
          secondaryButtonText={t('patientGridSidePanelCancel', 'Cancel')}
          onRequestClose={onClose}
          onRequestSubmit={submit}
          primaryButtonDisabled={!isAtLastPage || !isStateValidForSubmission}
        />
      }
      onClose={onClose}>
      <section className={styles.contentContainer}>{currentPage}</section>
    </SidePanel>
  );
}

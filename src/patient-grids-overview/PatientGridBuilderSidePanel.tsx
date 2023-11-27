import React from 'react';
import { useTranslation } from 'react-i18next';
import { SidePanel, SidePanelProps } from '../components';
import { ModalFooter, SkeletonText } from '@carbon/react';
import styles from './PatientGridBuilderSidePanel.scss';
import { usePatientGridWizard } from './usePatientGridWizard';
import { useCreatePatientGridMutation, useFormSchemasOfForms, useGetAllPublishedPrivilegeFilteredForms } from '../api';
import { navigate, showToast } from '@openmrs/esm-framework';
import { routes } from '../routes';

export type PatientGridBuilderSidePanelProps = Pick<SidePanelProps, 'onClose'>;

export function PatientGridBuilderSidePanel({ onClose }: PatientGridBuilderSidePanelProps) {
  const { t } = useTranslation();
  const { data: forms } = useGetAllPublishedPrivilegeFilteredForms();
  const { data: formSchemas } = useFormSchemasOfForms(forms);
  const { currentPage, isAtLastPage, isStateValidForSubmission, createPostBody, state } =
    usePatientGridWizard(formSchemas);
  const { isLoading: isSubmitting, mutate } = useCreatePatientGridMutation();

  const submit = async () => {
    await mutate(
      { body: createPostBody() },
      {
        onSuccess: (result) => {
          showToast({
            kind: 'success',
            title: t('patientGridSidePanelSuccessToastTitle', 'Grid created successfully'),
            description: t('patientGridSidePanelSuccessToastDescription', 'Successfully created the grid "{{name}}".', {
              name: state.name,
            }),
          });
          onClose();
          navigate({ to: `\${openmrsSpaBase}${routes.patientGridDetails.interpolate({ id: result.uuid })}` });
        },
        onError: (e) => {
          console.error('Error while creating patient grid: ', e);
          showToast({
            kind: 'error',
            title: t('patientGridSidePanelErrorToastTitle', 'Grid creation failed'),
            description: t('patientGridSidePanelErrorToastDescription', 'Creating the grid "{{name}}" failed.', {
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
      <section className={styles.contentContainer}>{formSchemas ? currentPage : <SkeletonText paragraph />}</section>
    </SidePanel>
  );
}

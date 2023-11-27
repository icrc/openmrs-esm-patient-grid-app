import React, { Dispatch, SetStateAction } from 'react';
import { Modal } from '@carbon/react';
import { PatientGridGet, useDeletePatientGridMutation } from '../api';
import { useTranslation } from 'react-i18next';
import { showToast } from '@openmrs/esm-framework';

export interface DeletePatientGridModalProps {
  patientGridToDelete?: PatientGridGet;
  setPatientGridToDelete?: Dispatch<SetStateAction<PatientGridGet | undefined>>;
  onDeleted?(): void;
}

export function DeletePatientGridModal({
  patientGridToDelete,
  setPatientGridToDelete,
  onDeleted,
}: DeletePatientGridModalProps) {
  const { t } = useTranslation();
  const { mutate, isLoading } = useDeletePatientGridMutation();
  const submit = () => {
    mutate(
      { id: patientGridToDelete.uuid },
      {
        onSuccess: () => {
          showToast({
            kind: 'success',
            title: t('deletePatientGridSuccessToastTitle', 'Grid deleted successfully'),
            description: t('deletePatientGridSuccessToastDescription', 'Successfully deleted the grid "{{name}}".', {
              name: patientGridToDelete?.name,
            }),
          });

          setPatientGridToDelete(undefined);
          onDeleted?.();
        },
        onError: () =>
          showToast({
            kind: 'error',
            title: t('deletePatientGridErrorToastTitle', 'Grid deletion failed'),
            description: t('deletePatientGridErrorToastDescription', 'Deleting the grid "{{name}}" failed.', {
              name: patientGridToDelete?.name,
            }),
          }),
      },
    );
  };

  return (
    <Modal
      open={!!patientGridToDelete}
      danger
      modalHeading={t('deletePatientGridModalTitle', 'Delete grid')}
      primaryButtonText={t('deletePatientGridModalDelete', 'Delete')}
      secondaryButtonText={
        isLoading ? t('deletePatientGridModalClose', 'Close') : t('deletePatientGridModalCancel', 'Cancel')
      }
      primaryButtonDisabled={isLoading}
      onRequestSubmit={() => submit()}
      onRequestClose={() => setPatientGridToDelete(undefined)}>
      <p>
        {t(
          'deletePatientGridModalBody',
          'Are you sure that you want to delete the grid "{name}"? This action cannot be undone.',
          { name: patientGridToDelete?.name },
        )}
      </p>
    </Modal>
  );
}

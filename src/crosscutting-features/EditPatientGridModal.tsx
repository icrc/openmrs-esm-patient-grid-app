import { showToast } from '@openmrs/esm-framework';
import React, { Dispatch, SetStateAction } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, TextInput, TextArea, Stack } from '@carbon/react';
import { PatientGridGet, useEditPatientGridMutation } from '../api';

export interface EditPatientGridModalProps {
  patientGridToEdit?: PatientGridGet;
  setPatientGridToEdit?: Dispatch<SetStateAction<PatientGridGet | undefined>>;
}

export function EditPatientGridModal({ patientGridToEdit, setPatientGridToEdit }: EditPatientGridModalProps) {
  const { t } = useTranslation();
  const { mutate, isLoading } = useEditPatientGridMutation();
  const submit = () => {
    mutate(
      { id: patientGridToEdit.uuid, body: undefined },
      {
        onSuccess: () => {
          showToast({
            kind: 'success',
            title: t('editPatientGridSuccessToastTitle', 'Grid edited successfully'),
            description: t('editPatientGridSuccessToastDescription', 'Successfully edited the grid "{name}".', {
              name: patientGridToEdit?.name,
            }),
          });

          setPatientGridToEdit(undefined);
        },
        onError: () =>
          showToast({
            kind: 'error',
            title: t('editPatientGridErrorToastTitle', 'Grid editing failed'),
            description: t('editPatientGridErrorToastDescription', 'Editing the grid "{name}" failed.', {
              name: patientGridToEdit?.name,
            }),
          }),
      },
    );
  };

  return (
    <Modal
      open={!!patientGridToEdit}
      danger
      modalHeading={t('editPatientGridModalTitle', 'Edit name / description')}
      primaryButtonText={t('editPatientGridModalSave', 'Save changes')}
      secondaryButtonText={
        isLoading ? t('editPatientGridModalClose', 'Close') : t('editPatientGridModalCancel', 'Cancel')
      }
      primaryButtonDisabled={isLoading}
      onRequestSubmit={() => submit()}
      onRequestClose={() => setPatientGridToEdit(undefined)}>
      <Stack gap={6}>
        <TextInput id="gridName" labelText={t('editPatientGridModalNameInputLabel', 'Grid name')} />
        <TextArea
          id="gridDescription"
          enableCounter
          maxCount={300}
          labelText={t('editPatientGridModalDescriptionInputLabel', 'Describe the purpose of this grid in a few words')}
        />
      </Stack>
    </Modal>
  );
}

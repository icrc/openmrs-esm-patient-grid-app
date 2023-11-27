import { showToast } from '@openmrs/esm-framework';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, TextInput, TextArea, Stack, Checkbox } from '@carbon/react';
import { PatientGridGet, useEditPatientGridMutation } from '../api';

export interface EditPatientGridModalProps {
  patientGridToEdit?: PatientGridGet;
  setPatientGridToEdit?: Dispatch<SetStateAction<PatientGridGet | undefined>>;
}

export function EditPatientGridModal({ patientGridToEdit, setPatientGridToEdit }: EditPatientGridModalProps) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [shared, setShared] = useState(false);
  const isValidSubmissionResult = !!name.trim().length;
  const { mutate, isLoading } = useEditPatientGridMutation();
  const submit = () => {
    mutate(
      { id: patientGridToEdit.uuid, body: { name, description, shared } },
      {
        onSuccess: () => {
          showToast({
            kind: 'success',
            title: t('editPatientGridSuccessToastTitle', 'Grid edited successfully'),
            description: t('editPatientGridSuccessToastDescription', 'Successfully edited the grid "{{name}}".', {
              name: patientGridToEdit?.name,
            }),
          });

          setPatientGridToEdit(undefined);
        },
        onError: () =>
          showToast({
            kind: 'error',
            title: t('editPatientGridErrorToastTitle', 'Grid editing failed'),
            description: t('editPatientGridErrorToastDescription', 'Editing the grid "{{name}}" failed.', {
              name: patientGridToEdit?.name,
            }),
          }),
      },
    );
  };

  useEffect(() => {
    if (patientGridToEdit) {
      setName(patientGridToEdit.name);
      setDescription(patientGridToEdit.description);
      setShared(patientGridToEdit.shared ?? false);
    }
  }, [patientGridToEdit]);

  return (
    <Modal
      open={!!patientGridToEdit}
      modalHeading={t('editPatientGridModalTitle', 'Edit name / description')}
      primaryButtonText={t('editPatientGridModalSave', 'Save changes')}
      secondaryButtonText={
        isLoading ? t('editPatientGridModalClose', 'Close') : t('editPatientGridModalCancel', 'Cancel')
      }
      primaryButtonDisabled={isLoading || !isValidSubmissionResult}
      shouldSubmitOnEnter={false}
      onRequestSubmit={() => submit()}
      onRequestClose={() => setPatientGridToEdit(undefined)}>
      <Stack gap={6}>
        <TextInput
          id={`${patientGridToEdit?.uuid}-edit-name`}
          labelText={t('editPatientGridModalNameInputLabel', 'Grid name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextArea
          id={`${patientGridToEdit?.uuid}-edit-description`}
          enableCounter
          maxCount={300}
          labelText={t('editPatientGridModalDescriptionInputLabel', 'Describe the purpose of this grid in a few words')}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Checkbox
          id={`${patientGridToEdit?.uuid}-edit-shared`}
          labelText={t('patientGridDetailsShareGridCheckboxLabel', 'Share this grid with others')}
          checked={shared}
          onChange={(_, { checked }) => setShared(checked)}
        />
      </Stack>
    </Modal>
  );
}

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, RadioButtonGroup, RadioButton } from '@carbon/react';
import { DownloadGridMutationArgs, useDownloadGridMutation } from '../api';
import { showToast } from '@openmrs/esm-framework';

export interface DownloadModalProps {
  isOpen: boolean;
  downloadGridMutationArgs?: Omit<DownloadGridMutationArgs, 'fileName'>;
  onClose(): void;
}

export function DownloadModal({ isOpen, downloadGridMutationArgs, onClose }: DownloadModalProps) {
  const { t } = useTranslation();
  const { isLoading, mutate } = useDownloadGridMutation();
  const [fileExtension, setFileExtension] = useState<string | undefined>(undefined);
  const modalPropsForSteps = {
    internalExternal: {
      danger: true,
      modalHeading: t('downloadModalInternalExternalHeading', 'Shared ICRC internally?'),
      modalBody: (
        <p>{t('downloadModalInternalExternalBody', 'Is the data extracted shared EXCLUSIVELY within the ICRC?')}</p>
      ),
      primaryButtonText: t('downloadModalInternalExternalSecondaryButtonText', 'No (external transfer)'),
      secondaryButtonText: t('downloadModalInternalExternalPrimaryButtonText', 'Yes (only ICRC internal)'),
      onRequestSubmit() {
        setStepKey('externalConfirmation');
      },
      onSecondarySubmit() {
        setStepKey('confirmDownload');
      },
    },

    externalConfirmation: {
      danger: false,
      modalHeading: t('downloadModalExternalConfirmationHeading', 'Please note'),
      modalBody: (
        <p>
          {t(
            'downloadModalExternalConfirmationBody',
            'Under the ICRC rules on data protection, you are required to minimize the amount of personal data that is to be transferred outside of ICRC. You must edit the spreadsheet to ensure data minimization before sharing.',
          )}
        </p>
      ),
      primaryButtonText: t('downloadModalExternalConfirmationPrimaryButtonText', 'Proceed'),
      secondaryButtonText: t('downloadModalExternalConfirmationSecondaryButtonText', 'Cancel'),
      onRequestSubmit() {
        setStepKey('confirmDownload');
      },
      onSecondarySubmit() {
        onClose();
      },
    },

    confirmDownload: {
      danger: false,
      modalHeading: t('downloadModalDownloadingHeading', 'Download data as file'),
      modalBody: (
        <RadioButtonGroup
          legendText={t(
            'downloadModalDownloadingLegend',
            'Select the file format that you want the data to be converted to',
          )}
          name="file-extension-group"
          defaultSelected={fileExtension}
          orientation="vertical"
          onChange={(value) => setFileExtension(value)}>
          <RadioButton
            labelText={t('downloadModalDownloadingCsvOption', 'CSV (Comma-Separated Values)')}
            value="csv"
            id="csv"
          />
          <RadioButton
            labelText={t('downloadModalDownloadingXlsxOption', 'XLSX (Microsoft Excel)')}
            value="xlsx"
            id="xlsx"
          />
        </RadioButtonGroup>
      ),
      primaryButtonText: isLoading
        ? t('downloadModalDownloadingPrimaryButtonTextDownloading', 'Converting...')
        : t('downloadModalDownloadingPrimaryButtonTextConvert', 'Convert & Download'),
      secondaryButtonText: isLoading
        ? t('downloadModalDownloadingSecondaryButtonTextClose', 'Close')
        : t('downloadModalDownloadingSecondaryButtonTextCancel', 'Cancel'),
      onRequestSubmit() {
        mutate(
          {
            ...downloadGridMutationArgs,
            fileName: t('patientGridExportFileName', 'export.{extension}', { extension: fileExtension }),
          },
          {
            async onSuccess() {
              onClose();
            },
            onError(e) {
              showToast({
                title: t('downloadModalErrorToastTitle', 'Downloading failed'),
                description: t(
                  'downloadModalErrorToastDescription',
                  'An unexpected error occured while attempting to convert and download the data.',
                ),
                kind: 'error',
              });
            },
          },
        );
      },
      onSecondarySubmit() {
        onClose();
      },
    },
  };
  const [stepKey, setStepKey] = useState<keyof typeof modalPropsForSteps>('internalExternal');
  const step = modalPropsForSteps[stepKey];

  useEffect(() => {
    // Reset to the first step whenever the modal is newly open.
    if (isOpen) {
      setStepKey('internalExternal');
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      danger={step.danger}
      modalHeading={step.modalHeading}
      primaryButtonText={step.primaryButtonText}
      secondaryButtonText={step.secondaryButtonText}
      primaryButtonDisabled={isLoading || (!fileExtension && stepKey === 'confirmDownload')}
      onRequestSubmit={() => step.onRequestSubmit()}
      onSecondarySubmit={() => step.onSecondarySubmit()}
      onRequestClose={onClose}>
      {step.modalBody}
    </Modal>
  );
}

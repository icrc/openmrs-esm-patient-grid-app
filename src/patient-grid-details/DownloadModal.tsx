import React, { useContext, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, RadioButtonGroup, RadioButton } from '@carbon/react';
import { DownloadGridData, useDownloadGridData } from '../api';
import { getPatientGridDownloadReportData, InlinePatientGridEditingContext, LocalFilter } from '../grid-utils';
import xlsx from 'xlsx';

export interface DownloadModalProps {
  patientGridId: string;
  isOpen: boolean;
  onClose(): void;
  refreshGrid?(): void;
  filters: Array<LocalFilter>;
}

export function DownloadModal({ patientGridId, isOpen, onClose, refreshGrid, filters }: DownloadModalProps) {
  const { t } = useTranslation();
  const [fileExtension, setFileExtension] = useState<string | undefined>(undefined);
  const [hasDownloadStarted, setHasDownloadStarted] = useState(false);
  const { saveChanges } = useContext(InlinePatientGridEditingContext);
  const handleDownloadPrepared = async ({
    download,
    patientGrid,
    forms,
    formSchemas,
    columnNamesToInclude,
    patientDetailsGroupHeader,
  }: Omit<DownloadGridData, 'fileName'>) => {
    const fileName = t('patientGridExportFileName', 'export.{extension}', { extension: fileExtension });
    const spreadsheetData = getPatientGridDownloadReportData(
      download,
      patientGrid,
      forms,
      formSchemas,
      columnNamesToInclude,
      patientDetailsGroupHeader,
      filters,
    );

    const wb = xlsx.utils.book_new();

    spreadsheetData.forEach((encounter) => {
      const sheet = xlsx.utils.json_to_sheet(encounter.data, { skipHeader: true });
      xlsx.utils.book_append_sheet(wb, sheet, encounter.header);
    });

    xlsx.writeFile(wb, fileName);
    await saveHandler();
    onClose();
  };
  const saveHandler = async () => {
    await saveChanges().then(() => {
      refreshGrid();
    });
  };

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
        setStepKey('chooseDownload');
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
        setStepKey('chooseDownload');
      },
      onSecondarySubmit() {
        onClose();
      },
    },

    chooseDownload: {
      danger: false,
      modalHeading: t('downloadModalChooseDownloadHeading', 'Download data as file'),
      modalBody: hasDownloadStarted ? (
        <PrepareDownload patientGridId={patientGridId} onDownloadPrepared={handleDownloadPrepared} />
      ) : (
        <RadioButtonGroup
          legendText={t(
            'downloadModalChooseDownloadLegend',
            'Select the file format that you want the data to be converted to',
          )}
          name="file-extension-group"
          defaultSelected={fileExtension}
          orientation="vertical"
          onChange={(value) => setFileExtension(value)}>
          <RadioButton
            labelText={t('downloadModalChooseDownloadCsvOption', 'CSV (Comma-Separated Values)')}
            value="csv"
            id="csv"
          />
          <RadioButton
            labelText={t('downloadModalChooseDownloadXlsxOption', 'XLSX (Microsoft Excel)')}
            value="xlsx"
            id="xlsx"
          />
        </RadioButtonGroup>
      ),
      primaryButtonText: hasDownloadStarted
        ? t('downloadModalChooseDownloadPrimaryButtonTextDownloading', 'Converting...')
        : t('downloadModalChooseDownloadPrimaryButtonTextConvert', 'Convert & Download'),
      secondaryButtonText: t('downloadModalChooseDownloadSecondaryButtonTextCancel', 'Cancel'),
      onRequestSubmit() {
        setHasDownloadStarted(true);
      },
      onSecondarySubmit() {
        onClose();
      },
    },
  };
  const [stepKey, setStepKey] = useState<keyof typeof modalPropsForSteps>('internalExternal');
  const step = modalPropsForSteps[stepKey];

  useEffect(() => {
    // Reset to the first step whenever the modal is newly opened.
    if (isOpen) {
      setStepKey('internalExternal');
      setHasDownloadStarted(false);
      setFileExtension(undefined);
    }
  }, [isOpen]);

  return (
    <Modal
      open={isOpen}
      danger={step.danger}
      modalHeading={step.modalHeading}
      primaryButtonText={step.primaryButtonText}
      secondaryButtonText={step.secondaryButtonText}
      primaryButtonDisabled={hasDownloadStarted || (!fileExtension && stepKey === 'chooseDownload')}
      onRequestSubmit={() => step.onRequestSubmit()}
      onSecondarySubmit={() => step.onSecondarySubmit()}
      onRequestClose={onClose}>
      {step.modalBody}
    </Modal>
  );
}

interface PrepareDownloadProps {
  patientGridId: string;
  onDownloadPrepared(data: Omit<DownloadGridData, 'fileName'>): void;
}

function PrepareDownload({ patientGridId, onDownloadPrepared }: PrepareDownloadProps) {
  const { t } = useTranslation();
  const { data, error, isValidating } = useDownloadGridData(patientGridId);
  const triggered = useRef(false);

  useEffect(() => {
    if (data && !triggered.current && !isValidating) {
      triggered.current = true;
      onDownloadPrepared(data);
    }
  }, [data, error, isValidating, onDownloadPrepared]);

  return (
    <p>
      {error
        ? t(
            'downloadModalChooseDownloadError',
            'There was an error while preparing the download. You can close this modal and try again.',
          )
        : t(
            'downloadModalChooseDownloadDownloadingMessage',
            "Preparing your download... This may take some time. Please don't close or reload this browser window.",
          )}
    </p>
  );
}

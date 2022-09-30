import { ExtensionSlot, showToast } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { Hr, PageWithSidePanel } from '../components';
import { PatientGridDetailsHeader } from './PatientGridDetailsHeader';
import { Stack } from '@carbon/react';
import styles from './PatientGridDetails.scss';
import { PatientGridFiltersHeader } from './PatientGridFiltersHeader';
import { PatientGrid } from './PatientGrid';
import { DeletePatientGridModal, EditPatientGridModal } from '../crosscutting-features';
import { PatientGridGet, useGetPatientGrid } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { PatientGridDetailsParams, routes } from '../routes';
import { PatientGridReportLoadingIndicator } from './PatientGridReportLoadingIndicator';
import { usePatientGrid } from './usePatientGrid';
import { useTranslation } from 'react-i18next';

export function PatientGridDetails() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patientGridToDelete, setPatientGridToDelete] = useState<PatientGridGet | undefined>(undefined);
  const [patientGridToEdit, setPatientGridToEdit] = useState<PatientGridGet | undefined>(undefined);
  const { id: patientGridId } = useParams<PatientGridDetailsParams>();
  const { data: patientGrid } = useGetPatientGrid(patientGridId);
  const { data, error } = usePatientGrid(patientGridId);

  useEffect(() => {
    if (error) {
      showToast({
        title: t('patientGridErrorToastTitle', 'Patient grid loading failed'),
        description: t('patientGridErrorToastDescription', 'There was an error while loading the patient grid.'),
        kind: 'error',
      });
    }
  }, [t, error]);

  if (!data) {
    return <PatientGridReportLoadingIndicator />;
  }

  return (
    <PageWithSidePanel>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      <Hr />

      <Stack gap={4}>
        <div className={styles.headerContainer}>
          <PatientGridDetailsHeader
            onEditClick={() => setPatientGridToEdit(patientGrid)}
            onDeleteClick={() => setPatientGridToDelete(patientGrid)}
          />
        </div>
        <Hr />

        <div className={styles.headerContainer}>
          <PatientGridFiltersHeader patientGridId={patientGridId} />
        </div>

        <div className={styles.gridContainer}>
          <PatientGrid columns={data?.columns ?? []} data={data?.data ?? []} />
        </div>
      </Stack>

      <EditPatientGridModal patientGridToEdit={patientGridToEdit} setPatientGridToEdit={setPatientGridToEdit} />
      <DeletePatientGridModal
        patientGridToDelete={patientGridToDelete}
        setPatientGridToDelete={setPatientGridToDelete}
        onDeleted={() => navigate(routes.patientGridsOverview.interpolate())}
      />
    </PageWithSidePanel>
  );
}

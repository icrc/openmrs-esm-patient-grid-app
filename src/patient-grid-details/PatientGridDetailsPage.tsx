import { ExtensionSlot, showToast } from '@openmrs/esm-framework';
import React, { useEffect, useState } from 'react';
import { Hr, PageWithSidePanel } from '../components';
import { PatientGridDetailsHeader } from './PatientGridDetailsHeader';
import { Stack } from '@carbon/react';
import { PatientGridFiltersHeader } from './PatientGridFiltersHeader';
import { PatientGrid } from './PatientGrid';
import { DeletePatientGridModal, EditPatientGridModal } from '../crosscutting-features';
import { PatientGridGet, useGetPatientGrid, useRefreshPatientGridReportMutation } from '../api';
import { useNavigate, useParams } from 'react-router-dom';
import { PatientGridDetailsParams, routes } from '../routes';
import { PatientGridReportLoadingIndicator } from './PatientGridReportLoadingIndicator';
import { usePatientGrid } from './usePatientGrid';
import { useTranslation } from 'react-i18next';
import styles from './PatientGridDetailsPage.scss';
import { EditSidePanel, EditSidePanelProps } from './EditSidePanel';

export type EditSidePanelValues = Omit<EditSidePanelProps, 'onClose'>;

export function PatientGridDetailsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [patientGridToDelete, setPatientGridToDelete] = useState<PatientGridGet | undefined>(undefined);
  const [patientGridToEdit, setPatientGridToEdit] = useState<PatientGridGet | undefined>(undefined);
  const [editSidePanelValues, setEditSidePanelValues] = useState<EditSidePanelValues | undefined>(undefined);
  const { id: patientGridId } = useParams<PatientGridDetailsParams>();
  const { data: patientGrid } = useGetPatientGrid(patientGridId);
  const { data, error } = usePatientGrid(patientGridId);
  const [showReloadGrid, setShowReloadGrid] = useState(false);
  const refreshPatientGridMutation = useRefreshPatientGridReportMutation();

  const refreshGrid = () => {
    refreshPatientGridMutation.mutate(
      { id: patientGridId },
      {
        onSuccess: () => setShowReloadGrid(false),
        onError: () =>
          showToast({
            title: t('patientGridRefreshFailedToastTitle', 'Grid refresh failed'),
            description: t(
              'patientGridRefreshFailedToastDescription',
              'Refreshing the grid failed. The grid will not show the newest data.',
            ),
            kind: 'error',
          }),
      },
    );
  };

  useEffect(() => {
    if (error) {
      showToast({
        title: t('patientGridErrorToastTitle', 'Patient grid loading failed'),
        description: t('patientGridErrorToastDescription', 'There was an error while loading the patient grid.'),
        kind: 'error',
      });
    }
  }, [t, error]);

  if (!data || refreshPatientGridMutation.isLoading) {
    return <PatientGridReportLoadingIndicator />;
  }

  return (
    <PageWithSidePanel
      sidePanel={
        editSidePanelValues ? (
          <EditSidePanel
            encounterId={editSidePanelValues.encounterId}
            patientId={editSidePanelValues.patientId}
            formId={editSidePanelValues.formId}
            onEncounterCreate={() => setShowReloadGrid(true)}
            onClose={() => {
              setEditSidePanelValues(undefined);

              // TODO: This should *ideally* be deleted.
              // This is only called because the form engine currently doesn't call the encounter created
              // callback for some reason.
              // If it does, remove the following line.
              setShowReloadGrid(true);
            }}
          />
        ) : undefined
      }
      showSidePanel={!!editSidePanelValues}
      sidePanelSize="lg">
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      <Hr />

      <Stack gap={4}>
        <div className={styles.headerContainer}>
          <PatientGridDetailsHeader
            onEditClick={() => setPatientGridToEdit(patientGrid)}
            onRefreshGridClick={refreshGrid}
            onDeleteClick={() => setPatientGridToDelete(patientGrid)}
          />
        </div>
        <Hr />

        <div className={styles.headerContainer}>
          <PatientGridFiltersHeader patientGridId={patientGridId} />
        </div>

        <div className={styles.gridContainer}>
          <PatientGrid
            patientGridId={patientGridId}
            columns={data?.columns ?? []}
            data={data?.data ?? []}
            showReloadGrid={showReloadGrid}
            setEditSidePanelValues={setEditSidePanelValues}
            refreshPatientGrid={refreshGrid}
          />
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

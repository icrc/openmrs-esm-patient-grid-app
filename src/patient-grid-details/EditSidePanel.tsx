import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { useGetEncounter } from '../api';
import { SidePanel } from '../components';
import { SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';

export interface EditSidePanelProps {
  formId: string;
  encounterId: string;
  patientId: string;
  onClose?(): void;
}

export function EditSidePanel({ formId, encounterId, patientId, onClose }: EditSidePanelProps) {
  const { t } = useTranslation();
  const { data: encounter } = useGetEncounter(encounterId);
  const { patient } = usePatient(patientId);
  const extensionSlotState = useMemo(
    () => ({
      view: 'form',
      formUuid: formId,
      visitUuid: encounter?.visit?.uuid ?? '',
      visitTypeUuid: encounter?.visit?.visitType?.uuid ?? '',
      patientUuid: patientId,
      patient,
      encounterUuid: encounterId,
      closeWorkspace: onClose,
      handleEncounterCreate: onClose,
      handlePostResponse: onClose,
      showDiscardSubmitButtons: true,
    }),
    [formId, encounterId, patientId, encounter, patient, onClose],
  );

  console.info('[FORM]', extensionSlotState);

  return (
    <SidePanel title={t('editSidePanelTitle', 'Edit patient entry')} onClose={onClose}>
      <section>
        {encounter && patient ? <ExtensionSlot name="form-widget-slot" state={extensionSlotState} /> : <SkeletonText />}
      </section>
    </SidePanel>
  );
}

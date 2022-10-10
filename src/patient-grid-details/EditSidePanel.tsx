import { ExtensionSlot, usePatient } from '@openmrs/esm-framework';
import React, { useMemo } from 'react';
import { onlyStaleRevalidationConfig, useGetEncounter } from '../api';
import { SidePanel } from '../components';
import { SkeletonText } from '@carbon/react';
import { useTranslation } from 'react-i18next';

export interface EditSidePanelProps {
  formId: string;
  patientId: string;
  encounterId?: string;
  onClose?(): void;
  onEncounterCreate?(): void;
}

export function EditSidePanel({ formId, encounterId, patientId, onEncounterCreate, onClose }: EditSidePanelProps) {
  const { t } = useTranslation();
  const { data: encounter } = useGetEncounter(encounterId, onlyStaleRevalidationConfig);
  const { patient } = usePatient(patientId);
  const extensionSlotState = useMemo(
    () => ({
      view: 'form',
      formUuid: formId,
      visitUuid: encounter?.visit?.uuid ?? '',
      visitTypeUuid: encounter?.visit?.visitType?.uuid ?? '',
      patientUuid: patientId,
      patient,
      encounterUuid: encounterId ?? '',
      closeWorkspace: onClose,
      handleEncounterCreate: () => {
        onEncounterCreate?.();
        onClose?.();
      },
      showDiscardSubmitButtons: true,
    }),
    [formId, encounterId, patientId, encounter, patient, onEncounterCreate, onClose],
  );

  return (
    <SidePanel title={t('editSidePanelTitle', 'Edit patient entry')} onClose={onClose}>
      <section>
        {(encounterId ? encounter : true) && patient ? (
          <ExtensionSlot name="form-widget-slot" state={extensionSlotState} />
        ) : (
          <SkeletonText paragraph />
        )}
      </section>
    </SidePanel>
  );
}

import React from "react";
import { useTranslation } from "react-i18next";
import { SidePanel, SidePanelProps } from "../components";
import { ModalFooter } from "@carbon/react";

export type NewPatientGridSidePanelProps = Pick<SidePanelProps, "onClose">;

export function NewPatientGridSidePanel({
  onClose,
}: NewPatientGridSidePanelProps) {
  const { t } = useTranslation();

  return (
    <SidePanel
      title={t("newPatientListSidePanelTitle", "New patient list")}
      footer={
        <ModalFooter
          primaryButtonText={t("newPatientGridSidePanelCreate", "Create list")}
          secondaryButtonText={t("newPatientGridSidePanelCancel", "Cancel")}
          onRequestClose={onClose}
          onRequestSubmit={onClose}
        />
      }
      onClose={onClose}
    />
  );
}

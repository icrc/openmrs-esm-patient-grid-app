import React from "react";
import { useTranslation } from "react-i18next";
import { SidePanel, SidePanelProps } from "../components";
import { ModalFooter, Stack } from "@carbon/react";
import { NewPatientGridWizardDetailsPage } from "./NewPatientGridWizardDetailsPage";
import styles from "./NewPatientGridSidePanel.scss";

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
    >
      <section className={styles.contentContainer}>
        <Stack orientation="vertical" gap={6}>
          <h4 className={styles.stepHeader}>
            {t(
              "newPatientGridSidePanelCurrentStep",
              "Step {stepNum} of 3: {stepName}",
              { stepNum: "(tbd)", stepName: "(tbd)" }
            )}
          </h4>
          <NewPatientGridWizardDetailsPage />
        </Stack>
      </section>
    </SidePanel>
  );
}

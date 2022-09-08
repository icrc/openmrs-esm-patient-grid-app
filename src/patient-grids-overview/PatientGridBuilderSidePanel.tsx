import React from "react";
import { useTranslation } from "react-i18next";
import { SidePanel, SidePanelProps } from "../components";
import { ModalFooter, Stack } from "@carbon/react";
import { PatientGridBuilderDetailsPage } from "./PatientGridBuilderDetailsPage";
import styles from "./PatientGridBuilderSidePanel.scss";

export type PatientGridBuilderSidePanelProps = Pick<SidePanelProps, "onClose">;

export function PatientGridBuilderSidePanel({
  onClose,
}: PatientGridBuilderSidePanelProps) {
  const { t } = useTranslation();

  return (
    <SidePanel
      title={t("newPatientGridSidePanelTitle", "New patient grid")}
      footer={
        <ModalFooter
          primaryButtonText={t("PatientGridSidePanelCreate", "Create grid")}
          secondaryButtonText={t("PatientGridSidePanelCancel", "Cancel")}
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
              "PatientGridSidePanelCurrentStep",
              "Step {stepNum} of 3: {stepName}",
              { stepNum: "(tbd)", stepName: "(tbd)" }
            )}
          </h4>
          <PatientGridBuilderDetailsPage />
        </Stack>
      </section>
    </SidePanel>
  );
}

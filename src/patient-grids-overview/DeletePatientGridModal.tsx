import React, { Dispatch, SetStateAction } from "react";
import { Modal } from "@carbon/react";
import { PatientGridGet } from "../api";
import { useTranslation } from "react-i18next";

export interface DeletePatientGridModalProps {
  patientGridToDelete?: PatientGridGet;
  setPatientGridToDelete?: Dispatch<SetStateAction<PatientGridGet | undefined>>;
}

export function DeletePatientGridModal({
  patientGridToDelete,
  setPatientGridToDelete,
}: DeletePatientGridModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      open={!!patientGridToDelete}
      danger
      modalHeading={t("deletePatientGridModalTitle", "Delete list")}
      primaryButtonText={t("deletePatientGridModalDelete", "Delete")}
      secondaryButtonText={t("deletePatientGridModalCancel", "Cancel")}
    >
      <p>
        {t(
          "deletePatientGridModalBody",
          'Are you sure that you want to delete the list "{name}"? This action cannot be undone.',
          { name: patientGridToDelete?.name }
        )}
      </p>
    </Modal>
  );
}

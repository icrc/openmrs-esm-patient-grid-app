import React, { Dispatch, SetStateAction } from "react";
import { Modal } from "@carbon/react";
import { PatientGridGet, useDeletePatientGridMutation } from "../api";
import { useTranslation } from "react-i18next";
import { showToast } from "@openmrs/esm-framework";

export interface DeletePatientGridModalProps {
  patientGridToDelete?: PatientGridGet;
  setPatientGridToDelete?: Dispatch<SetStateAction<PatientGridGet | undefined>>;
}

export function DeletePatientGridModal({
  patientGridToDelete,
  setPatientGridToDelete,
}: DeletePatientGridModalProps) {
  const { t } = useTranslation();
  const { mutate, isLoading } = useDeletePatientGridMutation();
  const submit = () => {
    mutate(
      { id: patientGridToDelete.uuid },
      {
        onSuccess: () => {
          showToast({
            kind: "success",
            title: t(
              "deletePatientGridSuccessToastTitle",
              "List deleted successfully"
            ),
            description: t(
              "deletePatientGridSuccessToastDescription",
              'Successfully deleted the list "{name}".',
              {
                name: patientGridToDelete?.name,
              }
            ),
          });

          setPatientGridToDelete(undefined);
        },
        onError: () =>
          showToast({
            kind: "error",
            title: t(
              "deletePatientGridErrorToastTitle",
              "List deletion failed"
            ),
            description: t(
              "deletePatientGridErrorToastDescription",
              'Deleting the list "{name}" failed.',
              {
                name: patientGridToDelete?.name,
              }
            ),
          }),
      }
    );
  };

  return (
    <Modal
      open={!!patientGridToDelete}
      danger
      modalHeading={t("deletePatientGridModalTitle", "Delete list")}
      primaryButtonText={t("deletePatientGridModalDelete", "Delete")}
      secondaryButtonText={
        isLoading
          ? t("deletePatientGridModalClose", "Close")
          : t("deletePatientGridModalCancel", "Cancel")
      }
      primaryButtonDisabled={isLoading}
      onRequestSubmit={() => submit()}
      onRequestClose={() => setPatientGridToDelete(undefined)}
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

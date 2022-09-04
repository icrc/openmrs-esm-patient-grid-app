import React from "react";
import { Button } from "@carbon/react";
import { Add } from "@carbon/react/icons";
import { PageHeader } from "../components";
import styles from "./PatientGridsOverviewHeader.scss";
import { useTranslation } from "react-i18next";

export interface PatientGridsOverviewHeaderProps {
  onNewListClick?(): void;
}

export function PatientGridsOverviewHeader({
  onNewListClick,
}: PatientGridsOverviewHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={
        <h1 className={styles.title}>
          {t("patientGridsOverviewTitle", "Patient lists")}
        </h1>
      }
      actions={
        <Button
          kind="ghost"
          size="sm"
          renderIcon={Add}
          onClick={onNewListClick}
        >
          {t("newList", "New list")}
        </Button>
      }
    />
  );
}

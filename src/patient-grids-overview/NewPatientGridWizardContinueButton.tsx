import { Button } from "@carbon/react";
import { ChevronRight } from "@carbon/react/icons";
import React, { ReactNode } from "react";
import styles from "./NewPatientGridWizardContinueButton.scss";

interface NewPatientGridWizardContinueButtonProps {
  children?: ReactNode;
}

export function NewPatientGridWizardContinueButton({
  children,
}: NewPatientGridWizardContinueButtonProps) {
  return (
    <div className={styles.container}>
      <Button kind="ghost" renderIcon={ChevronRight}>
        {children}
      </Button>
    </div>
  );
}

import { Button } from "@carbon/react";
import { ChevronRight } from "@carbon/react/icons";
import React, { ReactNode } from "react";
import styles from "./PatientGridBuilderContinueButton.scss";

interface PatientGridBuilderContinueButtonProps {
  children?: ReactNode;
}

export function PatientGridBuilderContinueButton({
  children,
}: PatientGridBuilderContinueButtonProps) {
  return (
    <div className={styles.container}>
      <Button kind="ghost" renderIcon={ChevronRight}>
        {children}
      </Button>
    </div>
  );
}

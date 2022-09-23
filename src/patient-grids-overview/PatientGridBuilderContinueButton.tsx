import { Button } from '@carbon/react';
import { ChevronRight } from '@carbon/react/icons';
import React, { ReactNode } from 'react';
import styles from './PatientGridBuilderContinueButton.scss';

// TODO: Replace the Record with ButtonProps if Carbon ever releases typings.
interface PatientGridBuilderContinueButtonProps extends Record<string, unknown> {
  children?: ReactNode;
  onClick?(): void;
}

export function PatientGridBuilderContinueButton({
  children,
  onClick,
  ...buttonProps
}: PatientGridBuilderContinueButtonProps) {
  return (
    <div className={styles.container}>
      <Button {...buttonProps} kind="ghost" renderIcon={ChevronRight} onClick={onClick}>
        {children}
      </Button>
    </div>
  );
}

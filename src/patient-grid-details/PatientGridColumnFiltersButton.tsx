import React, { useState } from 'react';
import { Popover, PopoverContent, Button } from '@carbon/react';
import { Filter } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from '@openmrs/esm-framework';
import styles from './PatientGridColumnFiltersButton.scss';

export interface PatientGridColumnFiltersButtonProps {
  columnDisplayName: string;
}

export function PatientGridColumnFiltersButton({ columnDisplayName }: PatientGridColumnFiltersButtonProps) {
  const { t } = useTranslation();
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const onClickOutsideRef = useOnClickOutside(() => setIsPopoverOpen(false), isPopoverOpen);

  return (
    <Popover ref={onClickOutsideRef} autoAlign dropShadow open={isPopoverOpen}>
      <Button
        hasIconOnly
        renderIcon={Filter}
        size="sm"
        kind="ghost"
        iconDescription={t('patientGridFilterColumnDescription', 'Filter')}
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      />
      <PopoverContent className={styles.popoverContent}>
        <p className={styles.popoverTitle}>
          {t('patientGridFilterHeaderButtonTitle', '"{columnName}" Filter', {
            columnName: columnDisplayName,
          })}
        </p>
      </PopoverContent>
    </Popover>
  );
}

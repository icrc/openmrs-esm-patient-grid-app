import React, { useState } from 'react';
import { Popover, PopoverContent, Button, ButtonSet, Checkbox } from '@carbon/react';
import { Filter, Close, TrashCan, Checkmark } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from '@openmrs/esm-framework';
import styles from './PatientGridColumnFiltersButton.scss';
import { Column } from '@tanstack/react-table';
import { PatientGridDataRow } from './usePatientGrid';

export interface PatientGridColumnFiltersButtonProps {
  columnDisplayName: string;
  column: Column<PatientGridDataRow, unknown>;
}

export function PatientGridColumnFiltersButton({ columnDisplayName, column }: PatientGridColumnFiltersButtonProps) {
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
        iconDescription={t('patientGridColumnFiltersDescription', 'Filter')}
        onClick={() => setIsPopoverOpen(!isPopoverOpen)}
      />
      <PopoverContent className={styles.popoverContent}>
        {isPopoverOpen && (
          // Conditionally rendering this on demand noticeably improves performance during the initial load of the grid.
          <FiltersPopoverContent
            column={column}
            columnDisplayName={columnDisplayName}
            close={() => setIsPopoverOpen(false)}
          />
        )}
      </PopoverContent>
    </Popover>
  );
}

interface FiltersPopoverContentProps extends PatientGridColumnFiltersButtonProps {
  close(): void;
}

function FiltersPopoverContent({ column, columnDisplayName, close }: FiltersPopoverContentProps) {
  const { t } = useTranslation();
  const uniqueValues = [...column.getFacetedUniqueValues().keys()].filter((x) => x?.length).sort();

  return (
    <aside className={styles.popoverContentAligner}>
      <p className={styles.popoverTitle}>
        {t('patientGridColumnFiltersTitle', '"{columnName}" Filter', {
          columnName: columnDisplayName,
        })}
      </p>

      <div className={styles.mainContentContainer}>
        {uniqueValues.length ? (
          uniqueValues.map((columnValue) => (
            <Checkbox key={column} id={`${column.id}-${columnValue}`} labelText={columnValue} />
          ))
        ) : (
          <span className={styles.noFiltersAvailable}>
            {t('patientGridColumnFiltersNoFiltersAvailable', 'No filters available.')}
          </span>
        )}
      </div>

      <ButtonSet className={styles.buttonSet}>
        <Button className={styles.popoverButton} size="sm" kind="ghost" renderIcon={Close}>
          {t('patientGridColumnFiltersResetToDefault', 'Reset to default')}
        </Button>
        <Button className={styles.popoverButton} size="sm" kind="secondary" renderIcon={TrashCan} onClick={close}>
          {t('patientGridColumnFiltersResetToDefault', 'Cancel')}
        </Button>
        <Button className={styles.popoverButton} size="sm" kind="primary" renderIcon={Checkmark}>
          {t('patientGridColumnFiltersResetToDefault', 'Apply')}
        </Button>
      </ButtonSet>
    </aside>
  );
}

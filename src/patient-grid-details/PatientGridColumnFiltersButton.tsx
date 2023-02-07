import React, { useContext, useState } from 'react';
import { Popover, PopoverContent, Button, ButtonSet, Checkbox, SkeletonText } from '@carbon/react';
import { Filter, Close, TrashCan, Checkmark } from '@carbon/react/icons';
import { useTranslation } from 'react-i18next';
import { useOnClickOutside } from '@openmrs/esm-framework';
import styles from './PatientGridColumnFiltersButton.scss';
import { Column } from '@tanstack/react-table';
import { PatientGridDataRow } from './usePatientGrid';
import { InlinePatientGridEditingContext, LocalFilter, usePossiblePatientGridFiltersForColumn } from '../grid-utils';

export interface PatientGridColumnFiltersButtonProps {
  patientGridId: string;
  columnDisplayName: string;
  column: Column<PatientGridDataRow, unknown>;
}

export function PatientGridColumnFiltersButton({
  patientGridId,
  columnDisplayName,
  column,
}: PatientGridColumnFiltersButtonProps) {
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
            patientGridId={patientGridId}
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

function FiltersPopoverContent({ patientGridId, column, columnDisplayName, close }: FiltersPopoverContentProps) {
  const { t } = useTranslation();
  const { data: possibleFilters } = usePossiblePatientGridFiltersForColumn(patientGridId, column.id);
  const { original, filters, push } = useContext(InlinePatientGridEditingContext);
  const [localFilters, setLocalFilters] = useState(filters);

  const handleFilterClick = (filter: LocalFilter, checked: boolean) => {
    if (checked) {
      setLocalFilters([...localFilters, filter]);
    } else {
      setLocalFilters(localFilters.filter((x) => x.columnName !== filter.columnName && x.operand !== filter.operand));
    }
  };

  const handleApply = () => {
    push((state) => ({
      ...state,
      filters: localFilters,
    }));
    close();
  };

  const handleResetToDefault = () => {
    setLocalFilters([
      ...original.filters.filter((x) => x.columnName === column.id),
      ...filters.filter((x) => x.columnName !== column.id),
    ]);
  };

  return (
    <aside className={styles.popoverContentAligner}>
      <p className={styles.popoverTitle}>
        {t('patientGridColumnFiltersTitle', '"{columnName}" Filter', {
          columnName: columnDisplayName,
        })}
      </p>

      <div className={styles.mainContentContainer}>
        {possibleFilters?.length ? (
          possibleFilters.map((possibleFilter) => (
            <Checkbox
              key={possibleFilter.operand}
              id={`${column.id}-${possibleFilter.operand}`}
              labelText={possibleFilter.name}
              checked={localFilters.some(
                (filter) =>
                  filter.columnName === possibleFilter.columnName && filter.operand === possibleFilter.operand,
              )}
              onChange={(_, { checked }) => handleFilterClick(possibleFilter, checked)}
            />
          ))
        ) : possibleFilters ? (
          <span className={styles.noFiltersAvailable}>
            {t('patientGridColumnFiltersNoFiltersAvailable', 'No filters available for the current grid report.')}
          </span>
        ) : (
          <SkeletonText paragraph />
        )}
      </div>

      <ButtonSet className={styles.buttonSet}>
        <Button
          className={styles.popoverButton}
          size="sm"
          kind="ghost"
          renderIcon={Close}
          onClick={handleResetToDefault}>
          {t('patientGridColumnFiltersResetToDefault', 'Reset to default')}
        </Button>
        <Button className={styles.popoverButton} size="sm" kind="secondary" renderIcon={TrashCan} onClick={close}>
          {t('patientGridColumnFiltersCancel', 'Cancel')}
        </Button>
        <Button className={styles.popoverButton} size="sm" kind="primary" renderIcon={Checkmark} onClick={handleApply}>
          {t('patientGridColumnFiltersApply', 'Apply')}
        </Button>
      </ButtonSet>
    </aside>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './PatientGridBuilderHeader.scss';
import { WizardPageProps } from './usePatientGridWizard';
import { ChevronLeft } from '@carbon/react/icons';
import { Button } from '@carbon/react';

export type PatientGridBuilderHeaderProps = Pick<WizardPageProps, 'page' | 'pages' | 'goToPrevious'> & {
  title?: string;
};

export function PatientGridBuilderHeader({ page, pages, title, goToPrevious }: PatientGridBuilderHeaderProps) {
  const { t } = useTranslation();

  return (
    <header className={styles.headerContainer}>
      {page > 0 && (
        <Button
          className={styles.backButton}
          kind="ghost"
          renderIcon={ChevronLeft}
          iconDescription={t('patientGridBuilderHeaderGoBack', 'Go back')}
          tooltipPosition="bottom"
          hasIconOnly
          size="sm"
          onClick={goToPrevious}
        />
      )}

      <span className={styles.stepHeader}>
        {t('patientGridBuilderHeaderCurrentStep', 'Step {{page}} of {{pages}}: {{title}}', {
          page: page + 1,
          pages,
          title,
        })}
      </span>
    </header>
  );
}

import React from 'react';
import { Loading } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import styles from './PatientGridReportLoadingIndicator.scss';

export function PatientGridReportLoadingIndicator() {
  const { t } = useTranslation();

  return (
    <section className={styles.loadingIndicatorContainer}>
      <Loading withOverlay={false} />
      <span className={styles.loadingDescription}>
        {t(
          'patientGridLoadingIndicator',
          'Please wait while we are generating a\nnew patient grid report. This may take a\nwhile. Please do not close this page.',
        )}
      </span>
    </section>
  );
}

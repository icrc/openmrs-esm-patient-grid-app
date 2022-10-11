import React, { useState } from 'react';
import styles from './PatientGridsOverviewPage.scss';
import { PatientGridsOverviewHeader } from './PatientGridsOverviewHeader';
import { PatientGridTabs } from './PatientGridsTabs';
import { PageWithSidePanel } from '../components';
import { PatientGridBuilderSidePanel } from './PatientGridBuilderSidePanel';

export function PatientGridsOverviewPage() {
  const [showSidePanel, setShowSidePanel] = useState(false);

  return (
    <PageWithSidePanel
      sidePanel={<PatientGridBuilderSidePanel onClose={() => setShowSidePanel(false)} />}
      showSidePanel={showSidePanel}>
      <div className={styles.headerContainer}>
        <PatientGridsOverviewHeader onNewGridClick={() => setShowSidePanel(true)} />
      </div>
      <PatientGridTabs />
    </PageWithSidePanel>
  );
}

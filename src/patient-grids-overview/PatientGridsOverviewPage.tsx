import React, { useState } from 'react';
import styles from './PatientGridsOverviewPage.scss';
import { PatientGridsOverviewHeader } from './PatientGridsOverviewHeader';
import { PatientGridTabs } from './PatientGridsTabs';
import { PageWithSidePanel } from '../components';
import { PatientGridBuilderSidePanel } from './PatientGridBuilderSidePanel';
import { ExtensionSlot } from '@openmrs/esm-framework';

export function PatientGridsOverviewPage() {
  const [showSidePanel, setShowSidePanel] = useState(false);

  return (
    <PageWithSidePanel
      sidePanel={<PatientGridBuilderSidePanel onClose={() => setShowSidePanel(false)} />}
      showSidePanel={showSidePanel}>
      <ExtensionSlot extensionSlotName="breadcrumbs-slot" />
      <div className={styles.headerContainer}>
        <PatientGridsOverviewHeader onNewGridClick={() => setShowSidePanel(true)} />
      </div>
      <PatientGridTabs />
    </PageWithSidePanel>
  );
}

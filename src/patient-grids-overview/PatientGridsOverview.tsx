import React, { useState } from "react";
import styles from "./PatientGridsOverview.scss";
import { PatientGridsOverviewHeader } from "./PatientGridsOverviewHeader";
import { PatientGridTabs } from "./PatientGridsTabs";
import { PageWithSidePanel } from "../components";
import { NewPatientGridSidePanel } from "./NewPatientGridSidePanel";

export function PatientGridsOverview() {
  const [showSidePanel, setShowSidePanel] = useState(false);

  return (
    <PageWithSidePanel
      sidePanel={
        <NewPatientGridSidePanel onClose={() => setShowSidePanel(false)} />
      }
      showSidePanel={showSidePanel}
    >
      <div className={styles.headerContainer}>
        <PatientGridsOverviewHeader
          onNewListClick={() => setShowSidePanel(true)}
        />
      </div>
      <PatientGridTabs />
    </PageWithSidePanel>
  );
}

import React from "react";
import styles from "./PatientGridsOverview.scss";
import { PatientGridsOverviewHeader } from "./PatientGridsOverviewHeader";
import { PatientGridTabs } from "./PatientGridsTabs";

export function PatientGridsOverview() {
  return (
    <div>
      <div className={styles.headerContainer}>
        <PatientGridsOverviewHeader />
      </div>

      <PatientGridTabs />
    </div>
  );
}

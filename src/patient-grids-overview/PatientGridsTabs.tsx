import React from "react";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@carbon/react";
import styles from "./PatientGridsTabs.scss";
import { useTranslation } from "react-i18next";
import { PatientGridsTable } from "./PatientGridsTable";

export function PatientGridTabs() {
  const { t } = useTranslation();

  return (
    <Tabs activation="manual">
      <TabList contained className={styles.tabList}>
        <Tab>{t("sharedListsTabLabel", "Shared lists")}</Tab>
        <Tab>{t("myListsTabLabel", "My lists")}</Tab>
        <Tab>{t("allListsTabLabel", "All lists")}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <PatientGridsTable type="shared" />
        </TabPanel>
        <TabPanel>
          <PatientGridsTable type="my" />
        </TabPanel>
        <TabPanel>
          <PatientGridsTable type="all" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

import React from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
import styles from './PatientGridsTabs.scss';
import { useTranslation } from 'react-i18next';
import { PatientGridsTable } from './PatientGridsTable';

export function PatientGridTabs() {
  const { t } = useTranslation();

  return (
    <Tabs activation="manual">
      <TabList contained className={styles.tabList} aria-label={t('patientGridTabsLabel', 'Patient grid tabs')}>
        <Tab>{t('systemGridsTabLabel', 'System grids')}</Tab>
        <Tab>{t('myGridsTabLabel', 'My grids')}</Tab>
        <Tab>{t('allGridsTabLabel', 'All grids')}</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <PatientGridsTable type="system" />
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

import React from 'react';
import { DataTableSkeleton, Tabs, TabList, Tab, TabPanels, TabPanel, TabsSkeleton } from '@carbon/react';
import styles from './HistoricEncountersTabs.scss';
import {
  PatientGridReportGet,
  PatientGridReportRowGet,
  useFormSchemasOfForms,
  useGetAllPublishedPrivilegeFilteredForms,
  useMergedSwr,
} from '../api';
import { getFormsReferencedInGridReport, getFormSchemaReferenceUuid } from '../grid-utils';
import { useTranslation } from 'react-i18next';
import { HistoricEncountersGrid } from './HistoricEncountersGrid';

export interface HistoricEncountersTabsProps {
  report: PatientGridReportGet;
  reportRow: PatientGridReportRowGet;
}

export function HistoricEncountersTabs({ report, reportRow }: HistoricEncountersTabsProps) {
  const { t } = useTranslation();
  const formsSwr = useGetAllPublishedPrivilegeFilteredForms();
  const formSchemasSwr = useFormSchemasOfForms(formsSwr.data);
  const { data: formsReferencedInGridReport } = useMergedSwr(
    () => {
      const { data: forms } = formsSwr;
      const { data: formSchemas } = formSchemasSwr;
      return getFormsReferencedInGridReport(report, forms, formSchemas);
    },
    [formsSwr, formSchemasSwr],
    [report],
  );

  return (
    <section className={styles.container}>
      {formsReferencedInGridReport ? (
        <Tabs>
          <TabList aria-label={t('historicEncountersTabsAriaLabel', 'Historic forms')} activation="manual" contained>
            {formsReferencedInGridReport.map((form) => (
              <Tab key={form.uuid}>{form.name}</Tab>
            ))}
          </TabList>
          <TabPanels>
            {formsReferencedInGridReport.map((form) => (
              <TabPanel key={form.uuid}>
                <HistoricEncountersGrid
                  form={form}
                  formSchema={formSchemasSwr.data[getFormSchemaReferenceUuid(form)]}
                  patientId={reportRow.uuid}
                  report={report}
                />
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      ) : (
        <>
          <TabsSkeleton />
          <DataTableSkeleton showHeader={false} showToolbar={false} />
        </>
      )}
    </section>
  );
}

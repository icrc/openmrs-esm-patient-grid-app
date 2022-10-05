import { openmrsFetch, OpenmrsResource } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';
import { ColumnNameToHeaderLabelMap, useColumnNameToHeaderLabelMap } from '../grid-utils';
import { FormGet, useGetAllPublishedPrivilegeFilteredForms } from './form';
import { FormSchema, useFormSchemasOfForms } from './formSchema';
import { PatientGridGet, useGetPatientGrid } from './patientGrid';
import { FetchAllResponse } from './shared';
import { useMergedSwr } from './useMergedSwr';

export interface PatientGridDownloadGet {
  patientGrid: OpenmrsResource;
  report: Array<PatientGridDownloadRowGet>;
}

/**
 * A row of the download report.
 * Each row is a record which may be keyed by:
 * * a unique column name (e.g. for patient details values).
 * * the UUID of an encounter type. That value contains the list of historical encounters and their observations.
 */
export interface PatientGridDownloadRowGet
  extends Record<string, undefined | null | string | number | boolean | PatientGridDownloadHistoricalEncounterTypeGet> {
  uuid: string;
}

/**
 * An array of encounter information for a single encounter type.
 * This array essentially contains all historical obs of a single encounter type.
 */
export type PatientGridDownloadHistoricalEncounterTypeGet = Array<PatientGridDownloadEncounterGet>;

/**
 * Essentially the obs of a single encounter.
 */
export type PatientGridDownloadEncounterGet = Record<string, PatientGridDownloadObsGet>;

export interface PatientGridDownloadObsGet {
  uuid: string;
  concept: string;
  value: string;
  formFieldPath?: string;
  formFieldNamespace?: string;
  encounter: {
    uuid: string;
    form: string;
    encounterType: string;
  };
}

export function useGetPatientGridDownload(id: string) {
  return useSWR(`/ws/rest/v1/patientgrid/patientgrid/${id}/download`, (url) =>
    openmrsFetch<FetchAllResponse<PatientGridDownloadGet>>(url).then(({ data }) => data.results[0]),
  );
}

export interface DownloadGridData {
  download: PatientGridDownloadGet;
  patientGrid: PatientGridGet;
  forms: Array<FormGet>;
  formSchemas: Record<string, FormSchema>;
  columnNamesToInclude: Array<string>;
  columnNameToHeaderLabelMap: ColumnNameToHeaderLabelMap;
  patientDetailsGroupHeader: string;
  fileName: string;
}

export function useDownloadGridData(patientGridId: string) {
  const { t } = useTranslation();
  const downloadSwr = useGetPatientGridDownload(patientGridId);
  const patientGridSwr = useGetPatientGrid(patientGridId);
  const formsSwr = useGetAllPublishedPrivilegeFilteredForms();
  const formSchemasSwr = useFormSchemasOfForms(formsSwr.data);
  const columnNameToHeaderLabelMapSwr = useColumnNameToHeaderLabelMap();

  return useMergedSwr<Omit<DownloadGridData, 'fileName'>>(
    () => {
      return {
        download: downloadSwr.data,
        patientGrid: patientGridSwr.data,
        forms: formsSwr.data,
        formSchemas: formSchemasSwr.data,
        columnNameToHeaderLabelMap: columnNameToHeaderLabelMapSwr.data,
        columnNamesToInclude: patientGridSwr.data.columns.map((column) => column.name), // TODO: Add hidden filtering.
        patientDetailsGroupHeader: t('patientDetailsDownloadGroupHeader', 'Healthcare user'),
      };
    },
    [downloadSwr, patientGridSwr, formsSwr, formSchemasSwr, columnNameToHeaderLabelMapSwr],
    [t],
  );
}

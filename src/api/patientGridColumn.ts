import { OpenmrsResource } from '@openmrs/esm-framework';
import { PatientGridFilterPost } from './patientGridFilter';
import { ColumnDef } from '@tanstack/react-table';
import { PatientGridDataRow } from '../patient-grid-details/usePatientGrid';

export type PatientGridColumnDataType =
  | 'NAME'
  | 'LEGACY_ID'
  | 'GENDER'
  | 'ENC_AGE'
  | 'ENC_DATE'
  | 'OBS'
  | 'ENC_LOCATION'
  | 'ENC_COUNTRY';

// Columns are a union type with a `type` discriminator.
// Depending on the type, the column resource has different attributes.
interface PatientGridBaseColumnGet extends OpenmrsResource {
  name: string;
  description?: string;
  datatype: PatientGridColumnDataType;
  hidden?: boolean;
}

interface PatientGridNormalColumnGet extends PatientGridBaseColumnGet {
  type: 'column';
}

interface PatientGridObsColumnGet extends PatientGridBaseColumnGet {
  type: 'obscolumn';
  encounterType: OpenmrsResource;
  concept: OpenmrsResource;
}

interface PatientGridAgeColumnGet extends PatientGridBaseColumnGet {
  type: 'agecolumn';
  encounterType: OpenmrsResource;
  convertToAgeRange: boolean;
}

interface PatientGridFormDateColumnGet extends PatientGridBaseColumnGet {
  type: 'encounterdatecolumn';
  encounterType: OpenmrsResource;
}

export type PatientGridColumnGet =
  | PatientGridNormalColumnGet
  | PatientGridObsColumnGet
  | PatientGridAgeColumnGet
  | PatientGridFormDateColumnGet;

export type PatientGridColumnType = PatientGridColumnGet['type'];

export interface PatientGridColumnPost {
  uuid?: string;
  type?: PatientGridColumnType;
  datatype?: PatientGridColumnDataType;
  name?: string;
  description?: string;
  concept?: string;
  encounterType?: string;
  convertToAgeRange?: boolean;
  filters?: Array<PatientGridFilterPost>;
  hidden?: boolean;
}

export type PatientGridColumnDef = ColumnDef<PatientGridDataRow, unknown> & {
  headerPrefix?: string;
};

import { OpenmrsResource } from '@openmrs/esm-framework';

export type PatientGridColumnDataType =
  | 'NAME'
  | 'GENDER'
  | 'ENC_AGE'
  | 'OBS'
  | 'DATAFILTER_LOCATION'
  | 'DATAFILTER_COUNTRY';

// Columns are a union type with a `type` discriminator.
// Depending on the type, the column resource has different attributes.
interface PatientGridBaseColumnGet extends OpenmrsResource {
  name: string;
  description?: string;
  datatype: PatientGridColumnDataType;
}

interface PatientGridNormalColumnGet extends PatientGridBaseColumnGet {
  type: 'column';
}

interface PatientGridObsColumnGet extends PatientGridBaseColumnGet {
  type: 'obscolumn';
  encounterType: unknown; // TODO: Type
  concept: unknown; // TODO: Type
}

interface PatientGridAgeColumnGet extends PatientGridBaseColumnGet {
  type: 'agecolumn';
  encounterType: unknown; // TODO: Type
  convertToAgeRange: boolean;
}

export type PatientGridColumnGet = PatientGridNormalColumnGet | PatientGridObsColumnGet | PatientGridAgeColumnGet;

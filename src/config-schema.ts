import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  ageRangeEncounterTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID to be used for age ranges in patient grids.',
    _default: undefined,
  },
  gridPatientConfig: {
    _type: Type.Array,
    _description: 'List of patient columns to be shown.',
    _elements: {
      _type: Type.String,
      _description:
        'Possible columns types are: "NAME", "PATIENT_ID_01", "PATIENT_ID_02", "GENDER", "ENC_AGE", "ENC_LOCATION", "ENC_COUNTRY".',
      _default: undefined,
    },
    _default: ['NAME', 'GENDER', 'ENC_AGE', 'ENC_LOCATION', 'ENC_COUNTRY'],
  },
  gridFormConfig: {
    _type: Type.Array,
    _description: 'List of forms for this category.',
    _default: [],
    _elements: {
      formUuid: {
        _type: Type.UUID,
        _description: 'UUID of form',
      },
      defaultHiddenQuestionIds: {
        _type: Type.Array,
      },
    },
  },
};

export type Config = Record<string, unknown> & {
  ageRangeEncounterTypeUuid?: string;
  gridFormConfig?: Array<GridFormConfig>;
  gridPatientConfig?: Array<string>;
};

export interface GridFormConfig {
  formUuid: string;
  defaultHiddenQuestionIds: string;
}

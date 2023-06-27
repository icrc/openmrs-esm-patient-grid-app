import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  ageRangeEncounterTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID to be used for age ranges in patient grids.',
    _default: undefined,
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
};

export interface GridFormConfig {
  formUuid: string;
  defaultHiddenQuestionIds: string;
}

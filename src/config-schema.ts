import { Type } from '@openmrs/esm-framework';

export const configSchema = {
  ageRangeEncounterTypeUuid: {
    _type: Type.UUID,
    _description: 'The UUID to be used for age ranges in patient grids.',
    _default: undefined,
  },
};

export type Config = Record<string, unknown> & {
  ageRangeEncounterTypeUuid?: string;
};

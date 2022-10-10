import { OpenmrsResource } from '@openmrs/esm-framework';

export interface EncounterTypeGet extends OpenmrsResource {
  name: string;
  description?: string;
  retired: boolean;
  editPrivilege?: OpenmrsResource;
}

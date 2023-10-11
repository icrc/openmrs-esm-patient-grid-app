import { defineConfigSchema, getAsyncLifecycle, openmrsFetch, registerBreadcrumbs } from '@openmrs/esm-framework';
import { configSchema } from './config-schema';
import { PatientGridGet } from './api';

export const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const basePath = `${window.spaBase}/patient-grids`;
const moduleName = '@icrc/esm-patient-grid-app';
const options = {
  featureName: 'patientgrid-app',
  moduleName,
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function startupApp() {
  defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      path: basePath,
      title: 'Patient Grids',
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${basePath}/:id`,
      title: ([id]: [string]) =>
        openmrsFetch<PatientGridGet>(`/ws/rest/v1/patientgrid/patientgrid/${id}?v=full`)
          .then(({ data }) => data?.name ?? 'Patient Grid')
          .catch(() => 'Patient Grid'),
      parent: basePath,
    },
  ]);
}

export const patientGridsLink = getAsyncLifecycle(() => import('./AppMenuLink'), options);
export const root = getAsyncLifecycle(() => import('./Root'), options);

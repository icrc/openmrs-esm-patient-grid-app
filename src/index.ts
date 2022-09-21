import { defineConfigSchema, getAsyncLifecycle, openmrsFetch, registerBreadcrumbs } from '@openmrs/esm-framework';
import { PatientGridGet } from './api';
import { configSchema } from './config-schema';

declare let __VERSION__: string;
const version = __VERSION__;

const importTranslation = require.context('../translations', false, /.json$/, 'lazy');

const backendDependencies = {
  fhir2: '^1.2.0',
  'webservices.rest': '^2.2.0',
};

function setupOpenMRS() {
  const basePath = `${window.spaBase}/patient-grids`;
  const moduleName = '@icrc/esm-patientgrid-app';
  const options = {
    featureName: 'patientgrid-app',
    moduleName,
  };

  defineConfigSchema(moduleName, configSchema);

  registerBreadcrumbs([
    {
      path: basePath,
      title: 'Patient Grids',
      parent: `${window.spaBase}/home`,
    },
    {
      path: `${basePath}/:id`,
      title: (id) =>
        openmrsFetch<PatientGridGet>(`/ws/rest/v1/icrc/patientgrid/${id}`)
          .then(({ data }) => data?.description ?? 'Patient Grid')
          .catch(() => 'Patient Grid'),
      parent: basePath,
    },
  ]);

  return {
    pages: [
      {
        load: getAsyncLifecycle(() => import('./Root'), options),
        route: 'patient-grids',
      },
    ],
    extensions: [],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };

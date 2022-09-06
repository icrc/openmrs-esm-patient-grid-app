import { defineConfigSchema } from "@openmrs/esm-framework";
import { configSchema } from "./config-schema";

declare let __VERSION__: string;
const version = __VERSION__;

const importTranslation = require.context(
  "../translations",
  false,
  /.json$/,
  "lazy"
);

const backendDependencies = {
  fhir2: "^1.2.0",
  "webservices.rest": "^2.2.0",
};

function setupOpenMRS() {
  const moduleName = "@icrc/esm-patientgrid-app";

  defineConfigSchema(moduleName, configSchema);

  return {
    pages: [],
    extensions: [],
  };
}

export { backendDependencies, importTranslation, setupOpenMRS, version };

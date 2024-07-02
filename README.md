# OpenMRS Patient Grid App

The microfrontend module providing the patient grid feature.

# Artifacts
https://www.npmjs.com/package/@icrc/esm-patient-grid-app?activeTab=versions

# CI / CD
- [Build/Deploy CI](https://github.com/icrc/openmrs-esm-patient-grid-app/actions/workflows/build.yml) will test, build packages. npm packages are published for every push to `main` bramch. The version is prefixed with `-pre.<run.id>`
- [Do Release](https://github.com/icrc/openmrs-esm-patient-grid-app/actions/workflows/release.yml) will and publish a released version, do a GitHub and move the version to the next minor one. **A PR will be created to move to the next version: you should review and accept it**

# Versions
- the next release version is defined in [package.json](./package.json) and will be deploy by the Do Release Action
- for each push to main branch the version `<next-release-version>-pre.<number>` will be deployed.

## Getting Started

To run the microfrontend locally:

```sh
yarn  # to install dependencies
yarn start  # to run the dev server
```
Also, possible to use a docker container to run yarn:


```sh
sh run.sh yarn  # to install dependencies
sh run.sh yarn start  # to run the dev server
```

## Configuration
### Default hidden columns
It's possible to specify which questions will result in hidden columns by default when creating a new grid. Users can then enable hidden columns after the grid is created if needed.

To specify the default hidden columns, one must utilize the config-schema by providing the form UUID along with its corresponding question IDs.

Below, here's an example to hide the columns for "nhif" and "nhifStatus" questions for the form [adult-1.4.json](https://github.com/openmrs/openmrs-ngx-formentry/blob/main/src/app/adult-1.4.json):

```json
{
  "@icrc/esm-patient-grid-app": {
    "gridFormConfig": [
      {
        "formUuid": "bcb914ea-1e03-4c7f-9fd5-1baba5841e78",
        "defaultHiddenQuestionIds": ["nhif", "nhifStatus"]
      }
    ]
  }
}
```

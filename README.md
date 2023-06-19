# OpenMRS Patient Grid App

The microfrontend module providing the patient grid feature.


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

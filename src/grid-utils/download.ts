import { FormGet, FormSchema, PatientGridDownloadGet, PatientGridGet } from '../api';
import max from 'lodash-es/max';
import range from 'lodash-es/range';
import {
  getFormSchemaQuestionColumnName,
  patientDetailsAgeCategoryColumnName,
  patientDetailsCountryColumnName,
  patientDetailsGenderColumnName,
  patientDetailsNameColumnName,
  patientDetailsStructureColumnName,
} from './columnNames';
import { ColumnNameToHeaderLabelMap } from './useColumnNameToHeaderLabelMap';
import { getFormSchemaReferenceUuid } from './formSchema';

export function getPatientGridDownloadReportData(
  download: PatientGridDownloadGet,
  patientGrid: PatientGridGet,
  forms: Array<FormGet>,
  formSchemas: Record<string, FormSchema>,
  columnNamesToInclude: Array<string>,
  columnNameToHeaderLabelMap: ColumnNameToHeaderLabelMap,
  patientDetailsGroupHeader: string,
): Array<Array<string>> {
  const result: Array<Array<string>> = [...range(download.report.length + 3).map(() => [])];
  const groups = getGroups(
    download,
    patientGrid,
    forms,
    formSchemas,
    columnNamesToInclude,
    columnNameToHeaderLabelMap,
    patientDetailsGroupHeader,
  );

  groups.forEach((group) => {
    group.sections.forEach((section, sectionIndex) => {
      section.columns.forEach((column, columnIndex) => {
        result[0].push(sectionIndex === 0 && columnIndex === 0 ? group.header : '');
        result[1].push(columnIndex === 0 ? section.header : '');
        result[2].push(column.header);

        column.values.forEach((columnValue, columnValueIndex) => {
          result[3 + columnValueIndex].push(`${columnValue}`);
        });
      });
    });
  });

  return result;
}

export function getSectionRepetitionsRequiredPerForm(
  download: PatientGridDownloadGet,
  forms: Array<FormGet>,
): Record<string, number> {
  return forms
    .map((form) => ({
      form,
      requiredColumns: max(
        download.report.map((row) => row[form.encounterType.uuid]).map((x) => (x as Array<unknown>)?.length ?? 0),
      ),
    }))
    .reduce<Record<string, number>>((acc, result) => {
      acc[result.form.uuid] = result.requiredColumns;
      return acc;
    }, {});
}

function getGroups(
  download: PatientGridDownloadGet,
  patientGrid: PatientGridGet,
  forms: Array<FormGet>,
  formSchemas: Record<string, FormSchema>,
  columnNamesToInclude: Array<string>,
  columnNameToHeaderLabelMap: ColumnNameToHeaderLabelMap,
  patientDetailsGroupHeader: string,
) {
  const result: Array<{
    header: string;
    sections: Array<{
      header: string;
      columns: Array<{
        header: string;
        values: Array<unknown>;
      }>;
    }>;
  }> = [];

  // Step 1: Convert patient details to a hardcoded group.
  const patientDetailsGroup = {
    header: patientDetailsGroupHeader,
    sections: [
      {
        header: '',
        columns: [],
      },
    ],
  };

  if (columnNamesToInclude.includes(patientDetailsNameColumnName)) {
    patientDetailsGroup.sections[0].columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsNameColumnName],
      values: download.report.map((row) => row[patientDetailsNameColumnName]),
    });
  }

  if (columnNamesToInclude.includes(patientDetailsCountryColumnName)) {
    patientDetailsGroup.sections[0].columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsCountryColumnName],
      values: download.report.map((row) => row[patientDetailsCountryColumnName]),
    });
  }

  if (columnNamesToInclude.includes(patientDetailsStructureColumnName)) {
    patientDetailsGroup.sections[0].columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsStructureColumnName],
      values: download.report.map((row) => row[patientDetailsStructureColumnName]),
    });
  }

  if (columnNamesToInclude.includes(patientDetailsGenderColumnName)) {
    patientDetailsGroup.sections[0].columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsGenderColumnName],
      values: download.report.map((row) => row[patientDetailsGenderColumnName]),
    });
  }

  if (columnNamesToInclude.includes(patientDetailsAgeCategoryColumnName)) {
    patientDetailsGroup.sections[0].columns.push({
      header: columnNameToHeaderLabelMap[patientDetailsAgeCategoryColumnName],
      values: download.report.map((row) => row[patientDetailsAgeCategoryColumnName]),
    });
  }

  if (patientDetailsGroup.sections[0].columns.length) {
    result.push(patientDetailsGroup);
  }

  //
  // Step 2: Convert forms to groups.
  //
  const requiredFormRepetitions = getSectionRepetitionsRequiredPerForm(download, forms);
  for (const form of forms) {
    const formSchema = formSchemas[getFormSchemaReferenceUuid(form)];

    if (!formSchema) {
      continue;
    }

    for (let repetition = 0; repetition < requiredFormRepetitions[form.uuid]; repetition++) {
      const group = {
        header: form.name,
        sections: [],
      };

      for (const formSchemaPage of formSchema.pages ?? []) {
        for (const formSchemaSection of formSchemaPage.sections ?? []) {
          const section = {
            header: formSchemaSection.label,
            columns: [],
          };

          for (const question of formSchemaSection.questions ?? []) {
            const questionColumnName = getFormSchemaQuestionColumnName(form, question);
            const matchingPatientGridColumnUuid = patientGrid.columns.find(
              (column) => column.name === questionColumnName,
            )?.uuid;

            if (!columnNamesToInclude.includes(questionColumnName) || !matchingPatientGridColumnUuid) {
              continue;
            }

            const column = {
              header: columnNameToHeaderLabelMap[questionColumnName],
              values: [],
            };

            for (const row of download.report) {
              const rowEncounters = row[form.encounterType.uuid];
              const thisColumnEncounter = Array.isArray(rowEncounters) ? rowEncounters[repetition] : undefined;

              if (thisColumnEncounter) {
                column.values.push(thisColumnEncounter[matchingPatientGridColumnUuid]?.value ?? '');
              } else {
                column.values.push('');
              }
            }

            section.columns.push(column);
          }

          if (section.columns.length) {
            group.sections.push(section);
          }
        }
      }

      if (group.sections.length) {
        result.push(group);
      }
    }
  }

  return result;
}

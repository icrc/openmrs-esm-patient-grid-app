import { EncounterGet, FormGet, FormSchema, PatientGridDownloadGet, PatientGridGet } from '../api';
import max from 'lodash-es/max';
import {
  getFormAgeColumnName,
  getFormDateColumnName,
  getFormSchemaQuestionColumnName,
  patientDetailsAgeCategoryColumnName,
  patientDetailsCountryColumnName,
  patientDetailsGenderColumnName,
  patientDetailsNameColumnName,
  patientDetailsPatientId01ColumnName,
  patientDetailsPatientId02ColumnName,
  patientDetailsStructureColumnName,
} from './columnNames';
import { getFormSchemaReferenceUuid } from './formSchema';
import { LocalFilter } from './useInlinePatientGridEditing';
import { formatDate } from '../grid-utils/formatDate';

export function getPatientGridDownloadReportData(
  download: PatientGridDownloadGet,
  patientGrid: PatientGridGet,
  forms: Array<FormGet>,
  formSchemas: Record<string, FormSchema>,
  columnNamesToInclude: Array<string>,
  patientDetailsGroupHeader: string,
  filters: Array<LocalFilter>,
) {
  const groups = getGroups(
    download,
    patientGrid,
    forms,
    formSchemas,
    columnNamesToInclude,
    patientDetailsGroupHeader,
    filters,
  );
  const result = [];

  groups.forEach((group) => {
    const encountersData: Array<Array<string>> = [];
    result.push({ header: group.header, data: encountersData });
    group.sections.forEach((section, sectionIndex) => {
      section.columns.forEach((column, columnIndex) => {
        encountersData[0] = encountersData[0] || [];
        encountersData[0].push(columnIndex === 0 ? section.header : '');
        encountersData[1] = encountersData[1] || [];
        encountersData[1].push(column.header);

        column.values.forEach((columnValue, columnValueIndex) => {
          encountersData[2 + columnValueIndex] = encountersData[2 + columnValueIndex] || [];
          encountersData[2 + columnValueIndex].push(`${columnValue}`);
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
  patientDetailsGroupHeader: string,
  filters: Array<LocalFilter>,
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

  function addValueToColumn(columns, columnName, value) {
    if (columnNamesToInclude.includes(columnName)) {
      let column = columns.find((c) => c.header === getDisplayFromColumnName(columnName));
      if (!column) {
        column = {
          header: getDisplayFromColumnName(columnName),
          values: [],
        };
        columns.push(column);
      }
      column.values.push(value);
    }
  }

  function getDisplayFromColumnName(columnName) {
    return patientGrid.columns.find((c) => c.name === columnName).display;
  }

  download.report.forEach((row) => {
    for (const form of forms.filter((f) => f.retired === false)) {
      const formSchema = formSchemas[getFormSchemaReferenceUuid(form)];

      if (!formSchema) {
        continue;
      }

      let isExistingGroup = false;
      let group = result.find((s) => s.header === form.display);
      if (!group) {
        group = {
          header: form.display,
          sections: [],
        };
      } else {
        isExistingGroup = true;
      }

      const allEncounters = row[form.encounterType.uuid] as [EncounterGet];
      const filteredEncounters = [];

      if (allEncounters?.length > 0) {
        // Add to filtered encounters the ones affected by filters
        allEncounters.forEach((e) => {
          const encounterNeedsFiltering = filters.find((f) => {
            return e[f.columnUuid] !== undefined;
          });
          if (!encounterNeedsFiltering) {
            filteredEncounters.push(e);
          }
        });

        // Apply filtering to encounters
        filters.forEach((filter) => {
          const rows = allEncounters.filter((row) => {
            const rowValue = row[filter.columnUuid];
            if (!rowValue) {
              return false;
            }
            if (typeof rowValue === 'object') {
              if (rowValue.value && typeof rowValue.value === 'object') {
                return rowValue.value.uuid === filter.operand;
              } else {
                return `${rowValue.value}` === filter.operand;
              }
            }
            return `${rowValue}` === filter.operand;
          });
          filteredEncounters.push(...rows);
        });

        let patientDetailsSection = group.sections.find((s) => s.header === patientDetailsGroupHeader);
        if (!patientDetailsSection) {
          patientDetailsSection = {
            header: patientDetailsGroupHeader,
            columns: [],
          };
          group.sections.push(patientDetailsSection);
        }

        for (let i = 0; i < filteredEncounters.length; i++) {
          addValueToColumn(
            patientDetailsSection.columns,
            patientDetailsNameColumnName,
            row[patientDetailsNameColumnName],
          );
          addValueToColumn(
            patientDetailsSection.columns,
            patientDetailsPatientId01ColumnName,
            row[patientDetailsPatientId01ColumnName],
          );
          addValueToColumn(
            patientDetailsSection.columns,
            patientDetailsPatientId02ColumnName,
            row[patientDetailsPatientId02ColumnName],
          );
          addValueToColumn(
            patientDetailsSection.columns,
            patientDetailsCountryColumnName,
            row[patientDetailsCountryColumnName],
          );
          addValueToColumn(
            patientDetailsSection.columns,
            patientDetailsStructureColumnName,
            row[patientDetailsStructureColumnName],
          );
          addValueToColumn(
            patientDetailsSection.columns,
            patientDetailsGenderColumnName,
            row[patientDetailsGenderColumnName],
          );
          addValueToColumn(
            patientDetailsSection.columns,
            patientDetailsAgeCategoryColumnName,
            row[patientDetailsAgeCategoryColumnName],
          );
          addValueToColumn(patientDetailsSection.columns, getFormAgeColumnName(form), row[getFormAgeColumnName(form)]);
        }
      }

      for (const formSchemaPage of formSchema.pages ?? []) {
        for (const formSchemaSection of formSchemaPage.sections ?? []) {
          let section = group.sections.find((s) => s.header === formSchemaSection.label);
          const isExistingSection = !!section;
          if (!section) {
            section = {
              header: formSchemaSection.label,
              columns: [],
            };
          }

          for (const question of formSchemaSection.questions ?? []) {
            let questionColumnName: string;
            if (question.type === 'encounterDatetime') {
              questionColumnName = getFormDateColumnName(form);
            } else {
              questionColumnName = getFormSchemaQuestionColumnName(form, question);
            }
            const matchingPatientGridColumnUuid = patientGrid.columns.find(
              (column) => column.name === questionColumnName,
            )?.uuid;

            if (!columnNamesToInclude.includes(questionColumnName) || !matchingPatientGridColumnUuid) {
              continue;
            }
            for (let i = 0; i < patientGrid.columns.length; i++) {
              if (patientGrid.columns[i].name === questionColumnName) {
                questionColumnName = patientGrid.columns[i].display;
              }
            }

            let column = section.columns.find((c) => c.header === questionColumnName);
            if (!column) {
              column = {
                header: questionColumnName,
                values: [],
              };
              section.columns.push(column);
            }

            filteredEncounters.forEach((thisColumnEncounter, index) => {
              if (question.type === 'encounterDatetime') {
                const date = thisColumnEncounter[getFormDateColumnName(form)];
                column.values.push(formatDate(new Date(date)));
              } else {
                const obs = thisColumnEncounter?.[matchingPatientGridColumnUuid];
                column.values.push(typeof obs?.value === 'object' ? `${obs.value.display}` : `${obs?.value ?? ''}`);
              }
            });
          }

          if (section.columns.length && !isExistingSection) {
            group.sections.push(section);
          }
        }
      }

      if (group.sections.length && !isExistingGroup) {
        result.push(group);
      }
    }
  });

  return result;
}

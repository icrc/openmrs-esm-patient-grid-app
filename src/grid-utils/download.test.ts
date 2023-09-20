import { FormGet, FormSchema, PatientGridDownloadGet, PatientGridGet } from '../api';
import {
  patientDetailsAgeCategoryColumnName,
  patientDetailsCountryColumnName,
  patientDetailsGenderColumnName,
  patientDetailsNameColumnName,
  patientDetailsPatientId01ColumnName,
  patientDetailsPatientId02ColumnName,
  patientDetailsStructureColumnName,
} from './columnNames';
import { getSectionRepetitionsRequiredPerForm, getPatientGridDownloadReportData } from './download';

const patientGrid: PatientGridGet = {
  uuid: 'patient-grid',
  name: 'patient-grid',
  retired: false,
  cohort: { uuid: 'cohort' },
  columns: [
    {
      uuid: patientDetailsNameColumnName,
      name: patientDetailsNameColumnName,
      type: 'column',
      datatype: 'NAME',
      display: 'Patient name',
    },

    {
      uuid: patientDetailsPatientId01ColumnName,
      name: patientDetailsPatientId01ColumnName,
      type: 'column',
      datatype: 'NAME',
      display: 'Id01',
    },

    {
      uuid: patientDetailsPatientId02ColumnName,
      name: patientDetailsPatientId02ColumnName,
      type: 'column',
      datatype: 'NAME',
      display: 'Id02',
    },
    {
      uuid: patientDetailsCountryColumnName,
      name: patientDetailsCountryColumnName,
      type: 'column',
      datatype: 'ENC_LOCATION',
      display: 'Country',
    },
    {
      uuid: patientDetailsStructureColumnName,
      name: patientDetailsStructureColumnName,
      type: 'column',
      datatype: 'ENC_LOCATION',
      display: 'Structure',
    },
    {
      uuid: patientDetailsGenderColumnName,
      name: patientDetailsGenderColumnName,
      type: 'column',
      datatype: 'GENDER',
      display: 'Gender',
    },
    {
      uuid: patientDetailsAgeCategoryColumnName,
      name: patientDetailsAgeCategoryColumnName,
      type: 'agecolumn',
      datatype: 'ENC_AGE',
      display: 'Age category',
      encounterType: { uuid: 'f1-enc-type' },
      convertToAgeRange: false,
    },
    {
      uuid: 'formQuestion--f1--q1',
      name: 'formQuestion--f1--q1',
      type: 'column',
      datatype: 'OBS',
      display: 'formQuestion--f1--q1',
    },
  ],
};

const forms: Array<FormGet> = [
  {
    uuid: 'f1',
    name: 'f1',
    display: 'f1',
    encounterType: {
      uuid: 'f1-enc-type',
      name: 'f1-enc-type',
      retired: false,
    },
    version: '1.0',
    retired: false,
    published: true,
    resources: [
      {
        uuid: 'f1',
        name: 'JSON schema',
        valueReference: 'f1',
      },
    ],
  },
  {
    uuid: 'f2',
    name: 'f2',
    display: 'f2',
    encounterType: {
      uuid: 'f2-enc-type',
      name: 'f2-enc-type',
      retired: false,
    },
    version: '1.0',
    retired: false,
    published: true,
    resources: [
      {
        uuid: 'f3',
        name: 'JSON schema',
        valueReference: 'f3',
      },
    ],
  },
  {
    uuid: 'f3',
    name: 'f3',
    display: 'f3',
    encounterType: {
      uuid: 'f3-enc-type',
      name: 'f3-enc-type',
      retired: false,
    },
    version: '1.0',
    retired: false,
    published: true,
    resources: [
      {
        uuid: 'f3',
        name: 'JSON schema',
        valueReference: 'f3',
      },
    ],
  },
];

const formSchemas: Record<string, FormSchema> = {
  f1: {
    uuid: 'f1',
    display: 'f1',
    name: 'f1',
    encounter: 'f1-enc-type',
    pages: [
      {
        label: 'f1',
        sections: [
          {
            label: 's1',
            isExpanded: true,
            questions: [
              {
                id: 'q1',
                label: 'q1',
                type: 'obs',
                questionOptions: {
                  rendering: 'radio',
                  concept: 'c1',
                  answers: [
                    {
                      label: '',
                      concept: 'a1',
                    },
                    {
                      label: '',
                      concept: 'a2',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
    processor: 'EncounterFormProcessor',
  },
  f2: {
    uuid: 'f2',
    display: 'f2',
    name: 'f2',
    encounter: 'f2-enc-type',
    pages: [
      {
        label: 'f2',
        sections: [
          {
            label: 's1',
            isExpanded: true,
            questions: [
              {
                id: 'q1',
                label: 'q1',
                type: 'obs',
                questionOptions: {
                  rendering: 'radio',
                  concept: 'c1',
                  answers: [
                    {
                      label: '',
                      concept: 'a1',
                    },
                    {
                      label: '',
                      concept: 'a2',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
    processor: 'EncounterFormProcessor',
  },
  f3: {
    uuid: 'f3',
    display: 'f3',
    name: 'f3',
    encounter: 'f3-enc-type',
    pages: [
      {
        label: 'f2',
        sections: [
          {
            label: 's1',
            isExpanded: true,
            questions: [
              {
                id: 'q1',
                label: 'q1',
                type: 'obs',
                questionOptions: {
                  rendering: 'radio',
                  concept: 'c1',
                  answers: [
                    {
                      label: '',
                      concept: 'a1',
                    },
                    {
                      label: '',
                      concept: 'a2',
                    },
                  ],
                },
              },
            ],
          },
        ],
      },
    ],
    processor: 'EncounterFormProcessor',
  },
};

const columnNameToHeaderLabelMap = {
  [patientDetailsNameColumnName]: 'Patient name',
  [patientDetailsPatientId01ColumnName]: 'Id01',
  [patientDetailsPatientId02ColumnName]: 'Id02',
  [patientDetailsCountryColumnName]: 'Country',
  [patientDetailsStructureColumnName]: 'Structure',
  [patientDetailsGenderColumnName]: 'Gender',
  [patientDetailsAgeCategoryColumnName]: 'Age category',
};

const download: PatientGridDownloadGet = {
  patientGrid: patientGrid,
  report: [
    {
      uuid: 'row-1',
      [patientDetailsNameColumnName]: 'Patient 1',
      [patientDetailsPatientId01ColumnName]: '111',
      [patientDetailsPatientId02ColumnName]: '111111',
      [patientDetailsCountryColumnName]: 'Country 1',
      [patientDetailsStructureColumnName]: 'Structure 1',
      [patientDetailsGenderColumnName]: 'O',
      [patientDetailsAgeCategoryColumnName]: '18',
      'f1-enc-type': [
        {
          'formQuestion--f1--q1': {
            uuid: 'formQuestion--f1--q1',
            concept: 'c1',
            encounter: { uuid: '1', form: 'f1', encounterType: 'f1-enc-type' },
            value: 'Value 1',
          },
        },
        {
          'formQuestion--f1--q1': {
            uuid: 'formQuestion--f1--q1',
            concept: 'c1',
            encounter: { uuid: '2', form: 'f1', encounterType: 'f1-enc-type' },
            value: 'Value 2',
          },
        },
        {
          'formQuestion--f1--q1': {
            uuid: 'formQuestion--f1--q1',
            concept: 'c1',
            encounter: { uuid: '3', form: 'f1', encounterType: 'f1-enc-type' },
            value: 'Value 3',
          },
        },
      ],
      'f2-enc-type': [{}],
    },
    {
      uuid: 'row-2',
      [patientDetailsNameColumnName]: 'Patient 2',
      [patientDetailsPatientId01ColumnName]: '222',
      [patientDetailsPatientId02ColumnName]: '222222',
      [patientDetailsCountryColumnName]: 'Country 1',
      [patientDetailsStructureColumnName]: 'Structure 1',
      [patientDetailsGenderColumnName]: 'O',
      [patientDetailsAgeCategoryColumnName]: '18',
      'f1-enc-type': [
        {
          'formQuestion--f1--q1': {
            uuid: 'formQuestion--f1--q1',
            concept: 'c1',
            encounter: { uuid: '1', form: 'f1', encounterType: 'f1-enc-type' },
            value: 'Value 4',
          },
        },
      ],
      'f2-enc-type': [{}, {}],
    },
    {
      uuid: 'row-3',
      [patientDetailsNameColumnName]: 'Patient 3',
      [patientDetailsPatientId01ColumnName]: '333',
      [patientDetailsPatientId02ColumnName]: '333333',
      [patientDetailsCountryColumnName]: 'Country 1',
      [patientDetailsStructureColumnName]: 'Structure 1',
      [patientDetailsGenderColumnName]: 'O',
      [patientDetailsAgeCategoryColumnName]: '18',
      'fx-enc-type': [{}, {}, {}, {}],
    },
  ],
};

describe(getSectionRepetitionsRequiredPerForm, () => {
  it('returns expected count per form', () => {
    const actual = getSectionRepetitionsRequiredPerForm(download, forms);
    expect(actual).toEqual({
      f1: 3,
      f2: 2,
      f3: 0,
    });
  });
});

describe(getPatientGridDownloadReportData, () => {
  it('returns expected spreadsheet data', () => {
    const patientDetailsGroupHeader = 'Patient details';
    const columnNamesToInclude = [
      patientDetailsNameColumnName,
      patientDetailsCountryColumnName,
      patientDetailsStructureColumnName,
      patientDetailsGenderColumnName,
      patientDetailsAgeCategoryColumnName,
      'formQuestion--f1--q1',
    ];
    const filters = [];

    const data = getPatientGridDownloadReportData(
      download,
      patientGrid,
      forms,
      formSchemas,
      columnNamesToInclude,
      patientDetailsGroupHeader,
      filters,
    );

    expect(data).toEqual([
      {
        header: 'f1',
        data: [
          ['Patient details', '', '', '', '', 's1'],
          [
            columnNameToHeaderLabelMap[patientDetailsNameColumnName],
            columnNameToHeaderLabelMap[patientDetailsCountryColumnName],
            columnNameToHeaderLabelMap[patientDetailsStructureColumnName],
            columnNameToHeaderLabelMap[patientDetailsGenderColumnName],
            columnNameToHeaderLabelMap[patientDetailsAgeCategoryColumnName],
            'formQuestion--f1--q1',
          ],
          ['Patient 1', 'Country 1', 'Structure 1', 'O', '18', 'Value 1'],
          ['Patient 1', 'Country 1', 'Structure 1', 'O', '18', 'Value 2'],
          ['Patient 1', 'Country 1', 'Structure 1', 'O', '18', 'Value 3'],
          ['Patient 2', 'Country 1', 'Structure 1', 'O', '18', 'Value 4'],
        ],
      },
      {
        header: 'f2',
        data: [
          ['Patient details', '', '', '', ''],
          [
            columnNameToHeaderLabelMap[patientDetailsNameColumnName],
            columnNameToHeaderLabelMap[patientDetailsCountryColumnName],
            columnNameToHeaderLabelMap[patientDetailsStructureColumnName],
            columnNameToHeaderLabelMap[patientDetailsGenderColumnName],
            columnNameToHeaderLabelMap[patientDetailsAgeCategoryColumnName],
          ],
          ['Patient 1', 'Country 1', 'Structure 1', 'O', '18'],
          ['Patient 2', 'Country 1', 'Structure 1', 'O', '18'],
          ['Patient 2', 'Country 1', 'Structure 1', 'O', '18'],
        ],
      },
    ]);
  });
});

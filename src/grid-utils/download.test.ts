import { FormGet, FormSchema, PatientGridDownloadGet, PatientGridGet } from '../api';
import {
  patientDetailsAgeCategoryColumnName,
  patientDetailsCountryColumnName,
  patientDetailsGenderColumnName,
  patientDetailsNameColumnName,
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
    },
    {
      uuid: patientDetailsCountryColumnName,
      name: patientDetailsCountryColumnName,
      type: 'column',
      datatype: 'ENC_LOCATION',
    },
    {
      uuid: patientDetailsStructureColumnName,
      name: patientDetailsStructureColumnName,
      type: 'column',
      datatype: 'ENC_LOCATION',
    },
    {
      uuid: patientDetailsGenderColumnName,
      name: patientDetailsGenderColumnName,
      type: 'column',
      datatype: 'GENDER',
    },
    {
      uuid: patientDetailsAgeCategoryColumnName,
      name: patientDetailsAgeCategoryColumnName,
      type: 'agecolumn',
      datatype: 'ENC_AGE',
      encounterType: { uuid: 'f1-enc-type' },
      convertToAgeRange: false,
    },
  ],
};

const forms: Array<FormGet> = [
  {
    uuid: 'f1',
    name: 'f1',
    encounterType: {
      uuid: 'f1-enc-type',
      name: 'f1-enc-type',
      retired: false,
    },
    version: '1.0',
    retired: false,
    published: true,
  },
  {
    uuid: 'f2',
    name: 'f2',
    encounterType: {
      uuid: 'f2-enc-type',
      name: 'f2-enc-type',
      retired: false,
    },
    version: '1.0',
    retired: false,
    published: true,
  },
  {
    uuid: 'f3',
    name: 'f3',
    encounterType: {
      uuid: 'f3-enc-type',
      name: 'f3-enc-type',
      retired: false,
    },
    version: '1.0',
    retired: false,
    published: true,
  },
];

const formSchemas: Record<string, FormSchema> = {};

const columnNameToHeaderLabelMap = {
  [patientDetailsNameColumnName]: 'Patient name',
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
      [patientDetailsCountryColumnName]: 'Country 1',
      [patientDetailsStructureColumnName]: 'Structure 1',
      [patientDetailsGenderColumnName]: 'O',
      [patientDetailsAgeCategoryColumnName]: '18',
      'f1-enc-type': [{}, {}, {}],
      'f2-enc-type': [{}],
    },
    {
      uuid: 'row-2',
      [patientDetailsNameColumnName]: 'Patient 2',
      [patientDetailsCountryColumnName]: 'Country 1',
      [patientDetailsStructureColumnName]: 'Structure 1',
      [patientDetailsGenderColumnName]: 'O',
      [patientDetailsAgeCategoryColumnName]: '18',
      'f1-enc-type': [{}],
      'f2-enc-type': [{}, {}],
    },
    {
      uuid: 'row-3',
      [patientDetailsNameColumnName]: 'Patient 3',
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
      [patientDetailsGroupHeader, '', '', '', ''],
      ['', '', '', '', ''],
      [
        columnNameToHeaderLabelMap[patientDetailsNameColumnName],
        columnNameToHeaderLabelMap[patientDetailsCountryColumnName],
        columnNameToHeaderLabelMap[patientDetailsStructureColumnName],
        columnNameToHeaderLabelMap[patientDetailsGenderColumnName],
        columnNameToHeaderLabelMap[patientDetailsAgeCategoryColumnName],
      ],
      ['Patient 1', 'Country 1', 'Structure 1', 'O', '18'],
      ['Patient 2', 'Country 1', 'Structure 1', 'O', '18'],
      ['Patient 3', 'Country 1', 'Structure 1', 'O', '18'],
    ]);
  });
});

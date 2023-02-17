import { formatDate } from '@openmrs/esm-framework';
import {
  FormGet,
  FormSchema,
  PatientGridReportGet,
  useMergedSwr,
  PastEncounterGet,
  PastEncounterObsGet,
  useGetAllPastEncounters,
} from '../api';
import {
  getFormDateColumnName,
  getFormSchemaQuestionColumnName,
  getFormSchemaQuestionsMappableToColumns,
  getReactTableColumnDefForForm,
  useColumnNameToHeaderLabelMap,
  getAllReportColumnNames,
} from '../grid-utils';

export function useHistoricEncountersGrid(
  patientId: string,
  form: FormGet,
  formSchema: FormSchema,
  report: PatientGridReportGet,
) {
  const historicEncountersSwr = useGetAllPastEncounters(patientId, form.encounterType.uuid, report.patientGrid.uuid);
  const columnNameToHeaderLabelMapSwr = useColumnNameToHeaderLabelMap();
  return useMergedSwr(
    () => {
      const { data: historicEncounters } = historicEncountersSwr;
      const { data: columnNameToHeaderLabelMap } = columnNameToHeaderLabelMapSwr;
      const columnNamesToInclude = getAllReportColumnNames(report);
      const columns = [
        getReactTableColumnDefForForm(form, formSchema, columnNameToHeaderLabelMap, columnNamesToInclude),
      ];
      const data = createDataFromHistoricEncounters(historicEncounters, form, formSchema);
      return { columns, data };
    },
    [historicEncountersSwr, columnNameToHeaderLabelMapSwr],
    [patientId, form, formSchema, report],
  );
}

function createDataFromHistoricEncounters(
  historicEncounters: Array<PastEncounterGet>,
  form: FormGet,
  formSchema: FormSchema,
) {
  // The issue at this point is that the historic encounters is essentially a list of bare observations.
  // In order to get it loaded into the grid (at the right location), we must "match it back" with
  // the question(s) from the form schema which led to the generation of the obs in the first place.
  const result: Array<Record<string, string>> = [];
  const relevantQuestions = getFormSchemaQuestionsMappableToColumns(form, formSchema);

  for (const encounter of historicEncounters) {
    const encounterRow: Record<string, string> = {
      [getFormDateColumnName(form)]: formatDate(new Date(encounter.encounterDatetime)),
    };

    for (const { question } of relevantQuestions) {
      const conceptUuid = question.questionOptions.concept;
      const matchingObs = conceptUuid ? encounter.obs.find((obs) => obs.concept.uuid === conceptUuid) : undefined;
      if (matchingObs) {
        encounterRow[getFormSchemaQuestionColumnName(form, question)] = obsToDisplayString(matchingObs);
      }
    }

    result.push(encounterRow);
  }

  return result;
}

function obsToDisplayString(obs: PastEncounterObsGet) {
  // TODO: This is probably not exhaustive yet. Other things an obs could be here?
  if (obs.value === null || obs.value === undefined) {
    return '';
  } else if (typeof obs.value === 'object') {
    return obs.value.display ?? ''; // TODO: Is this localized? Should it be?
  } else {
    return `${obs.value}`;
  }
}

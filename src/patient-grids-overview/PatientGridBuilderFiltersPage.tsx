import React from 'react';
import {
  Select,
  SelectSkeleton,
  SelectItem,
  Stack,
  RadioButtonGroup,
  RadioButton,
  DatePicker,
  DatePickerInput,
} from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Hr } from '../components';
import styles from './PatientGridBuilderFiltersPage.scss';
import { WizardPageProps } from './usePatientGridWizard';
import { PatientGridBuilderHeader } from './PatientGridBuilderHeader';
import {
  useAllGenders,
  useGetAllAgeRanges,
  useGetAllCountryLocations,
  useGetAllStructureLocations,
  useAllPeriods,
  PatientGridFilterPost,
} from '../api';
import { formatDate } from '../grid-utils';

export function PatientGridBuilderFiltersPage({ page, pages, goToPrevious, state, setState }: WizardPageProps) {
  const { t } = useTranslation();
  const { data: countryLocations } = useGetAllCountryLocations();
  const { data: structureLocations } = useGetAllStructureLocations(
    countryLocations?.find((location) => location.id === state.countryFilter?.operand)?.name,
  );
  const genders = useAllGenders();
  const periods = useAllPeriods();
  const { data: ageRanges } = useGetAllAgeRanges();

  const setLastPeriodFilter = (value: string) => {
    const periodFilter: PatientGridFilterPost = {
      name: '',
      operand: '',
    };
    const now: Date = new Date();
    switch (value) {
      case 'lastDay':
        periodFilter.name = 'Last Day';
        periodFilter.operand = JSON.stringify({
          fromDate: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1)),
          toDate: formatDate(now),
        });
        break;

      case 'lastWeek':
        periodFilter.name = 'Last Week';
        periodFilter.operand = JSON.stringify({
          fromDate: formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7)),
          toDate: formatDate(now),
        });
        break;

      case 'lastMonth':
        periodFilter.name = 'Last Month';
        periodFilter.operand = JSON.stringify({
          fromDate: formatDate(new Date(now.getFullYear(), now.getMonth() - 1, now.getDate())),
          toDate: formatDate(now),
        });
        break;

      case 'lastQuarter':
        periodFilter.name = 'Last Quarter';
        periodFilter.operand = JSON.stringify({
          fromDate: formatDate(new Date(now.getFullYear(), now.getMonth() - 3, now.getDate())),
          toDate: formatDate(now),
        });
        break;

      case 'lastYear':
        periodFilter.name = 'Last Year';
        periodFilter.operand = JSON.stringify({
          fromDate: formatDate(new Date(now.getFullYear() - 1, now.getMonth(), now.getDate())),
          toDate: formatDate(now),
        });
        break;

      default:
        break;
    }
    return periodFilter;
  };

  const setCustomPeriodFilter = (value: Array<Date>) => {
    const periodFilter: PatientGridFilterPost = {
      name: 'Custom Range',
      operand: JSON.stringify({
        fromDate: formatDate(new Date(value[0])),
        toDate: formatDate(new Date(value[1])),
      }),
    };
    return periodFilter;
  };

  return (
    <Stack gap={6}>
      <PatientGridBuilderHeader
        page={page}
        pages={pages}
        goToPrevious={goToPrevious}
        title={t('patientGridFilters', 'Grid filters')}
      />

      <Hr />
      <h5 className={styles.patientDetailsHeader}>{t('patientGridDetailsHeader', 'Patient details')}</h5>

      {countryLocations ? (
        <Select
          id="country"
          defaultValue={state.countryFilter ?? ''}
          labelText={t('patientGridDetailsCountryLabel', 'Country (required)')}
          onChange={(e) =>
            setState((state) => ({
              ...state,
              countryFilter: e.target.value
                ? {
                    name: countryLocations.find((x) => x.id === e.target.value)?.name ?? e.target.value,
                    operand: e.target.value,
                  }
                : undefined,
              structureFilter: e.target.value ? state.structureFilter : undefined,
            }))
          }>
          <SelectItem value="" text={t('patientGridDetailsCountryPlaceholder', 'Country')} />
          {countryLocations?.map(({ id, name }) => (
            <SelectItem key={id} value={id} text={name} />
          ))}
        </Select>
      ) : (
        <SelectSkeleton />
      )}

      {!state.countryFilter || structureLocations ? (
        <Select
          id="structure"
          defaultValue={state.structureFilter?.operand ?? ''}
          labelText={t('patientGridDetailsStructureLabel', 'Structure')}
          disabled={!state.countryFilter}
          onChange={(e) =>
            setState((state) => ({
              ...state,
              structureFilter: e.target.value
                ? {
                    name: structureLocations.find((x) => x.id === e.target.value)?.name ?? e.target.value,
                    operand: e.target.value,
                  }
                : undefined,
            }))
          }>
          <SelectItem value="" text={t('patientGridDetailsStructurePlaceholder', 'Structure')} />
          {structureLocations?.map(({ id, name }) => (
            <SelectItem key={id} value={id} text={name} />
          ))}
        </Select>
      ) : (
        <SelectSkeleton />
      )}

      <Select
        id="gender"
        defaultValue={state.genderFilter?.operand ?? ''}
        labelText={t('patientGridDetailsGenderLabel', 'Gender')}
        onChange={(e) =>
          setState((state) => ({
            ...state,
            genderFilter: e.target.value
              ? {
                  name: genders.find((x) => x.gender === e.target.value)?.display ?? e.target.value,
                  operand: e.target.value,
                }
              : undefined,
          }))
        }>
        <SelectItem value="" text={t('patientGridDetailsGenderPlaceholder', 'Gender')} />
        {genders.map(({ gender, display }) => (
          <SelectItem key={gender} value={gender} text={display} />
        ))}
      </Select>

      {ageRanges ? (
        <Select
          id="ageCategory"
          defaultValue=""
          labelText={t('patientGridDetailsAgeCategoryLabel', 'Age category')}
          onChange={(e) => {
            if (e.target.value === '') {
              setState((state) => ({
                ...state,
                ageCategoryFilter: undefined,
              }));
            } else {
              const ageRangeIndex = +e.target.value;
              const ageRange = ageRanges[ageRangeIndex];
              if (!ageRange) {
                return;
              }

              setState((state) => ({
                ...state,
                ageCategoryFilter: {
                  name: ageRange.display,
                  operand: JSON.stringify(ageRange),
                },
              }));
            }
          }}>
          <SelectItem value="" text={t('patientGridDetailsAgeCategoryPlaceholder', 'Age category')} />
          {ageRanges.map((ageRange, i) => (
            <SelectItem key={ageRange.label} value={i} text={ageRange.display} />
          ))}
        </Select>
      ) : (
        <SelectSkeleton />
      )}
      <Select
        id="periodType"
        defaultValue={state.periodFilterType ?? ''}
        labelText={t('patientGridDetailsPeriodTypeLabel', 'Period')}
        onChange={(e) =>
          setState((state) => ({
            ...state,
            periodFilterType: e.target.value ? e.target.value : undefined,
          }))
        }>
        <SelectItem value="" text={t('patientGridDetailsPeriodPlaceholder', 'Period')} />
        {periods.map(({ period, display }) => (
          <SelectItem key={period} value={period} text={display} />
        ))}
      </Select>
      {state.periodFilterType === 'last' && (
        <RadioButtonGroup
          legendText="Last period"
          name="last-period-options"
          orientation="vertical"
          onChange={(value) =>
            setState((state) => ({
              ...state,
              periodFilter: value ? setLastPeriodFilter(value) : undefined,
            }))
          }>
          <RadioButton id="lastDay" labelText="Last Day" value="lastDay" />
          <RadioButton id="lastWeek" labelText="Last Week" value="lastWeek" />
          <RadioButton id="lastMonth" labelText="Last Month" value="lastMonth" />
          <RadioButton id="lastQuarter" labelText="Last Quarter" value="lastQuarter" />
          <RadioButton id="lastYear" labelText="Last Year" value="lastYear" />
        </RadioButtonGroup>
      )}
      {state.periodFilterType === 'custom' && (
        <div>
          <DatePicker
            datePickerType="range"
            onChange={(value: Array<Date>) =>
              value.length === 2 &&
              setState((state) => ({
                ...state,
                periodFilter: value ? setCustomPeriodFilter(value) : undefined,
              }))
            }>
            <DatePickerInput id="startDate" placeholder="mm/dd/yyyy" labelText="Start date(inclusive)" size="md" />
            <DatePickerInput id="endDate" placeholder="mm/dd/yyyy" labelText="End date(inclusive)" size="md" />
          </DatePicker>
        </div>
      )}
    </Stack>
  );
}

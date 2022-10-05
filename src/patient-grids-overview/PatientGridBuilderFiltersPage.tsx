import React from 'react';
import { Form, Select, SelectSkeleton, SelectItem, Stack } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Hr } from '../components';
import styles from './PatientGridBuilderFiltersPage.scss';
import { WizardPageProps } from './usePatientGridWizard';
import { PatientGridBuilderHeader } from './PatientGridBuilderHeader';
import { useAllGenders, useGetAllAgeRanges, useGetAllCountryLocations, useGetAllStructureLocations } from '../api';

export function PatientGridBuilderFiltersPage({ page, pages, goToPrevious, state, setState }: WizardPageProps) {
  const { t } = useTranslation();
  const { data: countryLocations } = useGetAllCountryLocations();
  const { data: structureLocations } = useGetAllStructureLocations(
    countryLocations?.find((location) => location.id === state.countryFilter?.operand)?.name,
  );
  const genders = useAllGenders();
  const { data: ageRanges } = useGetAllAgeRanges();

  return (
    <Form>
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
            labelText={t('patientGridDetailsCountryLabel', 'Country')}
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
              gender: e.target.value
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
            onChange={(e) =>
              setState((state) => ({
                ...state,
                ageCategoryFilter: e.target.value
                  ? {
                      name: 'tbd',
                      operand: e.target.value,
                    }
                  : undefined,
              }))
            }>
            <SelectItem value="" text={t('patientGridDetailsAgeCategoryPlaceholder', 'Age category')} />
            {ageRanges.map((ageRange) => (
              // TODO: It's not clear at the moment what the identifying/unique attribute of an age range is.
              // They are unforunately lacking a unique ID. We'll have to wait until we know how filters are POSTed
              // with a patient grid.
              <SelectItem key={ageRange.label} value={ageRange.label} text={ageRange.display} />
            ))}
          </Select>
        ) : (
          <SelectSkeleton />
        )}
      </Stack>
    </Form>
  );
}

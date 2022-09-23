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
    countryLocations?.find((location) => location.id === state.countryLocationId)?.name,
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
            defaultValue={state.countryLocationId ?? 'placeholder'}
            labelText={t('patientGridDetailsCountryLabel', 'Country')}
            onChange={(e) =>
              setState((state) => ({
                ...state,
                countryLocationId: e.target.value,
              }))
            }>
            <SelectItem
              disabled
              hidden
              value="placeholder"
              text={t('patientGridDetailsCountryPlaceholder', 'Country')}
            />
            {countryLocations?.map(({ id, name }) => (
              <SelectItem key={id} value={id} text={name} />
            ))}
          </Select>
        ) : (
          <SelectSkeleton />
        )}

        {!state.countryLocationId || structureLocations ? (
          <Select
            id="structure"
            defaultValue={state.structureLocationId ?? 'placeholder'}
            labelText={t('patientGridDetailsStructureLabel', 'Structure')}
            disabled={!state.countryLocationId}
            onChange={(e) =>
              setState((state) => ({
                ...state,
                structureLocationId: e.target.value,
              }))
            }>
            <SelectItem
              disabled
              hidden
              value="placeholder"
              text={t('patientGridDetailsStructurePlaceholder', 'Structure')}
            />
            {structureLocations?.map(({ id, name }) => (
              <SelectItem key={id} value={id} text={name} />
            ))}
          </Select>
        ) : (
          <SelectSkeleton />
        )}

        <Select
          id="gender"
          defaultValue={state.gender ?? 'placeholder'}
          labelText={t('patientGridDetailsGenderLabel', 'Gender')}
          onChange={(e) => setState((state) => ({ ...state, gender: e.target.value }))}>
          <SelectItem disabled hidden value="placeholder" text={t('patientGridDetailsGenderPlaceholder', 'Gender')} />
          {genders.map(({ gender, display }) => (
            <SelectItem key={gender} value={gender} text={display} />
          ))}
        </Select>

        {ageRanges ? (
          <Select
            id="ageCategory"
            defaultValue="placeholder"
            labelText={t('patientGridDetailsAgeCategoryLabel', 'Age category')}>
            <SelectItem
              disabled
              hidden
              value="placeholder"
              text={t('patientGridDetailsAgeCategoryPlaceholder', 'Age category')}
            />
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

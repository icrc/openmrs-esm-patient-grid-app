import React from 'react';
import { Stack, TextArea, TextInput, Checkbox } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import { Hr } from '../components';
import { PatientGridBuilderContinueButton } from './PatientGridBuilderContinueButton';
import { WizardPageProps } from './usePatientGridWizard';
import { PatientGridBuilderHeader } from './PatientGridBuilderHeader';

export function PatientGridBuilderDetailsPage({
  state,
  setState,
  page,
  pages,
  goToNext,
  goToPrevious,
}: WizardPageProps) {
  const { t } = useTranslation();
  const canContinue = !!state.name?.trim().length;

  return (
    <Stack gap={6}>
      <PatientGridBuilderHeader
        page={page}
        pages={pages}
        goToPrevious={goToPrevious}
        title={t('patientGridDetails', 'Grid details')}
      />

      {/* <Select
          id="gridToDuplicate"
          defaultValue="placeholder"
          labelText={t('patientGridDetailsDuplicateSelectLabel', 'Base on / duplicate from existing patient grid')}>
          <SelectItem
            disabled
            hidden
            value="placeholder"
            text={t('patientGridDetailsDuplicateSelectPlaceholder', 'Select an existing grid (optional)')}
          />
        </Select> */}

      <Hr />

      <TextInput
        id="gridName"
        labelText={'* ' + t('patientGridDetailsNameInputLabel', 'Grid name')}
        invalidText={t('requiredField', 'This field is required!')}
        invalid={!canContinue}
        value={state.name ?? ''}
        onChange={(e) => setState((state) => ({ ...state, name: e.target.value }))}
      />

      <TextArea
        id="gridDescription"
        enableCounter
        maxCount={300}
        labelText={t('patientGridDetailsDescriptionInputLabel', 'Describe the purpose of this grid in a few words')}
        value={state.description ?? ''}
        onChange={(e) => setState((state) => ({ ...state, description: e.target.value }))}
      />

      <Checkbox
        id="createGridShared"
        labelText={t('patientGridDetailsShareGridCheckboxLabel', 'Share this grid with others')}
        checked={state.shared}
        onChange={(_, { checked }) => setState((state) => ({ ...state, shared: checked }))}
      />

      <Hr />
      <PatientGridBuilderContinueButton disabled={!canContinue} onClick={goToNext}>
        {t('patientGridDetailsContinueButton', 'Continue by configuring grid sections')}
      </PatientGridBuilderContinueButton>
    </Stack>
  );
}

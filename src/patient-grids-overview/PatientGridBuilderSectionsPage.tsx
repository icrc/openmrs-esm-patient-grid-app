import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormGroup, Checkbox, CheckboxSkeleton, Stack } from '@carbon/react';
import { WizardPageProps } from './usePatientGridWizard';
import { PatientGridBuilderHeader } from './PatientGridBuilderHeader';
import { Hr } from '../components';
import { PatientGridBuilderContinueButton } from './PatientGridBuilderContinueButton';
import { useGetAllPublishedPrivilegeFilteredForms } from '../api';

export function PatientGridBuilderSectionsPage({
  state,
  setState,
  page,
  pages,
  goToNext,
  goToPrevious,
}: WizardPageProps) {
  const { t } = useTranslation();
  const { data: allForms } = useGetAllPublishedPrivilegeFilteredForms();
  const canContinue = state.selectedForms.length > 0;

  return (
    <Form>
      <Stack gap={6}>
        <PatientGridBuilderHeader
          page={page}
          pages={pages}
          goToPrevious={goToPrevious}
          title={t('patientGridSections', 'Grid sections')}
        />
        <FormGroup legendText={t('patientGridSectionsLabel', 'Enable/Disable list sections')}>
          {allForms ? (
            allForms.map((form) => (
              <Checkbox
                key={form.uuid}
                id={form.uuid}
                labelText={form.display}
                checked={state.selectedForms.some((selectedForm) => form.uuid === selectedForm.uuid)}
                onChange={(_, { checked }) =>
                  setState((state) => ({
                    ...state,
                    selectedForms: checked
                      ? [...state.selectedForms, form]
                      : state.selectedForms.filter((selectedForm) => selectedForm.uuid !== form.uuid),
                  }))
                }
              />
            ))
          ) : (
            <>
              <CheckboxSkeleton />
              <CheckboxSkeleton />
              <CheckboxSkeleton />
              <CheckboxSkeleton />
              <CheckboxSkeleton />
            </>
          )}
        </FormGroup>

        <Hr />
        <PatientGridBuilderContinueButton disabled={!canContinue} onClick={goToNext}>
          {t('patientGridSectionsContinueButton', 'Continue by configuring grid filters')}
        </PatientGridBuilderContinueButton>
      </Stack>
    </Form>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Form, FormGroup, Checkbox, Stack } from '@carbon/react';
import { WizardPageProps } from './usePatientGridWizard';
import { PatientGridBuilderHeader } from './PatientGridBuilderHeader';
import { Hr } from '../components';
import { PatientGridBuilderContinueButton } from './PatientGridBuilderContinueButton';

export function PatientGridBuilderSectionsPage({ page, pages, goToNext, goToPrevious }: WizardPageProps) {
  const { t } = useTranslation();

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
          <Checkbox id="a" labelText="Lorem"></Checkbox>
          <Checkbox id="b" labelText="Ipsum"></Checkbox>
          <Checkbox id="c" labelText="Dolor"></Checkbox>
          <Checkbox id="d" labelText="Sit"></Checkbox>
          <Checkbox id="e" labelText="Amit"></Checkbox>
          <Checkbox id="f" labelText="Consetetur"></Checkbox>
        </FormGroup>

        <Hr />

        <PatientGridBuilderContinueButton onClick={goToNext}>
          {t('patientGridSectionsContinueButton', 'Continue by configuring grid filters')}
        </PatientGridBuilderContinueButton>
      </Stack>
    </Form>
  );
}

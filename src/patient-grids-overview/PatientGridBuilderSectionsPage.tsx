import React from "react";
import { useTranslation } from "react-i18next";
import { Form, FormGroup, Checkbox, Stack } from "@carbon/react";
import { WizardPageProps } from "./usePatientGridWizard";
import { PatientGridBuilderHeader } from "./PatientGridBuilderHeader";
import { Hr } from "../components";
import { PatientGridBuilderContinueButton } from "./PatientGridBuilderContinueButton";

export function PatientGridBuilderSectionsPage({
  page,
  pages,
  goToNext,
  goToPrevious,
}: WizardPageProps) {
  const { t } = useTranslation();

  return (
    <Form>
      <Stack gap={6}>
        <PatientGridBuilderHeader
          page={page}
          pages={pages}
          goToPrevious={goToPrevious}
          title={t("patientGridSections", "Grid sections")}
        />
        <FormGroup
          legendText={t(
            "patientGridSectionsLabel",
            "Enable/Disable list sections"
          )}
        >
          <Checkbox labelText="DEF"></Checkbox>
          <Checkbox labelText="DEF"></Checkbox>
          <Checkbox labelText="DEF"></Checkbox>
        </FormGroup>

        <Hr />

        <PatientGridBuilderContinueButton onClick={goToNext}>
          {t(
            "patientGridSectionsContinueButton",
            "Continue by configuring grid filters"
          )}
        </PatientGridBuilderContinueButton>
      </Stack>
    </Form>
  );
}

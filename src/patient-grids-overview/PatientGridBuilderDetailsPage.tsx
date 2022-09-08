import React from "react";
import {
  Form,
  FormGroup,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Hr } from "../components";
import { PatientGridBuilderContinueButton } from "./PatientGridBuilderContinueButton";
import { WizardPageProps } from "./usePatientGridWizard";
import { PatientGridBuilderHeader } from "./PatientGridBuilderHeader";

export function PatientGridBuilderDetailsPage({
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
          title={t("patientGridDetails", "Grid details")}
        />

        <FormGroup>
          <Select
            defaultValue="placeholder"
            labelText={t(
              "patientGridDetailsDuplicateSelectLabel",
              "Base on / duplicate from existing patient grid"
            )}
          >
            <SelectItem
              disabled
              hidden
              value="placeholder"
              text={t(
                "patientGridDetailsDuplicateSelectPlaceholder",
                "Select an existing grid (optional)"
              )}
            />
          </Select>
        </FormGroup>

        <Hr />

        <FormGroup>
          <TextInput
            labelText={t("patientGridDetailsNameInputLabel", "Grid name")}
          />
        </FormGroup>

        <FormGroup>
          <TextArea
            enableCounter
            maxCount={300}
            labelText={t(
              "patientGridDetailsDescriptionInputLabel",
              "Describe the purpose of this grid in a few words"
            )}
          />
        </FormGroup>

        <Hr />
        <PatientGridBuilderContinueButton onClick={goToNext}>
          {t(
            "patientGridDetailsContinueButton",
            "Continue by configuring grid sections"
          )}
        </PatientGridBuilderContinueButton>
      </Stack>
    </Form>
  );
}

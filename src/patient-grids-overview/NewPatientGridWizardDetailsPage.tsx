import React from "react";
import {
  Button,
  Form,
  FormGroup,
  Select,
  SelectItem,
  Stack,
  TextArea,
  TextInput,
} from "@carbon/react";
import { ChevronRight } from "@carbon/react/icons";
import { useTranslation } from "react-i18next";
import { Hr } from "../components";
import { NewPatientGridWizardContinueButton } from "./NewPatientGridWizardContinueButton";

export function NewPatientGridWizardDetailsPage() {
  const { t } = useTranslation();

  return (
    <Form>
      <Stack gap={6}>
        <FormGroup>
          <Select
            defaultValue="placeholder"
            labelText={t(
              "newPatientGridDuplicateSelectLabel",
              "Base on / duplicate from existing patient list"
            )}
          >
            <SelectItem
              disabled
              hidden
              value="placeholder"
              text={t(
                "newPatientGridDuplicateSelectPlaceholder",
                "Select an existing list (optional)"
              )}
            />
          </Select>
        </FormGroup>

        <Hr />

        <FormGroup>
          <TextInput
            labelText={t("newPatientGridNameInputLabel", "List name")}
          />
        </FormGroup>

        <FormGroup>
          <TextArea
            enableCounter
            maxCount={300}
            labelText={t(
              "newPatientGridDescriptionInputLabel",
              "Describe the purpose of this list in a few words"
            )}
          />
        </FormGroup>

        <Hr />
        <NewPatientGridWizardContinueButton>
          {t(
            "newPatientGridDescriptionContinueButton",
            "Continue by configuring list sections"
          )}
        </NewPatientGridWizardContinueButton>
      </Stack>
    </Form>
  );
}

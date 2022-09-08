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

export function PatientGridBuilderDetailsPage() {
  const { t } = useTranslation();

  return (
    <Form>
      <Stack gap={6}>
        <FormGroup>
          <Select
            defaultValue="placeholder"
            labelText={t(
              "PatientGridDuplicateSelectLabel",
              "Base on / duplicate from existing patient grid"
            )}
          >
            <SelectItem
              disabled
              hidden
              value="placeholder"
              text={t(
                "PatientGridDuplicateSelectPlaceholder",
                "Select an existing grid (optional)"
              )}
            />
          </Select>
        </FormGroup>

        <Hr />

        <FormGroup>
          <TextInput labelText={t("PatientGridNameInputLabel", "Grid name")} />
        </FormGroup>

        <FormGroup>
          <TextArea
            enableCounter
            maxCount={300}
            labelText={t(
              "PatientGridDescriptionInputLabel",
              "Describe the purpose of this grid in a few words"
            )}
          />
        </FormGroup>

        <Hr />
        <PatientGridBuilderContinueButton>
          {t(
            "PatientGridDescriptionContinueButton",
            "Continue by configuring grid sections"
          )}
        </PatientGridBuilderContinueButton>
      </Stack>
    </Form>
  );
}

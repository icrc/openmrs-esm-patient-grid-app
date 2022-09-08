import React from "react";
import { Form, Select, SelectItem, Stack } from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Hr } from "../components";
import styles from "./PatientGridBuilderFiltersPage.scss";
import { WizardPageProps } from "./usePatientGridWizard";
import { PatientGridBuilderHeader } from "./PatientGridBuilderHeader";

export function PatientGridBuilderFiltersPage({
  page,
  pages,
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
          title={t("patientGridFilters", "Grid filters")}
        />

        <Hr />
        <h5 className={styles.patientDetailsHeader}>
          {t("patientGridDetailsHeader", "Patient details")}
        </h5>

        <Select
          defaultValue="placeholder"
          labelText={t("patientGridDetailsCountryLabel", "Country")}
        >
          <SelectItem
            disabled
            hidden
            value="placeholder"
            text={t("patientGridDetailsCountryPlaceholder", "Country")}
          />
        </Select>

        <Select
          defaultValue="placeholder"
          labelText={t("patientGridDetailsStructureLabel", "Structure")}
        >
          <SelectItem
            disabled
            hidden
            value="placeholder"
            text={t("patientGridDetailsStructurePlaceholder", "Structure")}
          />
        </Select>

        <Select
          defaultValue="placeholder"
          labelText={t("patientGridDetailsGenderLabel", "Gender")}
        >
          <SelectItem
            disabled
            hidden
            value="placeholder"
            text={t("patientGridDetailsGenderPlaceholder", "Gender")}
          />
        </Select>

        <Select
          defaultValue="placeholder"
          labelText={t("patientGridDetailsAgeCategoryLabel", "Age category")}
        >
          <SelectItem
            disabled
            hidden
            value="placeholder"
            text={t("patientGridDetailsAgeCategoryPlaceholder", "Age category")}
          />
        </Select>
      </Stack>
    </Form>
  );
}

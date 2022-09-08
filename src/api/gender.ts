import { useMemo } from "react";
import { useTranslation } from "react-i18next";

export type GenderRepresentation = "m" | "f" | "u" | "o";

export interface GenderDetails {
  gender: GenderRepresentation;
  display: string;
}

export function useAllGenders() {
  // The gender(s) remain, for the moment, hard coded until further notice.
  const { t } = useTranslation();
  return useMemo<Array<GenderDetails>>(
    () => [
      {
        gender: "m",
        display: t("genderMale", "Male"),
      },
      {
        gender: "f",
        display: t("genderFemale", "Female"),
      },
      {
        gender: "u",
        display: t("genderUnknown", "Unknown"),
      },
      {
        gender: "o",
        display: t("genderOther", "Other"),
      },
    ],
    [t]
  );
}

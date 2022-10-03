import React from 'react';
import { useTranslation } from 'react-i18next';
import { ConfigurableLink } from '@openmrs/esm-framework';
import { routes } from './routes';

export default function AppMenuLink() {
  const { t } = useTranslation();
  return (
    <ConfigurableLink to={`\${openmrsSpaBase}${routes.patientGridsOverview.interpolate()}`}>
      {t('patientGridsAppMenuLink', 'Patient Grids')}
    </ConfigurableLink>
  );
}

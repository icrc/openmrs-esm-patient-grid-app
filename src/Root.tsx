import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PatientGridDetailsPage } from './patient-grid-details';
import { PatientGridsOverviewPage } from './patient-grids-overview';
import { routes } from './routes';
import { InlinePatientGridEditingContextProvider } from './grid-utils';

export default function Root() {
  return (
    <main>
      <BrowserRouter basename={window.spaBase}>
        <Routes>
          <Route path={routes.patientGridsOverview.path} element={<PatientGridsOverviewPage />} />
          <Route
            path={routes.patientGridDetails.path}
            element={
              <InlinePatientGridEditingContextProvider>
                <PatientGridDetailsPage />
              </InlinePatientGridEditingContextProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

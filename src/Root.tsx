import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import PatientGridDetails from "./patient-grid-details";
import PatientGridsOverview from "./patient-grids-overview";
import { routes } from "./routes";

export default function Root() {
  return (
    <main>
      <BrowserRouter basename={window.spaBase}>
        <Routes>
          <Route
            path={routes.patientGridsOverview.path}
            element={<PatientGridsOverview />}
          />
          <Route
            path={routes.patientGridDetails.path}
            element={<PatientGridDetails />}
          />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

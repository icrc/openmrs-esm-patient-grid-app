/* eslint-disable @typescript-eslint/no-empty-interface */
import { generatePath, Params } from 'react-router';

/**
 * Provides convenience methods for accessing and escaping the routes and route paths used by the module.
 */
export class RouteDescriptor<TParams extends Params | void> {
  /**  The unescaped React Router path of the route. */
  readonly path: string;

  constructor(path: string) {
    this.path = path;
  }

  /**
   * Interpolates the associated React Router path with the given params and returns the final string.
   * Interpolation leverages [`generatePath`](https://reactrouter.com/en/v6.3.0/api#generatepath).
   * @param params Parameters to be used for interpolating the associated router path.
   */
  interpolate(params: TParams) {
    return generatePath(this.path, params as Params);
  }
}

export const routes = {
  /** The route for the page displaying the patient grid overview table. */
  patientGridsOverview: new RouteDescriptor('/patient-grids'),
  /** The route for the page displaying the details (i.e. the report) of a single patient grid. */
  patientGridDetails: new RouteDescriptor<PatientGridDetailsParams>('/patient-grids/:id'),
};

export interface PatientGridDetailsParams extends Params {
  id: string;
}

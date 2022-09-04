import React, { useMemo, useState } from "react";
import {
  DataTable,
  DataTableSkeleton,
  Search,
  Layer,
  Table,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
  Link,
  OverflowMenu,
  OverflowMenuItem,
} from "@carbon/react";
import { useTranslation } from "react-i18next";
import { Link as ReactRouterLink } from "react-router-dom";
import styles from "./PatientGridsTable.scss";
import { routes } from "../routes";
import { PatientGridGet, usePatientGrids } from "../api";
import { ErrorState } from "@openmrs/esm-framework";
import {
  PatientGridType,
  usePatientGridsWithInferredTypes,
} from "./usePatientGridsWithInferredTypes";
import { DeletePatientGridModal } from "./DeletePatientGridModal";

export type PatientGridViewType = "shared" | "my" | "all";

export interface PatientGridsTableProps {
  type: PatientGridViewType;
}

export function PatientGridsTable({ type }: PatientGridsTableProps) {
  const { t } = useTranslation();
  const { data: patientGrids, error: patientGridsError } = usePatientGrids();
  const headers = useTableHeaders();
  const rows = useTableRows(type);
  const [patientGridToDelete, setPatientGridToDelete] = useState<
    PatientGridGet | undefined
  >(undefined);

  if (patientGridsError && !patientGrids) {
    // TODO: This error state looks weird in the UI. It's better than having nothing, but
    // a designer should probably weigh in on this.
    return (
      <ErrorState
        headerTitle={t(
          "patientGridsFetchingFailed",
          "Loading the patient grids failed"
        )}
        error={patientGridsError}
      />
    );
  }

  if (!patientGrids) {
    return (
      <DataTableSkeleton
        headers={headers}
        showHeader={false}
        showToolbar={false}
      />
    );
  }

  return (
    <div>
      <DataTable headers={headers} rows={rows} overflowMenuOnHover={false}>
        {({
          rows,
          headers,
          getTableProps,
          getHeaderProps,
          getRowProps,
          onInputChange,
        }) => (
          <>
            <div className={styles.tableHeaderContainer}>
              <Layer className={styles.tableSearchLayer}>
                <Search
                  size="sm"
                  placeholder={t(
                    "patientGridsFilterLabelAndPlaceholder",
                    "Search these lists"
                  )}
                  labelText={t(
                    "patientGridsFilterLabelAndPlaceholder",
                    "Search these lists"
                  )}
                  onChange={onInputChange}
                />
              </Layer>
            </div>
            <Table {...getTableProps()} size="sm">
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                  <TableHeader />
                </TableRow>
              </TableHead>
              <TableBody>
                {rows?.map((row) => (
                  <TableRow {...getRowProps({ row })}>
                    {row.cells.map((cell) => (
                      <TableCell key={cell.id}>{cell.value}</TableCell>
                    ))}
                    <TableCell className="cds--table-column-menu">
                      <OverflowMenu size="sm">
                        <OverflowMenuItem
                          isDelete
                          itemText="Delete"
                          onClick={() =>
                            setPatientGridToDelete(
                              patientGrids.find(
                                (patientGrid) => patientGrid.uuid === row.id
                              )
                            )
                          }
                        />
                      </OverflowMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}
      </DataTable>

      <DeletePatientGridModal
        patientGridToDelete={patientGridToDelete}
        setPatientGridToDelete={setPatientGridToDelete}
      />
    </div>
  );
}

function useTableHeaders() {
  const { t } = useTranslation();
  return useMemo(
    () => [
      { key: "name", header: t("listNameTableHeader", "List name") },
      {
        key: "description",
        header: t("descriptionTableHeader", "Description"),
      },
      { key: "type", header: t("listTypeTableHeader", "List type") },
    ],
    [t]
  );
}

function useTableRows(type: PatientGridViewType) {
  const { t } = useTranslation();
  const { data: patientGrids = [] } = usePatientGridsWithInferredTypes();

  return useMemo(() => {
    const gridsToDisplay =
      type === "all"
        ? patientGrids
        : patientGrids.filter((patientGrid) => patientGrid.type === type);
    const typeDisplayStrings: Record<PatientGridType, string> = {
      my: t("myList", "My list"),
      shared: t("sharedList", "Shared list"),
      system: t("systemList", "System list"),
    };

    return gridsToDisplay.map((patientGrid) => {
      return {
        __patientGrid: patientGrid,
        id: patientGrid.uuid,
        name: (
          <ReactRouterLink
            to={routes.patientGridDetails.interpolate({ id: patientGrid.uuid })}
          >
            <Link>{patientGrid.name}</Link>
          </ReactRouterLink>
        ),
        description: patientGrid.description,
        type: typeDisplayStrings[patientGrid.type],
      };
    });
  }, [patientGrids, type, t]);
}

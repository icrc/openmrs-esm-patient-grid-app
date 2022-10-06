import { GroupColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import { isAccessorKeyColumnDef, isGroupColumnDef, ColumnNameToHiddenStateMap } from '../grid-utils';

/**
 * Given a react-table column definition set, returns only those columns that should be displayed,
 * according to the given `hidden` map.
 */
export function useVisibleColumnsOnly<T = unknown>(
  columns: Array<GroupColumnDef<T>>,
  columnHiddenStates: ColumnNameToHiddenStateMap,
) {
  return useMemo(() => {
    const impl = (columnGroup: GroupColumnDef<T>) => {
      const updatedGroup = {
        ...columnGroup,
        columns: columnGroup.columns
          ?.map((childColumn) => {
            if (isAccessorKeyColumnDef(childColumn)) {
              // Hidden accessor columns will be removed.
              return columnHiddenStates[childColumn.accessorKey.toString()] ? undefined : childColumn;
            } else if (isGroupColumnDef(childColumn)) {
              return impl(childColumn);
            } else {
              return childColumn;
            }
          })
          .filter(Boolean),
      };

      // If the group has no children, it shall be removed.
      return updatedGroup.columns?.length ? updatedGroup : undefined;
    };

    return columns.map(impl).filter(Boolean);
  }, [columns, columnHiddenStates]);
}

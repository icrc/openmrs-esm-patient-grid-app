import { ColumnDef, AccessorKeyColumnDef, GroupColumnDef } from '@tanstack/react-table';

export function isAccessorKeyColumnDef<T = unknown>(columnDef: ColumnDef<T>): columnDef is AccessorKeyColumnDef<T> {
  return 'accessorKey' in columnDef && typeof columnDef.accessorKey === 'string';
}

export function isGroupColumnDef<T = unknown>(columnDef: ColumnDef<T>): columnDef is GroupColumnDef<T> {
  return 'columns' in columnDef;
}

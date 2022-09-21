/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react';
import { faker } from '@faker-js/faker';
import { ColumnDef } from '@tanstack/react-table';

function getAccessors(columns: Array<any>, result = new Set<string>()) {
  for (const column of columns) {
    if (column.accessorKey) result.add(column.accessorKey);
    getAccessors((column as any).columns ?? [], result);
  }
  return [...result];
}

const accessorFakers = {
  name: () => faker.name.fullName(),
  country: () => faker.name.jobArea(),
  structure: () => faker.word.noun(),
  gender: () => faker.helpers.arrayElement(['M', 'F', 'O', 'U']),
  age: () => faker.random.numeric(2),
  date: () => faker.date.recent().toLocaleDateString(),
  practicionerAffiliation: () => faker.company.bsNoun(),
  placeOfConsultation: () => faker.name.jobArea(),
} as const;

export function usePatientGrid(count = 100) {
  const columns = useMemo<Array<ColumnDef<any>>>(
    () => [
      {
        header: 'Healthcare user',
        columns: [
          {
            header: 'Patient name',
            accessorKey: 'name',
          },
          {
            header: 'Country',
            accessorKey: 'country',
          },
          {
            header: 'Structure',
            accessorKey: 'structure',
          },
          {
            header: 'Gender',
            accessorKey: 'gender',
          },
          {
            header: 'Age category',
            accessorKey: 'age',
          },
        ],
      },
      {
        header: 'Latest admission form',
        columns: [
          {
            header: 'Date',
            accessorKey: 'date',
          },
          {
            header: 'Consultation details',
            columns: [
              {
                header: 'Practicioner affiliation',
                accessorKey: 'practicionerAffiliation',
              },
              {
                header: 'Place of consultation',
                accessorKey: 'placeOfConsultation',
              },
            ],
          },
        ],
      },
    ],
    [],
  );

  const data = useMemo(() => {
    const accessors = getAccessors(columns);
    const rows: Array<any> = [];

    for (let i = 0; i < count; i++) {
      const row = {};

      for (const accessor of accessors) {
        row[accessor] = accessorFakers[accessor]?.() ?? faker.random.word();
      }

      rows.push(row);
    }

    return rows;
  }, [columns, count]);

  return { columns, data };
}

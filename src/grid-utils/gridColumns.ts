import { GroupColumnDef } from '@tanstack/react-table';
import { FormGet, FormSchema } from '../api';
import { getFormDateColumnName, getFormSchemaQuestionColumnName } from './columnNames';
import { ColumnNameToHeaderLabelMap } from './useColumnNameToHeaderLabelMap';

/**
 * Creates the `react-table` {@link GroupColumnDef} which renders the columns of one single form.
 * The column maps, for example, to a table similar to this:
 * ```
 * | Form Name |                                                           |
 * |           | Section 1                   | Section 2                   |
 * | Date      | Question 1-1 | Question 2.1 | Question 2.1 | Question 2.2 |
 * ```
 * @param form The form for which to generate the table columns.
 * @param formSchema The form's associated form schema.
 * @param columnNameToHeaderLabelMap The map to use for looking up the display strings of the columns to be rendered.
 *   See {@link ColumnNameToHeaderLabelMap} and {@link useColumnNameToHeaderLabelMap} for details.
 * @param columnNamesToInclude An array containing the unique column names of the columns to be **included**
 *   in the form column.
 *   These names should either come from the patient grid report or alternatively from a function like
 *   {@link getFormSchemaQuestionColumnName}.
 */
export function getReactTableColumnDefForForm(
  form: FormGet,
  formSchema: FormSchema,
  columnNameToHeaderLabelMap: ColumnNameToHeaderLabelMap,
  columnNamesToInclude: Array<string>,
): GroupColumnDef<Record<string, string>> {
  const formDateColumnName = getFormDateColumnName(form);
  const formColumn: GroupColumnDef<Record<string, string>> = {
    header: form.name,
    columns: [
      // Each form column group always has the "Date" column.
      {
        header: columnNameToHeaderLabelMap[formDateColumnName],
        accessorKey: formDateColumnName,
      },
    ],
  };

  for (const page of formSchema.pages ?? []) {
    for (const section of page.sections ?? []) {
      const sectionColumn: GroupColumnDef<Record<string, string>> = {
        header: section.label,
        columns: [],
      };

      for (const question of section.questions ?? []) {
        const questionColumnName = getFormSchemaQuestionColumnName(form, question);

        if (columnNamesToInclude.includes(questionColumnName)) {
          sectionColumn.columns.push({
            // Questions may be localized via concept labels.
            // Those are already prefetched, but if they don't exist, fallback to values inside the schema itself
            // to display *something*.
            header: columnNameToHeaderLabelMap[questionColumnName] ?? question.label ?? question.id,
            accessorKey: getFormSchemaQuestionColumnName(form, question),
          });
        }
      }

      // Only add the column for this specific section if there's at least 1 question column.
      if (sectionColumn.columns.length) {
        formColumn.columns.push(sectionColumn);
      }
    }
  }

  return formColumn;
}

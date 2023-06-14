import { GroupColumnDef } from '@tanstack/react-table';
import { FormGet, FormSchema } from '../api';
import { getFormAgeColumnName, getFormDateColumnName, getFormSchemaQuestionColumnName } from './columnNames';

/**
 * Creates the `react-table` {@link GroupColumnDef} which renders the columns of one single form.
 * The column maps, for example, to a table similar to this:
 * ```
 * | Form Name                                                                    |
 * |                  | Section 1                   | Section 2                   |
 * | Age       | Date | Question 1-1 | Question 2.1 | Question 2.1 | Question 2.2 |
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
  columnNamesToInclude: Array<string>,
): GroupColumnDef<Record<string, string>> {
  const formAgeColumnName = getFormAgeColumnName(form);
  const formDateColumnName = getFormDateColumnName(form);
  const formColumn: GroupColumnDef<Record<string, string>> = {
    header: form.display,
    columns: [],
  };

  if (columnNamesToInclude.includes(formAgeColumnName)) {
    formColumn.columns.push({
      header: formAgeColumnName,
      accessorKey: formAgeColumnName,
    });
  }

  if (columnNamesToInclude.includes(formDateColumnName)) {
    formColumn.columns.push({
      header: formDateColumnName,
      accessorKey: formDateColumnName,
    });
  }

  function processQuestion(question, formColumn) {
    if (question.questions && question.questions.length > 0) {
      for (const subQuestion of question.questions) {
        processQuestion(subQuestion, formColumn);
      }
    } else {
      const questionColumnName = getFormSchemaQuestionColumnName(form, question);

      if (columnNamesToInclude.includes(questionColumnName)) {
        formColumn.columns.push({
          header: questionColumnName ?? question.label ?? question.id,
          accessorKey: getFormSchemaQuestionColumnName(form, question),
        });
      }
    }
  }

  for (const page of formSchema.pages ?? []) {
    for (const section of page.sections ?? []) {
      const sectionColumn: GroupColumnDef<Record<string, string>> = {
        header: section.label,
        columns: [],
      };

      for (const question of section.questions ?? []) {
        processQuestion(question, sectionColumn);
      }

      // Only add the column for this specific section if there's at least 1 question column.
      if (sectionColumn.columns.length) {
        formColumn.columns.push(sectionColumn);
      }
    }
  }

  return formColumn;
}

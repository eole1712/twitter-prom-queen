/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { reduce } from 'lodash';
import { terminal as term, ColumnMenuMulti } from 'terminal-kit';

type TextOption = {
  name: string;
  description: string;
  isValid: (data: string) => boolean;
  process?: (data: string) => any;
};

type SelectOption = {
  name: string;
  description: string;
  options: string[];
};

type MultipleSelectOption = SelectOption & {
  multiple: true;
};

export type Option = TextOption | SelectOption | MultipleSelectOption;

function isSelectOption(option: Option): option is SelectOption {
  return (option as SelectOption).options !== undefined;
}

function isMultipleSelectOption(option: Option): option is MultipleSelectOption {
  return (option as MultipleSelectOption).options !== undefined && (option as MultipleSelectOption).multiple === true;
}

function isTextOption(option: Option): option is TextOption {
  return (option as TextOption).isValid !== undefined;
}

const getOption = async (option: Option, retry = 0): Promise<any | null> => {
  term('Please provide the ')
    .red(option.name)(' (')
    .magenta(option.description)(')')
    .nextLine(1);

  let answer: string | undefined;
  if (isSelectOption(option) && option.options) {
    reduce(
      option.options,
      (t, o, i) => {
        if (i === option.options.length - 1) {
          t(' or ');
        } else if (i !== 0) {
          t(', ');
        }
        return t.green(o);
      },
      term('Allowed options are : '),
    ).nextLine(1);
    if (isMultipleSelectOption(option)) {
      term.saveCursor();
      const document = (term as any).createDocument();
      const selectListMulti = new ColumnMenuMulti({
        parent: document,
        content: 'list',
        values: option.options,
        master: { content: 'Validate', symbol: '▼' },
        items: option.options.map(o => ({ content: o, key: o })),
      });
      document.giveFocusTo(selectListMulti);

      answer =
        (await new Promise(res =>
          selectListMulti.on('submit', (value: { [key: string]: boolean }) => {
            res(Object.keys(value).join(','));
          }),
        )) || '';
      term.restoreCursor();
      term.reset();
    } else {
      answer = (await term.singleColumnMenu(option.options).promise).selectedText;
    }
  } else {
    answer = (await term.inputField({}).promise) || '';
  }
  term.nextLine(2);

  if (isTextOption(option)) {
    if (!option.isValid(answer)) {
      if (retry === 2) {
        term.red('Worng answer, exciting.').nextLine(2);
        return null;
      }
      term.red("Worng answer, let's retry again.").nextLine(2);
      return getOption(option, retry + 1);
    }
    return option.process ? option.process(answer) : answer;
  }
  return isMultipleSelectOption(option) ? (answer.length ? answer.split(',') : []) : answer;
};

export const getOptions = async (options: Option[]) => {
  const res: { [key: string]: string } = {};

  for (const option of options) {
    const answer = await getOption(option);
    if (answer === null) {
      return null;
    }

    res[option.name] = answer;
  }
  return res;
};

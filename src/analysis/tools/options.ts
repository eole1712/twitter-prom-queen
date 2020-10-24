/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { reduce } from 'lodash';
import { terminal as term } from 'terminal-kit';

export type Option = {
  name: string;
  description: string;
  options?: string[];
};

const getOption = async (option: Option, retry = 0): Promise<string | false> => {
  term('Please provide the ')
    .red(option.name)(' (')
    .magenta(option.description)(' )')
    .nextLine(1);

  if (option.options) {
    reduce(
      option.options,
      (t, o, i) => {
        if (i === option.options!.length - 1) {
          t(' or ');
        } else if (i !== 0) {
          t(', ');
        }
        return t.green(o);
      },
      term('Allowed options are : '),
    ).nextLine(1);
  }
  const answer = await term.inputField({}).promise;
  term.nextLine(2);

  if (!answer || (option.options && !option.options.includes(answer))) {
    if (retry === 2) {
      term.red('Worng answer, exciting.').nextLine(2);
      return false;
    }
    term.red("Worng answer, let's retry again.").nextLine(2);
    return getOption(option, retry + 1);
  }
  return answer;
};

export const getOptions = async (options: Option[]) => {
  const res: { [key: string]: string } = {};

  for (const option of options) {
    const answer = await getOption(option);
    if (!answer) {
      return false;
    }

    res[option.name] = answer;
  }
  return res;
};

import { terminal as term } from 'terminal-kit';
import { getOptions, Option } from '../tools/options';
import { client } from '../tools/client';
import fs from 'fs';
import path from 'path';
import moment from 'moment';
import { sleep } from '../tools/sleep';

const OPTIONS: Option[] = [
  {
    name: 'names',
    description: 'the usernames of the users',
    process: data => data.split(','),
  },
  {
    name: 'targets',
    description: 'the target type',
    options: ['followers', 'friends', 'both'],
    process: data => (data === 'both' ? ['friends', 'followers'] : [data]),
  },
  {
    name: 'mode',
    description: 'the mode of extraction',
    options: ['new', 'continue'],
  },
];
type OptionsType = { targets: ('followers' | 'friends')[]; names: string[]; mode: 'new' | 'continue' };

const extractUsers = async (
  name: string,
  target: 'followers' | 'friends',
  lastUsers: unknown[] = [],
  lastCursor: number | undefined = undefined,
): Promise<unknown[]> => {
  let cursor: number | undefined = lastCursor;
  let users: unknown[] = lastUsers;

  try {
    while (true) {
      const result: { users: unknown[]; next_cursor: number; _headers: any } = await client.get(target + '/list', {
        screen_name: name,
        count: 200,
        ...(cursor ? { cursor } : {}),
      });

      users = [...users, ...result.users];

      const timeToReset = moment(result._headers.get('x-rate-limit-reset') * 1000);
      const remaining = parseInt(result._headers.get('x-rate-limit-remaining'), 10);

      if (remaining === 0) {
        let secs = timeToReset.diff(moment(), 'seconds');
        while (secs !== 0) {
          term
            .restoreCursor()('Fetched ')
            .red(users.length)(' ')(target)('. Waiting until ')
            .red(timeToReset.format('HH:mm:ss'))(' (')
            .red(secs)(' seconds) before continuing.')
            .nextLine(2);
          secs = secs - 1;
          await sleep(1000);
        }
      }

      term
        .restoreCursor()('Fetched ')
        .red(users.length || '0')(' ')(target)('.')
        .nextLine(2);

      if (result.next_cursor === 0) {
        break;
      }
      cursor = result.next_cursor;
    }
  } catch (err) {
    console.error(err);
    await sleep(1000);
    process.exit(1);
  }

  return users;
};

export const extract = async () => {
  term
    .clear()
    .moveTo(1, 1, 'Welcome to ')
    .red('extraction')(' panel.')
    .nextLine(2);

  const options = (await getOptions(OPTIONS)) as OptionsType | null;

  if (options) {
    for (const name of options.names) {
      for (const target of options.targets) {
        let users: unknown[] = [];

        if (
          options.mode === 'continue' &&
          fs.existsSync(path.join(__dirname, `../../../data/${name}/${target}.json`))
        ) {
          users = JSON.parse(fs.readFileSync(path.join(__dirname, `../../../data/${name}/${target}.json`)).toString());
        }
        term('Starting ')
          .green(name)("'s ")
          .green(target)
          .nextLine(2);

        term.saveCursor();

        users = await extractUsers(name, target, users);

        if (!fs.existsSync(path.join(__dirname, `../../../data/${name}`))) {
          fs.mkdirSync(path.join(__dirname, `../../../data/${name}`));
        }
        fs.writeFileSync(path.join(__dirname, `../../../data/${name}/${target}.json`), JSON.stringify(users, null, 2));
      }
    }
  }
};

extract().then(() => {
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

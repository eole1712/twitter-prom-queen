import { terminal as term } from 'terminal-kit';
import { getOptions, Option } from '../tools/options';
import { client } from '../tools/client';
import moment from 'moment';
import { sleep } from '../tools/sleep';
import { User } from '../types/user.type';
import { getUsers, writeUsers } from '../tools/users';

term.on('key', (key: string) => {
  switch (key) {
    case 'CTRL_C':
      term.grabInput(false);
      term.hideCursor(false);
      term.styleReset();
      term.clear();
      process.exit();
      break;
  }
});

const OPTIONS: Option[] = [
  {
    name: 'names',
    description: 'the usernames of the users',
    isValid: data => data.length > 0,
    process: data => data.split(','),
  },
  {
    name: 'targets',
    description: 'the target type',
    options: ['followers', 'friends'],
    multiple: true,
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
  lastUsers: User[] = [],
  lastCursor: number | undefined = undefined,
): Promise<User[]> => {
  let cursor: number | undefined = lastCursor;
  let users: User[] = lastUsers;

  try {
    while (true) {
      const result: { users: User[]; next_cursor: number; _headers: any } = await client.get(target + '/list', {
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
        let users: User[] = [];

        if (options.mode === 'continue') {
          users = getUsers(name, target);
        }
        term('Starting ')
          .green(name)("'s ")
          .green(target)
          .nextLine(2);

        term.saveCursor();

        users = await extractUsers(name, target, users);

        writeUsers(name, target, users);
      }
    }
  }
};

extract().then(() => {
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

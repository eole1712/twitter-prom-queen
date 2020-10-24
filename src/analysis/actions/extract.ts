import { terminal as term } from 'terminal-kit';
import { getOptions, Option } from '../tools/options';
import { client } from '../tools/client';
import fs from 'fs';
import path from 'path';
import { sleep } from '../tools/sleep';
import { get } from 'lodash';

const OPTIONS: Option[] = [
  {
    name: 'name',
    description: 'the username of the user',
  },
  {
    name: 'target',
    description: 'the target type',
    options: ['followers', 'friends', 'both'],
  },
  {
    name: 'mode',
    description: 'the mode of extraction',
    options: ['new', 'continue'],
  },
];

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
      const result: { users: unknown[]; next_cursor: number } = await client.get(target + '/list', {
        screen_name: name,
        count: 200,
        ...(cursor ? { cursor } : {}),
      });

      users = [...users, ...result.users];

      term
        .restoreCursor()('Fetched ')
        .red('' + users.length)(' ')(target)('.')
        .nextLine(2);

      if (result.next_cursor === 0) {
        break;
      }
      cursor = result.next_cursor;
    }
  } catch (err) {
    if (get(err, 'errors.0.code') === 88) {
      let secs = 65;
      while (secs !== 0) {
        term
          .restoreCursor()('Fetched ')
          .red(users.length)(' ')(target)('. Waiting ')
          .red(secs)(' seconds before continuing.')
          .nextLine(2);
        secs = secs - 1;
        await sleep(1000);
      }
      return extractUsers(name, target, users, cursor);
    }
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

  const options = await getOptions(OPTIONS);

  if (options) {
    const targets = options.target === 'both' ? ['followers', 'friends'] : [options.target];

    for (const target of targets) {
      let users: unknown[] = [];

      if (
        options.mode === 'continue' &&
        fs.existsSync(path.join(__dirname, `../../../data/${options.name}/${target}.json`))
      ) {
        users = JSON.parse(
          fs.readFileSync(path.join(__dirname, `../../../data/${options.name}/${target}.json`)).toString(),
        );
      }
      term('Starting ')
        .green(options.name)("'s ")
        .green(target)
        .nextLine(2);

      term.saveCursor();

      users = await extractUsers(options.name, target as 'followers' | 'friends', users);

      if (!fs.existsSync(path.join(__dirname, `../../../data/${options.name}`))) {
        fs.mkdirSync(path.join(__dirname, `../../../data/${options.name}`));
      }
      fs.writeFileSync(
        path.join(__dirname, `../../../data/${options.name}/${target}.json`),
        JSON.stringify(users, null, 2),
      );
    }
  }
};

extract().then(() => {
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

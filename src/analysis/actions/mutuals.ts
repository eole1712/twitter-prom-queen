import { terminal as term } from 'terminal-kit';
import { getOptions, Option } from '../tools/options';
import { getUsers, listUsers, writeUsers } from '../tools/users';

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
    description: 'the usernames of the users, let empty to select everyone',
    options: listUsers(),
    multiple: true,
  },
];
type OptionsType = { names: string[] };

export const extract = async () => {
  term
    .clear()
    .moveTo(1, 1, 'Welcome to ')
    .red('mutuals')(' computing.')
    .nextLine(2);

  const options = (await getOptions(OPTIONS)) as OptionsType | null;

  if (options) {
    for (const name of options.names) {
      const friends = getUsers(name, 'friends');
      const followers = getUsers(name, 'followers');

      term('The user ')
        .green(name)(' have ')
        .green('' + friends.length)(' friends and ')
        .green('' + followers.length)(' followers.')
        .nextLine(2);

      const mutuals = friends.filter(friend => followers.find(f => f.screen_name === friend.screen_name));

      term('Found ')
        .green('' + mutuals.length)(' mutuals.')
        .nextLine(2);

      writeUsers(name, 'mutuals', mutuals);
    }
  }
};

extract().then(() => {
  setTimeout(() => {
    process.exit(0);
  }, 1000);
});

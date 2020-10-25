import fs from 'fs';
import path from 'path';
import { User } from '../types/user.type';

const DATA_PATH = path.join(__dirname, '../../../data');

export const fileExists = (name: string, target: string) => fs.existsSync(path.join(DATA_PATH, name, target + '.json'));

export const listUsers = () => fs.readdirSync(path.join(DATA_PATH));

export const getUsers = (name: string, target: string) =>
  (fileExists(name, target)
    ? JSON.parse(fs.readFileSync(path.join(DATA_PATH, name, target + '.json')).toString())
    : []) as User[];

export const writeUsers = (name: string, target: string, users: User[]) => {
  if (!fs.existsSync(path.join(DATA_PATH, name))) {
    fs.mkdirSync(path.join(DATA_PATH, name));
  }
  fs.writeFileSync(path.join(DATA_PATH, name, target + '.json'), JSON.stringify(users, null, 2));
};

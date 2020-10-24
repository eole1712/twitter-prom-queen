import Twitter from 'twitter-lite';
import fs from 'fs';
import path from 'path';

if (!fs.existsSync(path.join(__dirname, `../../../data`))) {
  fs.mkdirSync(path.join(__dirname, `../../../data`));
}

export const client = new Twitter(require('../../../.env.json'));

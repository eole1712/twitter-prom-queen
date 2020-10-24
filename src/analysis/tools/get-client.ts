import Twitter from 'twitter-lite';

export const client = new Twitter(require('../../../.env.json'));

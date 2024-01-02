import { config as insertEnv } from 'dotenv';
import Citizen from './client/Citizen';
import config from './config/config';
insertEnv();

const client: Citizen = new Citizen({
  intents: config.intents
});

client
  .authenticate(process.env.CLIENT_TOKEN as string);

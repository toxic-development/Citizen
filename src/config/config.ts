import type { IConfig } from '../types/utils.interface';

const config: IConfig = {
  intents: ['Guilds'],
  environment: process.env.APP_ENV || 'development',
  restVersion: '10',
  mainColor: 0x41b59a,
  errorColor: 0xff0000,
  successColor: 0x00ff00,
  warningColor: 0xffff00,
  GuildID: '871440804638519337',
  OwnerID: '510065483693817867',
  ClientID: '1184289060538286080',
  FooterText: '© 2023 - Toxic Development',
  ClientLogo: 'https://toxicdevs.site/citizen_logo.webp',
  EmbedColor: '#FF9343',
  developers: ['510065483693817867'],
  invite: 'https://discord.com/api/oauth2/authorize?client_id=1184289060538286080&permissions=67059739656001&scope=bot%20applications.commands'
};

export default config;

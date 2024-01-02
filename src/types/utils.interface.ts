import type {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  ContextMenuCommandBuilder,
  ContextMenuCommandInteraction,
  GuildMember,
  PermissionResolvable,
  PermissionsString,
  BitFieldResolvable,
  GatewayIntentsString,
  Interaction,
  SlashCommandBuilder
} from 'discord.js';
import type Citizen from '../client/Citizen';

export interface IConfig {
  intents: BitFieldResolvable<GatewayIntentsString, number>;
  environment: string;
  restVersion: '10' | '9';
  mainColor: number;
  errorColor: number;
  successColor: number;
  warningColor: number;
  GuildID: string;
  OwnerID: string;
  ClientID: string;
  FooterText: string;
  ClientLogo: string;
  EmbedColor: string;
  developers: string[];
  invite: 'https://discord.com/api/oauth2/authorize?client_id=1184289060538286080&permissions=67059739656001&scope=bot%20applications.commands'
}

export interface IEvent {
  props: IEventBaseProps;
  execute: (...args: unknown[]) => void;
}

export interface ICommand {
  data: SlashCommandBuilder;
  execute: (client: Citizen, interaction: Interaction) => void;
  props: ICommandBaseProps;
}

export interface ICommandBaseProps {
  name: string;
  description: string;
  category: string;
  cooldown: number;
  ownerOnly?: boolean;
  userPermissions: PermissionResolvable[];
  clientPermissions: PermissionResolvable[];
}

export interface IEventBaseProps {
  name: string;
  once?: boolean;
}

export interface ISlashCommand {
  props: ISlashCommandProps;
  execute: (client: Citizen, interaction: Interaction, args: any) => void;
}

export interface ISlashCommandProps {
  name: string;
  description: string;
  usage?: string;
  example?: string;
  category: string;
  cooldown: number;
  ownerOnly?: boolean;
  userPermissions: PermissionResolvable[];
  clientPermissions: PermissionResolvable[];
  options?: SlashCommandOptions[];
}

export interface SlashCommandOptions {
  name?: string;
  description?: string;
  usage?: string;
  example?: string;
  options?: any[];
  choices?: any[];
  required?: boolean;
  type?: number;
}

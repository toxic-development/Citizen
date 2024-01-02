import type { SlashCommandBuilder } from '@discordjs/builders';
import { ISlashCommandProps } from 'src/types/utils.interface';

export class CommandBase {
  public data: SlashCommandBuilder;

  constructor(data: any) {
    this.data = data;
  }
}

export class SlashBase {
  public props: ISlashCommandProps;

  constructor(props: ISlashCommandProps) {
    this.props = props;
  }
}

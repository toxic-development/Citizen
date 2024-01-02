import type { IEventBaseProps } from '..//types/utils.interface';

class EventBase {
  public props: IEventBaseProps;

  constructor(props: IEventBaseProps) {
    this.props = props;
  }
}

export default EventBase;

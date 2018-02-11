import * as React from 'react';

interface Props {
  onSubmit: () => void;
}

export default class Button extends React.Component<Props, {}> {
  render() {
    return <button onClick={this.props.onSubmit}>Submit</button>;
  }
}

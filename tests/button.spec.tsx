import * as React from 'react';
import { Simulate } from 'react-dom/test-utils';
import { spy } from 'sinon';
import Button from 'src/button';
import { $render } from './render-helper';
import expect from './expect';

describe('Button', () => {
  it('should call when clicking on it', () => {
    const onSubmit = spy();

    const $button = $render(<Button onSubmit={onSubmit} />);

    Simulate.click($button[0]);

    expect(onSubmit).to.have.been.calledOnce;
  });
});

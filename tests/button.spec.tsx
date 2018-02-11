import { $render } from './render-helper';
import * as React from 'react';
import expect from './expect';
import { Simulate } from 'react-dom/test-utils';
import Button from "src/button";
import { spy } from 'sinon';

describe('Button', () => {
    it('should call when clicking on it', () => {
        const onSubmit = spy();

        const $button = $render(<Button onSubmit={onSubmit}/>);

        Simulate.click($button[0]);

        expect(onSubmit).to.have.been.calledOnce;
    });
});

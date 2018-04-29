import { IMock, It, Mock } from 'typemoq';
import { expect } from 'chai';
import * as React from 'react';
import { assert } from 'sinon';
// eslint-disable-next-line import/no-unresolved
import { IReturnsResult } from 'typemoq/Api/IReturns';
import { $render } from './render-helper';

// Replace this with ReactNode after https://github.com/DefinitelyTyped/DefinitelyTyped/issues/20544 is done.
type JSX = React.ReactElement<any> | null;


describe('Learning typed mocks', function () {
  it('should support mocking typed functions', () => {
    interface SomeArguments {
      foo: number;
      bar: string;
    }

    type DoTheThing = (opts: SomeArguments) => string;

    const mock: IMock<DoTheThing> = Mock.ofType<DoTheThing>();

    mock.setup((fakeDoTheThing: DoTheThing) => fakeDoTheThing(It.isValue({
      foo: 2,
      bar: 'bar'
    }))).returns(({ foo, bar }) => foo + bar).verifiable();

    const fakeDoTheThing: DoTheThing = mock.object;

    fakeDoTheThing({ foo: 2, bar: 'bar' });

    mock.verifyAll();
  });

  it('should support mocking interfaces', () => {
    interface IFoo {
      doFoo: () => void;
      doBar: (a: number, b: string) => boolean;
    }

    const mock: IMock<IFoo> = Mock.ofType<IFoo>();

    mock.setup((fakeFoo: IFoo) => fakeFoo.doFoo()).verifiable();
    mock.setup((fakeFoo: IFoo) => fakeFoo.doBar(2, 'bar')).returns(() => false).verifiable();

    const fakeFoo: IFoo = mock.object;

    fakeFoo.doFoo();
    fakeFoo.doBar(2, 'bar');

    mock.verifyAll();
  });

  it('should support mocking promises', function () {
    interface IFoo {
      doFoo: () => Promise<string>;
    }

    const mock: IMock<IFoo> = Mock.ofType<IFoo>();

    mock.setup((fakeFoo: IFoo) => fakeFoo.doFoo())
      .returns(() => Promise.resolve('foo'))
      .verifiable();

    const fakeFoo: IFoo = mock.object;

    const promise = fakeFoo.doFoo();

    return promise.then(x => {
      expect(x).to.equal('foo');

      mock.verifyAll();
    });
  });

  it('should support mocking React render props', function () {
    interface BarProps {
      foo: number;
      bar: string;
      onClick: () => void;
    }

    interface FooProps {
      Bar: React.ComponentType<BarProps>;
    }

    class Foo extends React.Component<FooProps> {
      render() {
        const { Bar: InjectedBar } = this.props;

        return <div>
          This is Bar: <InjectedBar foo={2} bar="aaa" onClick={() => {}} />
        </div>;
      }
    }

    const FakeBar = createReactStub<BarProps>();

    FakeBar.withProps({ foo: 2 })
      .renders(<span>::fake bar::</span>)
      .verifiable();

    const $component = $render(<Foo Bar={FakeBar} />);

    FakeBar.verifyAll();
    expect($component.text()).to.contain('::fake bar::');
  });
});

interface ReactMockExpectation<Props> {
  renders: (jsx: JSX) => IReturnsResult<Props>;
}

interface ReactMock<Props> {
  withProps: (expected: Partial<Props>) => ReactMockExpectation<Props>;
  verifyAll: () => void;
}

// eslint-disable-next-line no-unused-vars,space-infix-ops
type XXX<Props> = React.StatelessComponent<Props> & ReactMock<Props>;

// eslint-disable-next-line max-len
function createReactStub<Props>(): XXX<Props> {
  const mock: IMock<React.StatelessComponent<Props>> =
    Mock.ofType<React.StatelessComponent<Props>>();

  const render = mock.object;

  function Stub(props: Props) {
    return render(props);
  }

  const withProps = (expected: Partial<Props>) => {
    const expectation = mock.setup(
      fakeRender => fakeRender(partialPropMatcher<Props>(expected))
    );

    return Object.assign(expectation, {
      renders: (jsx: JSX) => expectation.returns(() => jsx)
    });
  };

  const verifyAll = () => {
    mock.verifyAll();
  };

  return Object.assign(Stub, { withProps, verifyAll });
}


function partialPropMatcher<Props>(expected: Partial<Props>): Props {
  return It.is<Props>((props: Props) => {
    try {
      // This can of course be replaced by _.isMatch.
      assert.match(props, expected);
      return true;
    } catch (e) {
      return false;
    }
  });
}

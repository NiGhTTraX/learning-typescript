import { IMock, It, Mock } from 'typemoq';
import { expect } from 'chai';
import * as React from 'react';
import { assert } from 'sinon';
import { $render } from './render-helper';

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

    const [FakeBar, mock] = createStub<BarProps>();

    mock.setup(render => render(withProps<BarProps>({ foo: 2, bar: 'aaa' })))
      .returns(() => <span>::fake bar::</span>)
      .verifiable();

    const $component = $render(<Foo Bar={FakeBar} />);

    mock.verifyAll();
    expect($component.text()).to.contain('::fake bar::');
  });
});

function createStub<Props>(): [React.ComponentType<Props>, IMock<React.StatelessComponent<Props>>] {
  const mock: IMock<React.StatelessComponent<Props>> =
    Mock.ofType<React.StatelessComponent<Props>>();

  const render = mock.object;

  function Stub(props: Props) {
    return render(props);
  }

  return [Stub, mock];
}


/**
 * Create a partial prop matcher.
 */
function withProps<Props>(expected: Partial<Props>): Props {
  return It.is<Props>((props: Props) => {
    try {
      assert.match(props, expected);
      return true;
    } catch (e) {
      return false;
    }
  });
}

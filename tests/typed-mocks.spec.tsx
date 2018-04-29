import { IMock, It, Mock } from 'typemoq';

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
});

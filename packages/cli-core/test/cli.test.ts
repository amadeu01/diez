class MockSentry {
  static mockClose = jest.fn();
  static mockSetUser = jest.fn();
  static mockGetClient = jest.fn().mockImplementation((() => ({close: MockSentry.mockClose})));
  static captureException = jest.fn();
  static init = jest.fn();
  static configureScope = jest.fn().mockImplementation((callback) => callback({setUser: MockSentry.mockSetUser}));
  static getCurrentHub = jest.fn().mockImplementation(() => ({getClient: MockSentry.mockGetClient}));
}
jest.doMock('@sentry/node', () => MockSentry);

import {assignMock} from '@diez/test-utils';
import commander, {Command} from 'commander';
import {join} from 'path';
import {bootstrap, run} from '../src/cli';
import {mockAction, mockBooleanValidator, mockPreinstall, mockStringValidator} from './fixtures/mocks';

beforeEach(() => {
  assignMock(process, 'exit');
});

jest.mock('@diez/storage', () => ({
  ...jest.requireActual('@diez/storage'),
  Registry: {
    get: jest.fn(),
    set: jest.fn(),
  },
  emitDiagnostics: jest.fn().mockRejectedValue('noop'),
}));

describe('cli', () => {
  test('command registration', async () => {
    await bootstrap(join(__dirname, 'fixtures', 'starting-point'), __dirname);
    const foobarCommand = commander.commands.find((command: Command) => command.name() === 'foobar');
    expect(foobarCommand).toBeDefined();
    expect(foobarCommand.description()).toBe('Do stuff.');
    expect(foobarCommand.parent.name()).toBe('diez');
    expect(foobarCommand.parent.parent).toBeUndefined();
  });

  test('command e2e', async () => {
    // "booleanParam": true is provided in `.diezrc` of ./fixtures/starting-point
    // "stringParam": "baz" is provided in `.diezrc`, but overridden at calltime
    process.argv = ['node', 'diez', 'foobar', '--stringParam', 'foo'];
    mockAction.mockRejectedValueOnce('<fake error>');
    await run();
    process.nextTick(() => {
      expect(mockAction).toHaveBeenCalled();
      expect(mockAction).toHaveBeenCalledWith(
        expect.objectContaining({
          stringParam: 'foo',
          booleanParam: true,
        }),
        expect.anything(),
        expect.anything(),
      );
      expect(mockStringValidator).toHaveBeenCalledWith(expect.objectContaining({stringParam: 'foo'}));
      expect(mockBooleanValidator).toHaveBeenCalledWith(expect.objectContaining({booleanParam: true}));
      expect(mockPreinstall).toHaveBeenCalled();
    });
  });

  test('sentry e2e', async () => {
    // #deleteme
    await bootstrap(join(__dirname, 'fixtures', 'starting-point'), __dirname);
    delete process.env.DIEZ_DO_NOT_TRACK;
    process.argv = ['node', 'diez', 'foobar', '--stringParam', 'foo'];

    // Simulate the actual behaviors of Sentry.
    mockAction.mockRejectedValueOnce({
      exception: {
        values: [{
          stacktrace: {
            frames: [
              {filename: 'path/to/@diez/packagename/lib/filename.js'},
            ],
          },
        }],
      },
    });

    const eventTrap = jest.fn();
    // beforeSend() should be called when we captureException().
    MockSentry.init.mockImplementation(({beforeSend}: any) => {
      MockSentry.captureException.mockImplementation((event) => {
        eventTrap(beforeSend(event));
      });
    });

    await run();

    process.nextTick(() => {
      expect(eventTrap).toHaveBeenCalledWith({
        exception: {
          values: [{
            stacktrace: {
              frames: [
                {filename: 'app:///packages/packagename/lib/filename.js'},
              ],
            },
          }],
        },
      });
      expect(MockSentry.mockClose).toHaveBeenCalledWith(1000);
    });
  });
});

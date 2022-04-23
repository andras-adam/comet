/* eslint-disable max-len */

import { Event, CompletedEvent, BaseEvent } from '../src/types/types';

type ValidatedEvent = Event & { data: { isValid: true } };
function validate(event: Event) {
  if (event.body.password !== 'admin') {
    event.data.isValid = true;
    return event.next<ValidatedEvent>();
  } else {
    return event.reply.badRequest();
  }
}

type AuthenticatedEvent = ValidatedEvent & { data: { isAuthenticated: true } };
function authenticate(event: ValidatedEvent) {
  if (event.headers.authorization) {
    event.data.isAuthenticated = true;
    return event.next<AuthenticatedEvent>();
  } else {
    return event.reply.unauthorized();
  }
}

// Middlewares (UnaryFn)

declare function one(arg: Event): ValidatedEvent | CompletedEvent;
declare function two(arg: ValidatedEvent): AuthenticatedEvent | CompletedEvent;
declare function three(arg: AuthenticatedEvent): AuthenticatedEvent | CompletedEvent;
declare function four(arg: ValidatedEvent): ValidatedEvent | CompletedEvent;
declare function five(arg: CompletedEvent): CompletedEvent;
declare function six(arg: ValidatedEvent): CompletedEvent;

// Pre/before middleware

type PreMiddleware = (arg: never) => BaseEvent;

type PreMiddlewareChainBuilder<PrevType, Middlewares extends PreMiddleware[]> = Middlewares extends [infer Middleware, ...infer Rest]
  ? Middleware extends PreMiddleware
    ? Rest extends PreMiddleware[]
      ? [
        (argument: Exclude<PrevType, CompletedEvent>) => ReturnType<Middleware>,
        ...PreMiddlewareChainBuilder<ReturnType<Middleware>, Rest>,
      ]
      : never
    : never
  : Middlewares;

type PreMiddlewareChain<Middlewares extends PreMiddleware[]> = [...PreMiddlewareChainBuilder<Event, Middlewares>];

type PreMiddlewareChainResult<Middlewares extends PreMiddleware[]> = Middlewares extends [...unknown[], infer Middleware]
  ? Middleware extends PreMiddleware
    ? Exclude<ReturnType<Middleware>, CompletedEvent>
    : never
  : Event;

// Post/after middleware
type PostMiddleware = (arg: CompletedEvent) => CompletedEvent;
type PostMiddlewareChain = [...PostMiddleware[]];

// useComet

declare function useComet<Middlewares extends PreMiddleware[]>(
  endpoint: {
    method: string,
    path: string,
    before?: PreMiddlewareChain<Middlewares>,
    after?: PostMiddlewareChain,
  },
  handler: (arg: PreMiddlewareChainResult<Middlewares>) => CompletedEvent,
): void;

useComet({
  method: 'get',
  path: '/api/users/:userId',
  before: [one, two, three, one, three, four],
  after: [five, six],
}, event => {
  console.log(event);
});

import { Method, MiddlewareEvent } from '../src/types/types';
import { useComet } from '../src/new';

function validate(event: MiddlewareEvent) {
  if (event.body.password !== 'admin') {
    event.data.isValid = true;
    return event.next();
  } else {
    return event.reply.badRequest();
  }
}

async function authenticate(event: MiddlewareEvent) {
  if (event.headers.authorization) {
    event.data.isAuthenticated = true;
    return event.next();
  } else {
    return event.reply.unauthorized();
  }
}

function something(event: MiddlewareEvent) {
  if (event.body.something) {
    return event.next();
  } else {
    return event.reply.badRequest();
  }
}

useComet({
  method: Method.GET,
  path: '/api/users/:userId',
  before: [validate, something, authenticate, something],
}, event => {
  return event.reply.ok();
});

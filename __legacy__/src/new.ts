import {
  Method,
  PostMiddleware,
  PreMiddleware,
  ValidMethod,
  Handler,
  MiddlewareEvent, BaseEvent,
} from './types/types';

interface Route {
  before: PreMiddleware[];
  after: PostMiddleware[];
  handler: Handler;
}

const routes: Record<string, Record<string, Route>> = {};

interface UseCometOptions {
  method: ValidMethod;
  path: string;
  before?: PreMiddleware[];
  after?: PostMiddleware[];
}

export function useComet(options: UseCometOptions, handler: Handler) {
  const { method, path, before, after } = options;
  // Get safe path and method
  const safeMethod = Method[method.toUpperCase() as keyof typeof Method];
  const safePath = path.trim().replace(/^([^/])/, '/$1').replace(/\/$/, '');
  // Skip route and show warning if route will be unreachable
  for (const route in routes) {
    if (doPathnamesMatch(route, safePath) && (!!routes[route][safeMethod] || !!routes[route][Method.ALL])) {
      const collidingMethod = routes[safeMethod] ? safeMethod : Method.ALL;
      console.warn(`[Comet] Skipping route '${safeMethod} ${safePath}' as it will be unreachable due to the already registered route '${collidingMethod} ${route}'.`);
      return;
    }
  }
  // Add the route to the routes if it doesn't yet exist
  if (!routes[safePath]) routes[safePath] = {};
  // Register route
  routes[safePath][safeMethod] = { before: before || [], after: after || [], handler };
}

function doPathnamesMatch(one: string, two: string) {
  const oneWithoutNamedParameters = one.replace(/(?<=\/:)\w+(?=\/|$)/g, '');
  const twoWithoutNamedParameters = two.replace(/(?<=\/:)\w+(?=\/|$)/g, '');
  return oneWithoutNamedParameters === twoWithoutNamedParameters;
}

function overlap(one: string, two: string) {
  const oneAsArray = one.split('/').map(segment => segment.startsWith(':') ? ':' : segment);
  const twoAsArray = two.split('/').map(segment => segment.startsWith(':') ? ':' : segment);
  if (oneAsArray.length !== twoAsArray.length) return false;
  return oneAsArray.reduce((acc, _, i) => {
    return (oneAsArray[i] === twoAsArray[i] || oneAsArray[i] === ':') && acc;
  }, true);
}

// async function handle(event: BaseEvent) {
//
// }
//
// export async function comet() {
//   console.log(routes);
//   for (const preMiddleware of routes.myroute.GET.before) {
//     await preMiddleware(event);
//     if (event) {
//       //
//     }
//   }
//   routes.myroute.GET.handler(event);
// }

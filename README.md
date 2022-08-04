# Comet

☄️ A convenient declarative routing library for [Cloudflare Workers][cloudflare-workers-url].

[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]

```ts
import { comet, useRoute } from '@neoaren/comet'

useRoute(event => {
  return event.reply.ok({ message: 'Hello world!' })
})

export default { fetch: comet() }
```

## Table of contents
- [Getting started](#getting-started)
- [Using routes](#using-routes)
    - [Event handling](#event-handling)
    - [Advanced routing](#advanced-routing)
    - [Compatibility dates for versioning routes](#compatibility-dates-for-versioning-routes)
- [Using middleware](#using-middleware)
- [Cross-Origin Resource Sharing (CORS)](#cross-origin-resource-sharing-cors)
- [Multi-server setup](#multi-server-setup)
- [Contribution guide](#contribution-guide)

## Getting started
If you want to start from scratch, create a new Cloudflare Workers project via [Wrangler][wrangler-url]
```bash
$ wrangler init
```
Then install this library from the npm package registry
```bash
$ npm install @neoaren/comet
```
Finally, export a fetch handler in your entry file, such as `index.ts`
```ts
export default { fetch: comet() }
```
And that's it, you can start developing your serverless application!

## Using routes
Routes can easily be set up via the `useRoute` hook, which takes an optional object of options and a handler function to process the event and provide a reply
```ts
useRoute({
  method: Method.GET, // Defaults to the catch-all Method.ALL
  pathname: '/api'    // Defaults to the catch-all '*' wildcard
}, event => {
  return event.reply.ok({ message: 'Hello world!' })
})
```

### Event handling
Events contain data about the request such as method, pathname, headers, body, etc. The handler must return a reply via one of the built-in methods (e.g. `event.reply.ok()`, `event.reply.badRequest()`) or a `Promise` that resolves to such a reply.
```ts
useRoute(async event => {
  try {
    await ...
    return event.reply.ok()
  } catch (error) {
    return event.reply.internalServerError(error)
  }
})
```

### Advanced routing
Routing in this library is powered by the [URL Pattern API][url-pattern-api-url], which allows for a variety of routing patterns from simple path parameters to complex capture groups and wildcards.
```ts
useRoute({
  method: Method.GET,
  pathname: '/api/users/:userId' // Path parameter of one segment
}, event => {
  console.info(event.params.userId) // e.g.: '123'
  return event.reply.ok()
})
```

### Compatibility dates for versioning routes
The `useRoute` hooks can take a `compatibilityDate` parameter with a value in the format `YYYY-MM-DD`, allowing clients to pick the version of the route they wish to call by including the `x-compatibility-date` header in their request. The latest version that is still older than the compatibility date specified in the header will run. Routes without a specified compatibility date will be considered the "default" and will be used if no `x-compatibility-date` header is present on a request or if there is no other match. Requests with a future compatibility date will be rejected with a `400` response.
```ts
useRoute({
  method: Method.GET,
  pathname: '/api/signin',
  compatibilityDate: '2022-04-20'
}, event => { ... })
```

## Using middleware
Middleware make it easy to reuse code and reduce code repetition. They can be defined globally or on a per-route basis, and can run either before or after a route handler. The middleware and the route handler together form the middleware chain where the next handler is always called via the `event.next()` method. Global middleware will always run first and last, sandwiching the route handler and its own middleware. The 'before' middleware and the route handler will run one after the other until either of them sends a reply, causing the rest to be skipped. All of the 'after' middleware will always run and have access to the reply sent previously in the middleware chain, however they will not be able to modify it anymore.
 ```ts
// Global 'before' middleware
useBefore(event => {
  console.info(`Receiving request ${event.method} ${event.pathname}`)
  return event.next()
})

// Route-specific 'before' and 'after' middleware
useRoute({
  method: Method.GET,
  pathname: '/api',
  before: [ event => {
    console.info('Route handler GET /api running')
    return event.next()
  } ],
  after: [ event => {
    console.info('Route handler GET /api finished')
    return event.next()
  } ]
}, event => { ... })

// Global 'after' middleware
useAfter(event => {
  console.info(`A response with status code ${event.reply.status} has been sent.`)
  return event.next()
})
```

## Cross-Origin Resource Sharing (CORS)
Comet ships with built-in support for [Cross-Origin Resource Sharing (CORS)][cors-url]. CORS headers can be configured globally for the entire server or for a single pathname with the `useCors` hook. The settings from the hook will always override the global settings. The default configuration follows a zero-tolerance policy and permits no origins, methods, headers, exposed headers and credentials, and allows a 24 hour maximum age for cached preflight responses. The options can be specified with an array of strings, comma separated values, single values or the `*` wildcard.
```ts
useCors({
  pathname: '/api/users/auth',
  origins: 'https://example-a.com',
  maxAge: 2400
})

export default {
  fetch: comet({
    cors: {
      origins: [ 'https://example-a.com', 'https://example-b.com' ],
      methods: [ 'GET', 'POST', 'DELETE' ],
      headers: '*',
      exposedHeaders: '*',
      credentials: false,
      maxAge: 7200
    }
  })
}
```

## Multi-server setup
Some setups might require multiple separate Comet servers to be running. This can be achieved by passing a `name` property to the `comet()` function, and all hooks accept a `server` property. All routes, middleware, etc. will only be registered to the specified server, or the default one named "main" if no server is provided.
```ts
useRoute({
  server: 'my-server'
}, event => { ... })

export default {
  fetch: comet({ name: 'my-server' })
}
```

## Contribution guide
Use commit names with the following prefixes to indicate their purpose

| Emoji                    | Prefix                     | Description                                                |
|--------------------------|----------------------------|------------------------------------------------------------|
| :zap: :zap:              | `:zap: :zap:`              | for implementing breaking functionality (semver major)     |
| :zap:                    | `:zap:`                    | for implementing non-breaking functionality (semver minor) |
| :hammer:                 | `:hammer:`                 | for bug fixes and non-breaking improvements (semver patch) |
| :wrench:                 | `:wrench:`                 | for configurations                                         |
| :vertical_traffic_light: | `:vertical_traffic_light:` | for tests                                                  |
| :memo:                   | `:memo:`                   | for documentations                                         |
| :mag:                    | `:mag:`                    | for lint fixes                                             |
| :recycle:                | `:recycle:`                | for non-breaking refactoring                               |
| :paperclip:              | `:paperclip:`              | for dependencies                                           |
| :octocat:                | `:octocat:`                | for workflows                                              |
| :construction:           | `:construction:`           | for experimental or temporary changes                      |

[cloudflare-workers-url]: https://workers.cloudflare.com/
[wrangler-url]: https://developers.cloudflare.com/workers/wrangler/get-started/
[npm-downloads-image]: https://badgen.net/npm/dm/@neoaren/comet
[npm-downloads-url]: https://npmcharts.com/compare/@neoaren/comet?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/@neoaren/comet
[npm-install-size-url]: https://packagephobia.com/result?p=@neoaren/comet
[npm-url]: https://npmjs.org/package/@neoaren/comet
[npm-version-image]: https://badgen.net/npm/v/@neoaren/comet
[url-pattern-api-url]: https://developer.mozilla.org/en-US/docs/Web/API/URL_Pattern_API
[cors-url]: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

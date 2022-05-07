# Comet

☄️ A convenient declarative routing library for Cloudflare Workers.

## Work in progress

This library is currently **work in progress**. It is not recommended to be used in production yet.

## Usage

### Cross-Origin Resource Sharing (CORS)

Comet ships with built-in support for [Cross-Origin Resource Sharing (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS). Permitted origins, methods, headers, as well as the maximum age for cached preflight responses can be configured globally for the entire API and locally on a per-route basis. Local configuration will always take precedence over the global one. The default configuration follows a zero-tolerance policy and permits no origins, no methods, no headers, and a 24 hour maximum age for cached preflight responses. Origins, methods and headers can be specified with an array of values, comma separated values, single values, or the `*` wildcard.

#### Global configuration example

```ts
import { comet } from '@neoaren/comet'

export default {
  fetch: comet({
    cors: {
      origins: [ 'https://example-a.com', 'https://example-b.com' ], // Array of values
      methods: 'GET, POST, DELETE', // Comma separated values
      headers: '*', // Wildcard allowing any value
      maxAge: 7200
    }
  })
}
```

#### Per-route configuration example

```ts
import { useComet } from '@neoaren/comet'

useComet({
  method: 'POST',
  pathname: '/api/users/auth',
  cors: {
    origins: 'https://example-a.com' // Overrides the global configuration
    // Rest of the parameters are inherited from the global configuration
  }
}, event => event.reply.ok())
```

## Contributing

Use commit names with the following prefixes to indicate its purpose

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

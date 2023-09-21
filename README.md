# Comet
![logo](comet_logo.png)

☄️ A powerful DX-first routing library for [Cloudflare Workers][cloudflare-workers-url].

[![NPM Version][npm-version-image]][npm-url]
[![NPM Install Size][npm-install-size-image]][npm-install-size-url]
[![NPM Downloads][npm-downloads-image]][npm-downloads-url]

```ts
import { GET, server } from '@neoaren/comet'

const comet = server()

comet.route({ pathname: '/api/test/:id', method: GET }, async ({ event }) => {
  // Business logic
  return event.reply.ok({ id: event.params.id })
})

export default <ExportedHandler>{
  fetch: comet.handler
}
```

## Documentation
A proper documentation for Comet is work in progress.

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
[npm-downloads-image]: https://badgen.net/npm/dm/@neoaren/comet
[npm-downloads-url]: https://npmcharts.com/compare/@neoaren/comet?minimal=true
[npm-install-size-image]: https://badgen.net/packagephobia/install/@neoaren/comet
[npm-install-size-url]: https://packagephobia.com/result?p=@neoaren/comet
[npm-url]: https://npmjs.org/package/@neoaren/comet
[npm-version-image]: https://badgen.net/npm/v/@neoaren/comet
[documentation-url]: https://github.com/NeoAren/comet/wiki

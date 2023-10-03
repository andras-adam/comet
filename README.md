![logo](comet_logo.png)

<p align="center">
  ☄️ A powerful DX-first routing library for <a href="https://workers.cloudflare.com/">Cloudflare Workers</a>.
</p>

<p align="center">
  <a href="https://npmjs.org/package/@neoaren/comet"><img src="https://badgen.net/npm/v/@neoaren/comet" alt="NPM Version"></a>
  <a href="https://packagephobia.com/result?p=@neoaren/comet"><img src="https://badgen.net/packagephobia/install/@neoaren/comet" alt="NPM Install Size"></a>
  <a href="https://npmcharts.com/compare/@neoaren/comet?minimal=true"><img src="https://badgen.net/npm/dm/@neoaren/comet" alt="NPM Downloads"></a>
</p>

-----

## Getting started

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

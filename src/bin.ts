import { readFile, writeFile, unlink } from 'node:fs/promises'
import fs from 'node:fs'
import * as esbuild from 'esbuild'
import { parse } from '@babel/parser'
import traverse from '@babel/traverse'
import { defineCommand, runMain } from 'citty'
import { Route } from './router'
import { Method } from './types'
import { Server } from './server'
import { OpenApi, OpenApiOptions, routeToOpenApiOperation } from './openapi'


const mainCommand = defineCommand({
  meta: {
    name: 'generate',
    version: '1.0.0',
    description: 'Generate OpenAPI docs for comet routes'
  },
  args: {
    input: {
      type: 'string',
      default: 'src/index.ts'
    },
    output: {
      type: 'string',
      default: 'openapi.json'
    },
    info: {
      type: 'string',
      required: true
    },
    date: {
      type: 'string',
      default: ''
    },
    prefix: {
      type: 'string',
      default: '/api'
    }
  },
  run({ args }) {
    if (!fs.existsSync(args.input)) {
      console.error(`Input file '${args.input}' does not exist!`)
      return
    }

    try {
      const info = JSON.parse(args.info)

      if (typeof info !== 'object' || !info.title || !info.version) {
        console.error('Invalid info argument! Title and version properties required.')
        return
      }
    } catch {
      console.error('Invalid info arguemnt! JSON format required.')
      return
    }

    if (args.date !== '' && !/^\d{4}-\d{2}-\d{2}$/.test(args.date)) {
      console.error('Invalid date argument! Empty string or "yyyy-mm-dd" format required.')
      return
    }

    generate(args)
  }
})

await runMain(mainCommand)

function getComments(comments: string): { [key: string]: string[] } {
  const commentArray = comments.split('* @').slice(1).map(comment => {
    return comment.slice(0, -2)
  })

  const commentsByType: { [key: string]: string[] } = { description: [], summary: [], tag: [] }

  commentArray.forEach(comment => {
    const words = comment.split(' ')
    const head = words[0]
    const tail = words.slice(1).join(' ')

    commentsByType[head].push(tail)
  })
  return commentsByType
}

async function generate(args: {input: string; output: string; info: string; date: string; prefix: string}) {

  const openApiOptions: OpenApiOptions = {
    info: JSON.parse(args.info)
  }
  const outFile = args.output
  const inFile = args.input

  await esbuild.build({
    entryPoints: [ inFile ],
    bundle: true,
    // packages: 'external',
    external: [ '@neoaren/comet', 'zod' ],
    legalComments: 'inline',
    outfile: './tmp.js',
    format: 'esm',
    plugins: [
      {
        name: 'replace-jsdoc-with-legal',
        setup(build) {
          build.onLoad({ filter: /.ts$/ }, async args => {
            const text = await readFile(args.path, 'utf8')
            return {
              contents: text.replaceAll('/**', '/*!'),
              loader: 'ts'
            }
          })
        }
      }
    ]
  })

  const tmpFileName = './tmp.js'
  const builtWorker = await readFile(tmpFileName, 'utf8')
  await writeFile(tmpFileName, builtWorker.replace('@neoaren/comet', './dist/index.mjs'), 'utf8')

  // @ts-expect-error: Property 'UrlPattern' does not exist
  if (!globalThis.URLPattern) {
    await import('urlpattern-polyfill')
  }

  // @ts-expect-error dynamically import tmp.js
  const tmpImport = await import('../tmp.js')

  const server: Server<any, any, any> = tmpImport.workerComet
  const router = Server.getRouter(server)
  const routes = router.getRoutes()

  const methods: Array<Method> = [
    Method.GET,
    Method.PUT,
    Method.POST,
    Method.DELETE,
    Method.OPTIONS,
    Method.HEAD,
    Method.PATCH,
    Method.TRACE,
    Method.CONNECT
  ]

  const flattenedRoutes: Route[] = routes.flatMap(route => route.method === Method.ALL ? methods.map(method => ({
    ...route,
    method
  })) : [ route ])

  const groupedRoutes: Record<string, Record<string, Route[]>> = flattenedRoutes.reduce((groups, thisRoute) => { // group routes by pathname, then method
    groups[thisRoute.pathname] = groups[thisRoute.pathname] ?? {}
    groups[thisRoute.pathname][thisRoute.method] = groups[thisRoute.pathname][thisRoute.method] ?? []
    groups[thisRoute.pathname][thisRoute.method].push(thisRoute)
    return groups
  }, {} as Record<string, Record<string, Route[]>>)

  function compareDatesBeforeToday(date1: string | undefined, date2: string | undefined) { // dates can be string or undefined
    let Date1 = date1 === undefined ? undefined : new Date(date1) // create date objects from strings
    let Date2 = date2 === undefined ? undefined : new Date(date2)
    let Today: Date
    // eslint-disable-next-line unicorn/prefer-ternary
    if (args.date === '') {
      Today = new Date(`${new Date().getFullYear()}-${new Date().getMonth() + 1}-${new Date().getDate()}`) // todays date
    } else {
      Today = new Date(args.date)
    }

    if (Date1 !== undefined) { // delete dates that are later than today
      Date1 = Date1 > Today ? undefined : Date1
    }
    if (Date2 !== undefined) {
      Date2 = Date2 > Today ? undefined : Date2
    }
    if (Date1 === undefined && Date2 === undefined) { // if there are no valid dates, return null
      return null
    } else if (Date1 === undefined || Date2 === undefined) { // otherwise return the latest date
      return Date1 === undefined ? date2 : date1
    }
    return Date1 > Date2 ? date1 : date2

  }

  const ungroupedRoutes: { [pathname: string]: Route[] } = {}

  Object.entries(groupedRoutes).map(route => { // filter routes where there are multiple dates
    const pathname = route[0]
    const routes = route[1]
    const objects: Route[] = []

    Object.values(routes).forEach(method => {
      if (method.length > 1) { // routes with multiple dates
        let correctMethod: Route | null = null
        method.forEach(object => {
          if (correctMethod === null) {
            correctMethod = object
          } else {
            const comparedDate = compareDatesBeforeToday(correctMethod.compatibilityDate, object.compatibilityDate) // compare dates
            if (comparedDate !== null && comparedDate === object.compatibilityDate) {
              correctMethod = object
            }
          }
        })
        if (correctMethod) {
          objects.push(correctMethod)
        }
      } else {
        objects.push(method[0]) // routes with single date
      }
    })
    ungroupedRoutes[pathname] = objects // add the filtered route to the correct pathname
  })

  const paths: OpenApi['paths'] = Object.fromEntries(Object.entries(ungroupedRoutes).map(([ pathname, cometRoutes ]) => {
    return [
      (pathname.startsWith('/') ? pathname : `/${pathname}`) as `/${string}`,
      Object.fromEntries(cometRoutes.map(route => ([ route.method.toLowerCase(), routeToOpenApiOperation(route) ])))
    ]
  }))

  const code = await readFile(tmpFileName, { encoding: 'utf8' })
  const astree = parse(code, { attachComment: true, plugins: [ 'typescript' ], sourceType: 'module' })

  Object.keys(paths).forEach(key => {
    const value = paths[key as keyof typeof paths]
    if (key.slice(0, args.prefix.length) !== args.prefix) { // check if the given prefix matches the api's prefix
      return
    }
    const pathToCompare = `"${key.slice(args.prefix.length)}"` // slice the prefix from the path for easier comparing
    Object.keys(value).forEach(method => {

      let information: {checkNum: number; data: { [key: string]: string[] }} = { checkNum: 0, data: {} }

      const methodToCompare = method.toUpperCase()
      const valueData: any = value[method as keyof typeof value]
      let dateToCompare: string | undefined

      if (valueData && valueData.parameters) {
        dateToCompare = valueData.parameters[0].compatibilityDate
      }

      // @ts-expect-error - @babel/traverse export is messed up
      traverse.default(astree, {
        ExpressionStatement: function(path: any) { // check each path's each method and look for leading comments
          if (path.node.leadingComments !== undefined) {
            const data = getComments(path.node.leadingComments[0].value)
            const propertiesArray = path.node.expression.arguments[0].properties // properties of the api

            const valuesArray = propertiesArray.map((key: any) => { // api properties from the code
              const codeValue = code.slice(key.value.start, key.value.end)
              if (/^\d{4}-\d{2}-\d{2}$/.test(codeValue.slice(1, -1))) {
                return { compatibilityDate: codeValue }
              } else if (Object.values(Method).includes(codeValue as Method)) {
                return { method: codeValue }
              }
              return codeValue
            })
            const containsDate = valuesArray.some((item: object) => typeof item === 'object' && 'compatibilityDate' in item)
            const containsMethod = valuesArray.some((item: object) => typeof item === 'object' && 'method' in item)
            let checkNum = 0

            if (valuesArray.includes(pathToCompare)) {
              checkNum++

              if (containsMethod && valuesArray.some((item: any) => item.method === methodToCompare)) {
                checkNum++
              }

              if (containsDate && valuesArray.some((item: any) => item.compatibilityDate === `"${dateToCompare}"`)) {
                checkNum++
              }
            }

            if (checkNum > information.checkNum) {
              information = { checkNum: checkNum, data: data }
            }
          }
        }
      })
      // information contains the correct inline comments for each api and method
      const currentNode = paths[key as keyof typeof paths][method as keyof typeof value]
      if (information.checkNum > 0) {
        information.data.description.length === 0 ? null : currentNode.description = information.data.description
        information.data.summary.length === 0 ? null : currentNode.summary = information.data.summary
        information.data.tag.length === 0 ? null : currentNode.tags = information.data.tag
      }
    })
  })

  await unlink(tmpFileName)
  const output = { ...openApiOptions, paths, openapi: '3.1.0' }
  writeFile(outFile, JSON.stringify(output, null, 2))
}

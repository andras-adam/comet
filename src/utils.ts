import { IParams, Method } from './types'


// Converts the given string to a valid HTTP method
export function toSafeMethod(unsafeMethod?: string): Method {
  const method = String(unsafeMethod)?.toUpperCase()
  return Method[method as keyof typeof Method] ?? Method.ALL
}

// Ensures that the given pathname is valid, has a leading slash, and has no trailing slash
export function toSafePathname(unsafePathname: string): string {
  const segments = unsafePathname.trim().split('/')
  if (segments[0] === '') segments.shift()
  if (segments[segments.length - 1] === '') segments.pop()
  return `/${segments.join('/')}`
}

// Get the path parameters from the given template and pathname
export function getPathParameters(template: string, pathname: string): IParams {
  const templateSegments = template.split('/')
  const pathSegments = pathname.split('/')
  const params: IParams = {}
  for (const [ i, templateSegment ] of templateSegments.entries()) {
    if (templateSegment.startsWith(':')) {
      params[templateSegment.slice(1)] = pathSegments[i]
    }
  }
  return params
}

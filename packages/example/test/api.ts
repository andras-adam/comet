import { SELF } from 'cloudflare:test'
import { expect, it } from 'vitest'

it('should return 404 on GET /', async () => {
  const response = await SELF.fetch('https://domain/')
  expect(response.status).toBe(404)
})

it('should return 200 on GET /api/test', async () => {
  const response = await SELF.fetch('https://domain/api/test')
  expect(response.status).toBe(200)
})

it('should return 405 on PUT /api/test', async () => {
  const response = await SELF.fetch('https://domain/api/test', { method: 'PUT' })
  expect(response.status).toBe(405)
})

it('should return 200 on GET /api/test/123', async () => {
  const response = await SELF.fetch('https://domain/api/test/123')
  expect(response.status).toBe(200)
  await expect(response.json()).resolves.toEqual({ found: true })
})

it('should return 500 on GET /api/test/error/1', async () => {
  const response = await SELF.fetch('https://domain/api/error/1')
  expect(response.status).toBe(500)
})

it('should return 500 on POST /api/test/error/2', async () => {
  const response = await SELF.fetch('https://domain/api/test/error/2', { method: 'POST' })
  expect(response.status).toBe(500)
})

it('should return 400 on POST /api/test2/stuff/asd without body', async () => {
  const response = await SELF.fetch('https://domain/api/test2/stuff/asd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  expect(response.status).toBe(400)
  await expect(response.json()).resolves.toMatchInlineSnapshot(`
    {
      "error": "Invalid JSON in body",
    }
  `)
})

it('should return 400 on POST /api/test2/stuff/asd incorrect body', async () => {
  const response = await SELF.fetch('https://domain/api/test2/stuff/asd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ foo: 123 })
  })
  expect(response.status).toBe(400)
  await expect(response.json()).resolves.toMatchInlineSnapshot(`
    {
      "errors": {
        "body": [
          {
            "code": "invalid_type",
            "expected": "string",
            "message": "Expected string, received number",
            "path": [
              "foo",
            ],
            "received": "number",
          },
        ],
      },
    }
  `)
})

it('should return 200 on POST /api/test2/stuff/asd with body', async () => {
  const response = await SELF.fetch('https://domain/api/test2/stuff/asd', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ foo: 'bar' })
  })
  //expect(response.status).toBe(200)
  await expect(response.json()).resolves.toMatchInlineSnapshot(`
    {
      "foo": "bar",
    }
  `)
})

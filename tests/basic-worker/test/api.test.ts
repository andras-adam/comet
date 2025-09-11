import { SELF } from 'cloudflare:test'
import { expect, it } from 'vitest'


it('should return 404 on GET /', async () => {
  const response = await SELF.fetch('https://domain/')
  expect(response.status).toBe(404)
})

it('should return 200 on GET /sanity-test', async () => {
  const response = await SELF.fetch('https://domain/sanity-test')
  expect(response.status).toBe(200)
})

it('should return env var', async () => {
  const response = await SELF.fetch('https://domain/get-env-var')
  expect(response.status).toBe(200)
  expect(response.text()).resolves.toBeTypeOf('string')
})

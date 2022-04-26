export default {
  async fetch(request: Request) {
    return new Response(JSON.stringify({ foo: 'bar' }))
  }
}

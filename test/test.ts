import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { comet, Request, Response } from '../src';

chai.use(chaiHttp);

const app = comet();

const server = chai.request(app.http(3001)).keepOpen();

suiteTeardown(() => {
  server.close();
});

suite('Health endpoint', () => {

  suiteSetup(() => {
    app.get('/api', (req: Request, res: Response) => res.ok({ ok: true }));
  });

  suiteTeardown(() => {
    app.reset();
  });

  test('should return status 200 OK', async () => {
    const res = await server.get('/api');
    expect(res.status).to.equal(200);
  });

  test('should return application/json', async () => {
    const res = await server.get('/api');
    expect(res.header).to.have.property('content-type');
    expect(res.header['content-type']).to.equal('application/json');
  });

  test('should return body with ok: true', async () => {
    const res = await server.get('/api');
    expect(res.body).to.have.property('ok');
    expect(res.body.ok).to.equal(true);
  });

});

suite('Path matching', () => {

  suiteSetup(() => {
    app.get('/products', (req: Request, res: Response) => res.ok({ handler: 1 }));
    app.get('/products/search', (req: Request, res: Response) => res.ok({ handler: 2 }));
    app.get('/products/:productId', (req: Request, res: Response) => res.ok({ handler: 3 }));
    app.get('/products/:productId/code', (req: Request, res: Response) => res.ok({ handler: 4 }));
    app.get('/products/recent', (req: Request, res: Response) => res.ok({ handler: 5 }));
  });

  suiteTeardown(() => {
    app.reset();
  });

  test('path with single segment should match correctly', async () => {
    const res1 = await server.get('/products');
    expect(res1.status).to.equal(200);
    expect(res1.body.handler).to.equal(1);
    const res2 = await server.get('/categories');
    expect(res2.status).to.equal(404);
  });

  test('path with multiple segments should match correctly', async () => {
    const res1 = await server.get('/products/search');
    expect(res1.status).to.equal(200);
    expect(res1.body.handler).to.equal(2);
    const res2 = await server.get('/categories/search');
    expect(res2.status).to.equal(404);
  });

  test('path with parameter segment should match correctly', async () => {
    const res1 = await server.get('/products/123456');
    expect(res1.status).to.equal(200);
    expect(res1.body.handler).to.equal(3);
    const res2 = await server.get('/products/recent');
    expect(res2.status).to.equal(200);
    expect(res2.body.handler).to.equal(3);
    const res3 = await server.get('/products/nosuchpath');
    expect(res3.status).to.equal(200);
    expect(res3.body.handler).to.equal(3);
    const res4 = await server.get('/products/123456/code');
    expect(res4.status).to.equal(200);
    expect(res4.body.handler).to.equal(4);
    const res5 = await server.get('/products/123456/name');
    expect(res5.status).to.equal(404);
  });

  test('trailing slash should not affect matching', async () => {
    const res1 = await server.get('/products/');
    expect(res1.status).to.equal(200);
    expect(res1.body.handler).to.equal(1);
    const res2 = await server.get('/products/search/');
    expect(res2.status).to.equal(200);
    expect(res2.body.handler).to.equal(2);
    const res3 = await server.get('/products/123/');
    expect(res3.status).to.equal(200);
    expect(res3.body.handler).to.equal(3);
    const res4 = await server.get('/categories/');
    expect(res4.status).to.equal(404);
  });

});

suite('Method matching', () => {

  suiteSetup(() => {
    app.get('/api/users', (req: Request, res: Response) => res.ok());
    app.post('/api/users', (req: Request, res: Response) => res.ok());
  });

  suiteTeardown(() => {
    app.reset();
  });

  test('should return status 406 not acceptable', async () => {
    const res = await server.delete('/api/users');
    expect(res.status).to.equal(406);
  });

  test('should have allow header set to acceptable methods', async () => {
    const res = await server.delete('/api/users');
    expect(res.header).to.have.property('allow');
    expect(res.header['allow']).to.equal('GET,POST');
  });

});

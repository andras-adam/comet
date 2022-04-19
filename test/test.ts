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

suite('Pathname matching', () => {

  suiteSetup(() => {
    app.get('/', (req: Request, res: Response) => res.ok({ handler: 0 }));
    app.get('/products', (req: Request, res: Response) => res.ok({ handler: 1 }));
    app.get('/products/search', (req: Request, res: Response) => res.ok({ handler: 2 }));
    app.get('/products/:productId', (req: Request, res: Response) => res.ok({ handler: 3 }));
  });

  suiteTeardown(() => {
    app.reset();
  });

  test('should match correctly pathnames with no segments', async () => {
    const res = await server.get('/');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('handler');
    expect(res.body.handler).to.equal(0);
  });

  test('should match correctly pathnames with a single segment', async () => {
    const res = await server.get('/products');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('handler');
    expect(res.body.handler).to.equal(1);
  });

  test('should match correctly pathnames with multiple segments', async () => {
    const res = await server.get('/products/search');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('handler');
    expect(res.body.handler).to.equal(2);
  });

  test('should match correctly pathnames with parameter segments', async () => {
    const res = await server.get('/products/123456');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('handler');
    expect(res.body.handler).to.equal(3);
  });

  test('should match correctly pathnames with a trailing slash', async () => {
    const res = await server.get('/products/');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('handler');
    expect(res.body.handler).to.equal(1);
  });

  test('should not match unsupported pathnames', async () => {
    const res = await server.get('/categories');
    expect(res.status).to.equal(404);
  });

});

suite('Method matching', () => {

  suiteSetup(() => {
    app.get('/products', (req: Request, res: Response) => res.ok({ handler: 0 }));
    app.post('/products', (req: Request, res: Response) => res.ok({ handler: 1 }));
    app.all('/users', (req: Request, res: Response) => res.ok({ handler: 2 }));
  });

  suiteTeardown(() => {
    app.reset();
  });

  test('should match correctly methods with direct support', async () => {
    const res = await server.get('/products');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('handler');
    expect(res.body.handler).to.equal(0);
  });

  test('should match correclty methods with indirect support', async () => {
    const res = await server.delete('/users');
    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('handler');
    expect(res.body.handler).to.equal(2);
  });

  test('should not match unsupported methods', async () => {
    const res = await server.delete('/products');
    expect(res.status).to.equal(406);
    expect(res.header).to.have.property('allow');
    expect(res.header['allow']).to.equal('GET,POST');
  });

});

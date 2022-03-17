import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { comet, Request, Response } from '../src';

chai.use(chaiHttp);

const app = comet();

app.get('/api', (req: Request, res: Response) => {
  res.ok({ ok: true });
});

const server = chai.request(app.http(3001)).keepOpen();

describe('GET /api', () => {

  it('should return status 200 OK', async () => {
    const res = await server.get('/api');
    expect(res.status).to.equal(200);
  });

  it('should return application/json', async () => {
    const res = await server.get('/api');
    expect(res.header).to.have.property('content-type');
    expect(res.header['content-type']).to.equal('application/json');
  });

  after(() => {
    server.close();
  });

});

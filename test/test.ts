/* eslint-disable @typescript-eslint/no-unused-expressions */
import chai, { expect } from 'chai';
import chaiHttp from 'chai-http';
import { comet, Request, Response } from '../src';

chai.use(chaiHttp);

const app = comet();

app.get('/api', (req: Request, res: Response) => {
  res.ok({ ok: true });
});

const httpServer = app.http(3001);

describe('GET /api', () => {

  it('should return status 200 OK', done => {
    chai.request(httpServer).get('/api').end((error, res) => {
      if (error) return console.error(error);
      expect(res.status).to.equal(200);
      done();
    });
  });

  it('should return application/json', done => {
    chai.request(httpServer).get('/api').end((error, res) => {
      if (error) return console.error(error);
      expect(res.header).to.have.property('content-type');
      expect(res.header['content-type']).to.equal('application/json');
      done();
    });
  });

});

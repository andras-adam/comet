import { comet, NextFunction, Request, Response } from '../src';

const app = comet();

app.get('/api', (req: Request, res: Response) => {
  console.log('health', req.body, req.params);
  res.ok({ ok: true });
});

app.use('/api/users', (req: Request, res: Response, next: NextFunction) => {
  console.log('middleware', req.body, req.params);
  next();
});

app.all('/api/users/test', (req: Request, res: Response) => {
  console.log('all test', req.body, req.params);
  res.ok({ ok: true });
});

app.post('/api/users/test', (req: Request, res: Response) => {
  console.log('post test', req.body, req.params);
  res.ok({ ok: true });
});

app.post('/api/users/auth', (req: Request, res: Response) => {
  console.log('auth', req.body, req.params);
  res.ok({ ok: true });
});

app.get('/api/users/search', (req: Request, res: Response) => {
  console.log('search', req.body, req.params);
  res.ok({ ok: true });
});

app.get('/api/users/:userId', (req: Request, res: Response) => {
  console.log('user', req.body, req.params);
  res.ok({ ok: true });
});

app.http(3000);

import { comet, Request } from '../src';

const app = comet();

app.get('/api', (req: Request) => {
  console.log('health', req.body, req.params);
});

app.use('/api/users', (req: Request) => {
  console.log('middleware', req.body, req.params);
});

app.all('/api/users/test', (req: Request) => {
  console.log('all test', req.body, req.params);
});

app.post('/api/users/test', (req: Request) => {
  console.log('post test', req.body, req.params);
});

app.post('/api/users/auth', (req: Request) => {
  console.log('auth', req.body, req.params);
});

app.get('/api/users/search', (req: Request) => {
  console.log('search', req.body, req.params);
});

app.get('/api/users/:userId', (req: Request) => {
  console.log('user', req.body, req.params);
});

app.http(3000);

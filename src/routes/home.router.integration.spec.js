import supertest from 'supertest';
import app from '@/app';

const request = supertest(app);

describe('Router > Integration > Home', () => {
  it('should return status 200 and a welcome message', async () => {
    const res = await request.get('/api').set({ email: 'wagner.castro@gmail.com' });

    expect(res.status).toEqual(200);
    expect(res.body).toEqual({ welcome: 'Welcome Stranger!' });
  });
});

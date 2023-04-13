// import * as service from '@/database/service';
import { get } from './service.middleware';

describe('Middleware > Service', () => {
  // jest.mock(service);

  it('should add service to the request', () => {
    const req = {};
    const next = jest.fn().mockName('next');

    get(req, null, next);

    expect(req.service).toBeDefined();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(/** nothing */);
  });
});

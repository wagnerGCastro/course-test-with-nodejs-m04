import ordersStub from 'test/stubs/orders.json';
import * as service from '@/database/service';
import { appError } from '@/utils';
import { StatusCodes } from 'http-status-codes';
import * as OrdersController from './orders.controller';

jest.mock('@/database/service');

const user = {
  email: 'vedovelli@gmail.com',
  id: 111
};

const mocks = {
  req: {
    user,
    headers: { email: user.email },
    body: {},
    params: {},
    service,
  },
  res: {
    status: jest.fn(() => mocks.res).mockName('res.status()'),
    json: jest.fn(() => mocks.res).mockName('res.json()'),
  },
  next: jest.fn().mockName('next'),
};

describe('Controllers > Orders', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return status 200 with a list of the orders ', async () => {
    // const req = {
    //   user,
    //   headers: { email: user.email },
    //   body: {},
    //   params: {},
    //   service,
    // };

    // const res = {
    //   status: jest.fn(() => res).mockName('res.status()'),
    //   json: jest.fn(() => res).mockName('res.json()'),
    // };

    // const next = jest.fn().mockName('next');

    const { req, res, next } = mocks;

    jest.spyOn(req.service, 'listOrders').mockResolvedValueOnce(ordersStub);

    await OrdersController.index(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ orders: ordersStub });

    expect(req.service.listOrders).toHaveBeenCalledTimes(1);
    expect(req.service.listOrders).toHaveBeenCalledWith(req.user.id);
  });

  it('should forward an error when Service Orders fails', async () => {
    const { req, res, next } = mocks;
    const error = appError(
      'Some message here!',
      StatusCodes.INTERNAL_SERVER_ERROR
    );

    jest.spyOn(req.service, 'listOrders').mockRejectedValueOnce(error);

    await OrdersController.index(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });
});

import { StatusCodes } from 'http-status-codes';
import * as service from '@/database/service';
import * as validator from 'express-validator';
import { appError } from '@/utils';
import products from 'test/stubs/orders.json';
import { create, index, validate } from './orders.controller';
import { validationResponse } from './utils';

jest.mock('express-validator');
jest.mock('./utils');
jest.mock('@/database/service');

JSON.stringify = jest.fn();

const user = {
  email: 'wagner',
  id: 111
};

const mocks = {
  req: {
    user,
    headers: { email: user.email },
    body: { products },
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

  it('should return status 200 with a list of orders', async () => {
    const { req, res, next } = mocks;
    const orders = products;

    jest.spyOn(req.service, 'listOrders').mockResolvedValueOnce(orders);

    await index(req, res, next);

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ orders });

    expect(req.service.listOrders).toHaveBeenCalledTimes(1);
    expect(req.service.listOrders).toHaveBeenCalledWith(req.user.id);
  });

  it('should forward an error when service.listOrder fails', async () => {
    const { req, res, next } = mocks;

    const error = appError(
      'Some message here!',
      StatusCodes.INTERNAL_SERVER_ERROR
    );

    jest.spyOn(req.service, 'listOrders').mockRejectedValueOnce(error);

    await index(req, res, next);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);
  });

  it('should return status 200 and the created order id', async () => {
    const { res, req, next } = mocks;

    const isEmpty = jest.fn().mockReturnValueOnce(true);

    jest.spyOn(validator, 'validationResult').mockReturnValueOnce({
      isEmpty,
    });

    jest.spyOn(req.service, 'saveOrder').mockResolvedValueOnce({
      id: 123456,
    });

    await create(req, res, next);

    expect(isEmpty).toHaveBeenCalledTimes(1);

    expect(JSON.stringify).toHaveBeenCalledTimes(1);
    expect(JSON.stringify).toHaveBeenCalledWith(products);

    expect(req.service.saveOrder).toHaveBeenCalledTimes(1);
    expect(req.service.saveOrder).toHaveBeenCalledWith({
      userid: req.user.id,
      products: JSON.stringify(req.body.products),
    });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);

    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ order: { id: 123456 } });
  });

  it('should forward an error when service.saveOrder fails', async () => {
    const { res, req, next } = mocks;

    const error = appError(
      'Some error here',
      StatusCodes.INTERNAL_SERVER_ERROR
    );

    const isEmpty = jest.fn().mockResolvedValueOnce('Please provide a list of products');

    jest.spyOn(validator, 'validationResult').mockReturnValueOnce({
      isEmpty
    });

    jest.spyOn(req.service, 'saveOrder').mockRejectedValueOnce(error);

    await create(req, res, next);

    expect(isEmpty).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledWith(error);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should return validation response when error bag is not empty', async () => {
    const { res, req, next } = mocks;

    const errorBag = {
      isEmpty: jest.fn().mockReturnValueOnce(false),
      array: jest.fn().mockRejectedValueOnce([ 'error1', 'error2' ])
    };

    jest.spyOn(validator, 'validationResult').mockReturnValueOnce(errorBag);

    expect(await create(req, res, next)).toBeUndefined();

    expect(validationResponse).toHaveBeenCalledTimes(1);
    expect(validationResponse).toHaveBeenCalledWith(res, errorBag);

    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
  });

  it('should build a list of errors', () => {
    const method = 'create';
    const existsFn = jest.fn().mockReturnValueOnce('Please provide a list of products');

    jest.spyOn(validator, 'body').mockReturnValueOnce({
      exists: existsFn,
    });

    const errors = validate(method);

    expect(errors).toHaveLength(1);
    expect(errors).toEqual([ 'Please provide a list of products' ]);

    expect(validator.body).toHaveBeenCalledTimes(1);
    expect(validator.body).toHaveBeenCalledWith('products', 'Please provide a list of products',);
  });

  it('should throw an error when an unknown method is provided', () => {
    expect(() => {
      validate('some unknown method');
    }).toThrowError('Please provide a valid method name');
  });
});

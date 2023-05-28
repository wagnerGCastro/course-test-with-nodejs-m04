import ordersJson from 'test/stubs/orders.json';
import { appError } from '@/utils';
import { logger } from '@/utils/logger';
import { StatusCodes } from 'http-status-codes';
import { Order } from '../models/order.model';
import { listOrders, saveOrder } from './orders.service';

jest.mock('../models/order.model');
jest.mock('@/utils/logger');

JSON.parse = jest.fn();

const orders = ordersJson.map(order => {
  // eslint-disable-next-line no-param-reassign
  order.products = JSON.stringify(order.products, null, 2);

  return order;
});

describe('Database > Service > Orders', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of orders', async () => {
    const user = {
      email: 'wagner.castro@test.com',
      id: 111
    };

    const where = { userid: user.id };

    jest.spyOn(Order, 'findAll').mockResolvedValueOnce(orders);

    const result = await listOrders(user.id);

    expect(result).toEqual(orders);
    expect(Order.findAll).toHaveBeenCalledTimes(1);
    expect(Order.findAll).toHaveBeenCalledWith({ where });
    expect(JSON.parse).toBeCalledTimes(3);
  });

  it('should return with an error when Order.findAll() fails', () => {
    const user = {
      email: 'wagner.castro@test.com',
      id: 111
    };

    const error = appError(
      `Failed to retrieve orders for user: ${user.id}`,
      StatusCodes.INTERNAL_SERVER_ERROR
    );

    jest.spyOn(Order, 'findAll').mockRejectedValueOnce(error);

    expect(listOrders(user.id)).rejects.toEqual(error);
  });

  it('should reject with an error when saveOrder() is executed without any data ', () => {
    const error = appError(
      'Failed to save order',
      StatusCodes.INTERNAL_SERVER_ERROR
    );

    expect(saveOrder()).rejects.toEqual(error);
  });

  it('should save and return new order', async () => {
    const data = {
      userid: 111,
      products: [
        {
          image: 'https://images.unsplash.com/photo-1444881421460-d838c3b98f95?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=889&q=80',
          price: '97.00',
          quantity: 1,
          title: 'assumenda autem officia',
          id: '1'
        },
        {
          image: 'https://images.unsplash.com/photo-1526045431048-f857369baa09?ixlib=rb-1.2.1&auto=format&fit=crop&w=750&q=80',
          price: '994.00',
          quantity: 2,
          title: 'deserunt porro aut',
          id: '2'
        },
      ]
    };

    const order = { ...data, id: 1 };

    jest.spyOn(Order, 'create').mockResolvedValueOnce(order);

    /** equal the line 95 */
    // const result = await saveOrder(data);
    // expect(result).toEqual(order);

    expect(saveOrder(data)).resolves.toEqual(order);

    expect(Order.create).toHaveBeenCalledTimes(1);
    expect(Order.create).toHaveBeenCalledWith(data);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith('New order saved', { data });
  });
});

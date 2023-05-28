import { logger } from '@/utils/logger';
import { StatusCodes } from 'http-status-codes';

import { validationResponse } from './utils';

jest.mock('@/utils/logger');

describe('Contollers > uitls ', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should call res.status and res.json with proper data', () => {
    const res = {
      json: jest.fn(() => res).mockName('res.json'),
      status: jest.fn(() => res).mockName('res.status')
    };

    const errors = {
      array: jest.fn().mockReturnValueOnce([ 'error1', 'error2' ]).mockName('errors.array()')
    };

    validationResponse(res, errors);

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error).toHaveBeenCalledWith('Validation failure', { errors: [ 'error1', 'error2' ] });

    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledWith({ errors: [ 'error1', 'error2' ] });

    expect(errors.array).toHaveBeenCalledTimes(1);
  });
});

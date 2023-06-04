import { User } from '@/database/models/user.model';
import { appError, logger } from '@/utils';
import { StatusCodes } from 'http-status-codes';

import * as UserService from './users.service';

jest.mock('@/database/models/user.model');
jest.mock('@/utils/errors');
jest.mock('@/utils/logger');

describe('Database > Services > Users', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listUsers()', () => {
    it('should return a list of users', async () => {
      const usersList = [ {
        email: 'wagner.castro@test.com',
        id: 111
      } ];

      const users = [ {
        email: 'wagner.castro@test.com',
        id: 111
      } ];

      jest.spyOn(User, 'findAll').mockResolvedValueOnce(usersList).mockName('user.model.findAll');

      const result = await UserService.listUsers();

      expect(result).toEqual(users);
      expect(User.findAll).toHaveBeenCalledTimes(1);
      expect(User.findAll).toBeCalledWith(/** notinhg */);
    });

    it('should reject with an error when User.findAll() fails', async () => {
      const message = 'Failed to retrieve users';
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const error = appError(message, status);

      jest.spyOn(User, 'findAll').mockRejectedValueOnce(error);

      // eslint-disable-next-line max-len
      // const mockNavigator = jest.spyOn(User, 'findAll').mockImplementation(() => Promise.reject(error));

      try {
        await UserService.listUsers();
      } catch (exception) {
        expect(exception).toEqual(error);
        // expect(appError).toHaveBeenCalledTimes(2);
        expect(appError).toHaveBeenCalledWith(message);
      }

      // mockNavigator.mockClear();
    });
  });

  describe('findOrSave()', () => {
    it('should return a user when findOrSave is executed', async () => {
      const user = {
        email: 'wagner.castro@test.com',
        id: 111
      };
      const params = { where: { email: user.email } };

      jest.spyOn(User, 'findOrCreate').mockResolvedValueOnce(user);

      const result = await UserService.findOrSave(user.email);

      expect(result).toEqual(user);
      expect(User.findOrCreate).toHaveBeenCalledTimes(1);
      expect(User.findOrCreate).toHaveBeenCalledWith(params);
      expect(logger.info).toHaveBeenCalledTimes(1);
      expect(logger.info).toHaveBeenCalledWith(`User located or created with email: ${user.email}`);
    });

    //   it('should reject with an error when User.findOrCreate()', async () => {
    //     const user = {
    //       email: 'wagner.castro@test2.com',
    //       id: 111
    //     };

    //     const message = `Failed to retrieve or save user with email: ${user.email}`;
    //     const status = StatusCodes.INTERNAL_SERVER_ERROR;
    //     const error = appError(message, status);

    //     jest.spyOn(User, 'findOrCreate').mockRejectedValueOnce(error);

    //     // expect(UserService.findOrSave(user.email)).rejects.toEqual(new Error('Error'));

    //     // try {
    //     //   await UserService.findOrSave(user.email);
    //     // } catch (exception) {
    //     //   expect(exception).toEqual(error);
    //     //   expect(logger.info).not.toHaveBeenCalled();
    //     //   expect(appError).toHaveBeenCalledTimes(2);
    //     //   expect(appError).toHaveBeenCalledWith(error);
    //     // }

    //     expect(UserService.findOrSave(user.email)).rejects.toEqual(error);

    //     expect(logger.info).not.toHaveBeenCalled();
    //     expect(appError).toHaveBeenCalledTimes(1);
    //     expect(appError).toHaveBeenCalledWith(error);
    //   });
    // });

    it('should reject with an error when User.findOrCreate()', async () => {
      const email = 'wagner.castro@test2.com';
      const message = `Failed to retrieve or save user with email: ${email}`;
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const error = appError(message, status);

      jest.spyOn(User, 'findOrCreate').mockRejectedValueOnce(error);

      expect(UserService.findOrSave(email)).rejects.toEqual(error);
      expect(logger.info).not.toHaveBeenCalled();
      expect(appError).toHaveBeenCalledTimes(1);
      expect(appError).toHaveBeenCalledWith(message, status);
    });
  });

  describe('saveUser()', () => {
    it('should reject with an error when saveUser() is executed without any data', async () => {
      const message = 'Failed to save user';
      const status = StatusCodes.INTERNAL_SERVER_ERROR;
      const error = appError(message, status);

      expect(UserService.saveUser()).rejects.toEqual(error);
      expect(appError).toHaveBeenCalledWith(message, status);
    });

    it('should save and return user ', async () => {
      const data = {
        email: 'wagner.castro@test.com.br'
      };
      const userSaved = { ...data, id: 111 };

      jest.spyOn(User, 'create').mockResolvedValueOnce(userSaved);

      // const result = await UserService.saveUser(data);
      // expect(result).toEqual(userSaved);

      expect(UserService.saveUser(data)).resolves.toEqual(userSaved);
      expect(User.create).toHaveBeenCalledWith(data);
    });
  });
});

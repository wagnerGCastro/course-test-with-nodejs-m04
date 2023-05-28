
import { appError } from '@/utils';
import { StatusCodes } from 'http-status-codes';
import { User } from '@/database/models/user.model';
import { findOrSave, saveUser, listUsers } from './users.service';
import { logger } from '@/utils/logger';

jest.mock('@/database/models/user.model');;
jest.mock('@/utils/logger');




describe('Database > Service > Users', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of users 🟢 listUsers()', async () => {
    const usersList = [ {
      email: 'wagner.castro@test.com',
      id: 111
    } ];

    const users = [ {
      email: 'wagner.castro@test.com',
      id: 111
    } ];

    jest.spyOn(User, 'findAll').mockResolvedValueOnce(usersList);

    const result = await listUsers();

    expect(result).toEqual(users);
    expect(User.findAll).toHaveBeenCalledTimes(1);
    expect(User.findAll).toHaveBeenCalledWith(/* nothing */);
  });

  it('should return with an erro when User.findAll() fails 🔴 listUsers()',  () => {
    const error = appError(
      'Failed to retrieve users',
      StatusCodes.INTERNAL_SERVER_ERROR,
    );

    jest.spyOn(User, 'findAll').mockRejectedValueOnce(error);

    expect(listUsers()).rejects.toEqual(error);
    expect(User.findAll).toHaveBeenCalledTimes(1);
  });

  it('should return a user when findOrSave is executed 🟢 findOrSave()',  async () => {
    const email = "wagner.castro@test.com" ;
    const savedUser = { email, id: 1 };
    const where = { where: { email } };

    jest.spyOn(User, 'findOrCreate').mockResolvedValueOnce(savedUser);


    // expect(findOrSave(email)).resolves.toEqual(savedUser); // error

    expect(await findOrSave(email)).toEqual(savedUser); // error


    expect(User.findOrCreate).toHaveBeenCalledTimes(1);
    expect(User.findOrCreate).toHaveBeenCalledWith(where);

    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenCalledWith(`User located or created with email: ${email}`)
  });

  it('should reject with an error when User.findOrCreate() fails 🔴 findOrSave()',  async () => {
   
    const email = "wagner.castro@test.com" ;

    const error = appError(
      `Failed to retrieve or save user with email: ${email}`,
      StatusCodes.INTERNAL_SERVER_ERROR,
    );
  
    jest.spyOn(User, 'findOrCreate').mockRejectedValueOnce(error);

    expect(findOrSave(email)).rejects.toEqual(error);
    expect(logger.info).not.toHaveBeenCalled();
    expect(appError).toHaveBeenCalledTimes(1);
    expect(appError).toHaveBeenCalledWith(error)

  });
});

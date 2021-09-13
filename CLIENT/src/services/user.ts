import Api from './Api';
import User from '../models/User.model';

export const changeProfile: (data: Partial<User>) => Promise<void> = async (data) => {
  const res = await Api.put(`/users/${data._id}`, data);

  if (res.status !== 200) {
    const error = {
      status: res.status,
      message: 'Erreur',
    };

    return Promise.reject(error);
  }
};

export const changePassword: (data: {
  oldPassword: string;
  newPassword: string;
}) => Promise<void> = async ({ oldPassword, newPassword }) => {
  const res = await Api.post('/users/update-password', {
    oldPassword,
    newPassword,
  });

  if (res.status !== 200) {
    const error = {
      status: res.status,
      ...res.data,
    };

    return Promise.reject(error);
  }
};

export default changeProfile;

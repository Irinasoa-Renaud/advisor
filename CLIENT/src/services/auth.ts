import Axios from 'axios';
import Api from './Api';

export const register: (data: {
  phoneNumber: string;
  name: {
    first: string;
    last: string;
  };
  email: string;
  password: string;
}) => Promise<any> = async (data) => {
  try {
    const reponse = await Axios(
      `${process.env.REACT_APP_API_URL}/users/register`,
      {
        method: 'POST',
        data,
      },
    );
    if (reponse.status === 200) {
      return reponse.data;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

export const resendConfirmationCode: (token: string) => Promise<any> = async (
  token,
) => {
  try {
    const response = await Api.post('/users/resend-confirmation-code', {
      token,
    });
    if (response.status === 200) {
      return response.data;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const confirm_account: (data: {}) => Promise<any> = async (data) => {
  try {
    const reponse = await Axios(
      `${process.env.REACT_APP_API_URL}/users/confirm-account`,
      {
        method: 'POST',
        data: data,
      },
    );
    if (reponse.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

export const reset_password: (data: {}) => Promise<any> = async (data) => {
  try {
    const reponse = await Axios(
      `${process.env.REACT_APP_API_URL}/users/reset-password`,
      {
        method: 'POST',
        data: data,
      },
    );
    if (reponse.status === 200) {
      return reponse;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

export const confirm_reset_password: (data: {}) => Promise<any> = async (
  data,
) => {
  try {
    const reponse = await Axios(
      `${process.env.REACT_APP_API_URL}/users/confirm-reset-password`,
      {
        method: 'POST',
        data: data,
      },
    );
    if (reponse.status === 200) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return false;
  }
};

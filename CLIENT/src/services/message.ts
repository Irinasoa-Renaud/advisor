import Api from './Api';

export const sendMessage: (data: {
  name: string;
  email: string;
  phoneNumber: string;
  message: string;
  target?: string;
}) => Promise<any> = async (data) => {
  const { status, data: result } = await Api.post('/messages', data);

  if (status !== 200) return Promise.reject(result);

  return result;
};

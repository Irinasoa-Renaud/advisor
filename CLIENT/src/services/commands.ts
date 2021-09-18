import Api from './Api';
import Command, { Customer } from '../models/Command.model';

export const commands: (
  command: Command,
  confirmationCode?: string
) => Promise<Command> = async (data) => {
  const res = await Api.post<Command>('/commands', data);
  return res.data;
};

export const getCommandById: (
  id: string,
) => Promise<Command> = (id) => Api.get<Command>(`/commands/${id}`).then(({ data }) => data);

export const getCommandsOfUser: (params: {
  relatedUser?: string;
  commandType?: string;
  limit?: number;
  offset?: number;
}) => Promise<Command[]> = ({ relatedUser, commandType, limit, offset }) =>
    Api.get(
      `/commands?filter=${JSON.stringify({ relatedUser, commandType })}${limit ? '&limit=' + limit : ''
      }${offset ? '&offset=' + offset : ''}`
    ).then(({ data }) => data);

export const sendCode: (data: {
  commandType: string;
  relatedUser?: string;
  customer?: Customer;
}) => Promise<void> = async ({ commandType, relatedUser, customer }) => {
  await Api.post('/commands/sendCode', {
    commandType,
    relatedUser,
    customer,
  });
};

export const confirmCode: (code: string) => Promise<void> = async (code) =>
  await Api.post(`/commands/confirmCode`, { code });

export default commands;

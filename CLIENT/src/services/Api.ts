import Axios from 'axios';

const Api = Axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {},
});

export default Api;

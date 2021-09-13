import Api from './Api';
import Blog from '../models/Blog.model';

export const getBlogs: () => Promise<Blog[]> = () =>
  Api.get<Blog[]>(`/posts`).then(({ status, data }) =>
    status === 200 ? data : Promise.reject(data),
  );
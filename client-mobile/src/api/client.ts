import axios from 'axios';

import { notifyUnauthorized } from '../auth/authEvents';

export const apiClient = axios.create({
  timeout: 15_000,
});

apiClient.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error?.response?.status === 401) {
      notifyUnauthorized();
    }
    return Promise.reject(error);
  }
);


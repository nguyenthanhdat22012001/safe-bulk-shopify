import { AxiosError, type AxiosResponse, type CreateAxiosDefaults, default as instance } from "axios";

const axiosConfig: CreateAxiosDefaults = {
  baseURL: import.meta.env.VITE_ROOT_API?.trim() || "",
  timeout: 60 * 1000,
};

const axiosService = instance.create(axiosConfig);

axiosService.interceptors.request.use(async function (config) {
  config.headers.Authorization = `Bearer ${await shopify.idToken()}`;
  // required when ngrok returns Error 6024 (dev only)
  if (import.meta.env.DEV) {
    config.headers['ngrok-skip-browser-warning'] = '1';
  }

  return config;
});

const onResponse = (response: AxiosResponse) => {
  return response;
};

const onResponseError = (error: AxiosError) => {
  return Promise.reject(error);
};

axiosService.interceptors.response.use(onResponse, onResponseError);

export default axiosService;

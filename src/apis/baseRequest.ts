import axios from 'axios';
// import { STORAGE_KEY, getDataStorage } from 'utils/storage';
import environmentConfig from './environmentConfig';
import responseStatus from './responseStatus';

export interface ICallProps {
  uri?: string;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE' | 'PATCH';
  bodyParameters?: any;
  hasToken?: boolean;
  token?: string;
  isFormUpload?: boolean;
  configRequest?: object;
}

export async function call({
  bodyParameters,
  configRequest,
  hasToken,
  isFormUpload = false,
  method = 'GET',
  token,
  uri,
}: ICallProps) {
  const url = `${environmentConfig.API_ENVIRONMENT_URL}${uri}`;
  try {
    let auth_token;
    if (hasToken) {
      auth_token =  localStorage.getItem("key");
      // auth_token =  "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbiIsImF1dGgiOiJST0xFX0FETUlOLFJPTEVfVVNFUiIsImV4cCI6MTY5MjE1OTI2M30.CptU8dLbXhx1uvg6UO5UVBVIEwRxNekY9erqyAtzSRx7Dpnakrr7q7VkqtsT_SDzola_oqAjeIJ2PvgTZXpX0w";
      // auth_token = getDataStorage(STORAGE_KEY.ACCESS_TOKEN);
    }
    if (token) {
      auth_token = token;
    }
    let headers = !hasToken
      ? { 'Content-Type': 'application/json;charset=UTF-8' }
      : {
          'Content-Type': 'application/json;charset=UTF-8',
          Authorization: `Bearer ${auth_token}`,
          // 'Cookie': Cookies.get('sess'),
        };

    if (isFormUpload) {
      headers = !hasToken
        ? { 'Content-Type': 'multipart/form-data' }
        : {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${auth_token}`,
          };
    }

    let configAxios = {
      url,
      method,
      headers,
      data: bodyParameters,
      timeout: environmentConfig.TIME_OUT,
      // withCredentials: true,
    };
    if (configRequest) configAxios = Object.assign(configAxios, configRequest);

    // axios.defaults.withCredentials = true;
    return new Promise((resolve, reject) => {
      axios(configAxios)
        .then((response) => {
          return resolve(response.data);
        })
        .catch((error) => {
          const res = error.response;
          if (res?.status === 401) {
            localStorage.removeItem('key');
            // setTimeout(() => {
            // 	window.location.reload()
            // }, 1000)
          }
          return handleResponseFail(error, reject);
        });
    });
  } catch (error) {
    console.log('Error :' + error);
  }
}

export interface ICommonResponse<T> {
  status: string;
  data: T;
  code: number;
}

const handleResponseFail = (error: any, reject: any) => {
  const status = error.response ? error.response.status : error.status;
  switch (status) {
    case responseStatus.TOKEN_EXPIRED:
    case responseStatus.NOT_CONNECT:
    case responseStatus.FILE_NOT_FOUND:
    case responseStatus.REQUEST_TIMEOUT:
      return reject(error);
    default:
      return reject(error);
  }
};

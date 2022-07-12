import { AxiosInstance } from 'axios';
import { RSAAObject } from './types';

const network = async (axios: AxiosInstance, obj: RSAAObject) => {
    console.log(obj);
    const { path, method, body, config } = obj;

  if (config) {
    switch (method) {
      case 'GET':
        return await axios.get(path, config);
      case 'POST':
        return await axios.post(path, body, config);
      case 'PUT':
        return await axios.put(path, body, config);
      case 'DELETE':
        return await axios.delete(path, config);
      case 'PATCH':
        return await axios.patch(path, body, config);
    }
  } else {
    switch (method) {
      case 'GET':
        return await axios.get(path);
      case 'POST':
        return await axios.post(path, body);
      case 'PUT':
        return await axios.put(path, body);
      case 'DELETE':
        return await axios.delete(path);
      case 'PATCH':
        return await axios.patch(path, body);
    }
  }
};

export default network;

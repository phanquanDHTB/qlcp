import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'services',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `services/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `services/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `services/${id}` : 'services',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
  });

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'services/' + id,
  hasToken: true,
  method: 'GET',
  });


import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'users',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `users/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `users/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `users/${id}` : 'users',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
  });

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'users/' + id,
  hasToken: true,
  method: 'GET',
  });

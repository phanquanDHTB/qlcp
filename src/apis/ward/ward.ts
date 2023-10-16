import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'wards',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `wards/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `wards/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `wards/${id}` : 'wards',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
  });

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'wards/' + id,
  hasToken: true,
  method: 'GET',
  });



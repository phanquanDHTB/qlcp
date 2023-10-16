import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'hotels',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `hotels/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `hotels/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `hotels/${id}` : 'hotels',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
  });

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'hotels/' + id,
  hasToken: true,
  method: 'GET',
  });


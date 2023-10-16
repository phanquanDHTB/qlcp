import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'airports',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `airports/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `airports/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `airports/${id}` : 'airports',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
});

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'airports/' + id,
  hasToken: true,
  method: 'GET',
});


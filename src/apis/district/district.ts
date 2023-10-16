import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'districts',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `districts/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `districts/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `districts/${id}` : 'districts',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
});

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'districts/' + id,
  hasToken: true,
  method: 'GET',
});

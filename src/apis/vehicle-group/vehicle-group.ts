import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'vehicle-groups',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `vehicle-groups/${id}`,
    hasToken: true,
  });
};

export const deleteRecord = (id) => {
  return call({
    uri: `vehicle-groups/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `vehicle-groups/${id}` : 'vehicle-groups',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
  });

  export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
    uri: 'vehicle-groups/' + id,
    hasToken: true,
    method: 'GET',
  });

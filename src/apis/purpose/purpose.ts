import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'purposes',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `purposes/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `purposes/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `purposes/${id}` : 'purposes',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
  });

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'purposes/' + id,
  hasToken: true,
  method: 'GET',
  });


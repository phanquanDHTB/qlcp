import { call } from '../baseRequest';

export const deleteRecord = (id) => {
    return call({
      uri: `roles/${id}`,
      method: 'DELETE',
      hasToken: true,
    });
  };

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
    uri: id ? `roles/${id}` : 'roles',
    bodyParameters: data,
    hasToken: true,
    method: id ? 'PUT' : 'POST',
});
  
export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
    uri: 'roles/' + id,
    hasToken: true,
    method: 'GET',
});
  
import { call } from '../baseRequest';

export const detail = (idEdit) =>
  call({
    uri: 'living-quotas/' + idEdit,
    hasToken: true,
    method: 'GET',
  });


  export const addOrEditLivingCost = (idEdit, data) => call({
    uri: idEdit ? `living-quotas/${idEdit}` : 'living-quotas',
    bodyParameters: data,
    hasToken: true,
    method: idEdit ? 'PUT' : 'POST',
  })
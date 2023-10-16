import { call } from "../baseRequest";

export const detail = (id) => {
  return call({
    uri: `living-quotas/${id}`,
    method: 'GET',
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `living-quotas/${id}`,
    method: "DELETE",
    hasToken: true,
  });
};


export const addOrEditLiving = (idEdit, data) => call({
  uri: idEdit ? `living-quotas/${idEdit}` : 'living-quotas',
  bodyParameters: data,
  hasToken: true,
  method: idEdit ? 'PUT' : 'POST',
})
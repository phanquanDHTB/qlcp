import { call } from "../baseRequest";

export const detail = (id) => {
  return call({
    uri: `moving-quotas/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `moving-quotas/${id}`,
    method: "DELETE",
    hasToken: true,
  });
};

export const addOrEditmoving = (idEdit, data) => call({
  uri: idEdit ? `moving-quotas/${idEdit}` : 'moving-quotas',
  bodyParameters: data,
  hasToken: true,
  method: idEdit ? 'PUT' : 'POST',
})
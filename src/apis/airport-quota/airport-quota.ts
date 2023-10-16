import { call } from "../baseRequest";

export const detail = (id) => {
  return call({
    uri: `airport-quotas/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `airport-quotas/${id}`,
    method: "DELETE",
    hasToken: true,
  });
}; 

export const getAirPortQuotaRequest = (idEdit: number | null) => call({
  uri: 'airport-quotas/' + idEdit,
  hasToken: true,
  method: 'GET',
})

export const addOrEditAirQuota = (idEdit, data) => call({
  uri: idEdit ? `airport-quotas/${idEdit}` : 'airport-quotas',
  bodyParameters: data,
  hasToken: true,
  method: idEdit ? 'PUT' : 'POST',
})
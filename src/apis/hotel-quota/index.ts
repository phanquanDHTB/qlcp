import { call } from "../baseRequest";

export const detail = (id) => {
  return call({
    uri: `hotel-quotas/${id}`,
    method: 'GET',
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `hotel-quotas/${id}`,
    method: "DELETE",
    hasToken: true,
  });
};

export const addOrEditHotel = (idEdit, data) => call({
  uri: idEdit ? `hotel-quotas/${idEdit}` : 'hotel-quotas',
  bodyParameters: data,
  hasToken: true,
  method: idEdit ? 'PATCH' : 'POST',
})
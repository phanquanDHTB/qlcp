import { call } from "../baseRequest";
export const save = () => {
  return call({
    uri: "areas",
    method: "POST",
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `areas/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `areas/${id}`,
    method: "DELETE",
    hasToken: true,
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `areas/${id}` : 'areas',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
});

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'areas/' + id,
  hasToken: true,
  method: 'GET',
});

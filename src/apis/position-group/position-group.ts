import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'posittion-groups',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `posittion-groups/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `position-groups/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};
export const getPosition = async (callback) => {
  try {
    const res = await call({ uri: 'position-groups', hasToken: true, method: 'GET' });
    callback(res);
  } catch (e) {
    console.log(e);
  }
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `position-groups/${id}` : 'position-groups',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
  });

export const handleGetDetailsForEditRequest = (id: number|null|undefined) => call({
  uri: 'position-groups/' + id,
  hasToken: true,
  method: 'GET',
  });

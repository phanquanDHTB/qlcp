import getMessageError from '@utils/getMessageError';
import { call } from '@apis/baseRequest';
import { FieldValues } from 'react-hook-form';
import { toast } from 'react-toastify';

export const getPlanUserRequest = (uri) => {
  return call({
    uri: uri,
    hasToken: true,
    method: 'GET',
  })
}

export const deleteUserRequest = (v) => {
  return call({
    uri: 'plan-users/' + v,
    method: 'DELETE',
    hasToken: true,
  })
}

export const addOrEditPlanUser = async (
  data: FieldValues,
  isAdd: boolean,
  idEdit?: number | null,
  callbackLoading?: (loading: boolean) => void,
  callbackSuccess?: () => void
) => {
  const listPerson = [...data.listPerson];
  const listPartner = [...data.listPartner];

  listPerson?.map((i: any) => {
    i.type = 1;
    if (isAdd) {
      i.plan = { id: idEdit };
      delete i.id;
    }
    return i;
  });

  listPartner?.map((i: any) => {
    i.plan = { id: idEdit };
    i.position_group = i.position_group?.id ? { id: i.position_group?.id } : null;
    i.type = 2;
    if (isAdd) {
      i.plan = { id: idEdit };
      delete i.id;
    }
    return i;
  });
  try {
    if (listPerson.length === 0 && listPartner.length === 0) {
      toast('Vui lòng chọn cán bộ đi công tác', { type: 'error' });
    } else {
      callbackLoading && callbackLoading(true);
      (await call({
        uri: !isAdd ? 'plan-users/updates/' + idEdit : 'plan-users/saves',
        hasToken: true,
        method: !isAdd ? 'PUT' : 'POST',
        bodyParameters: [...listPerson, ...listPartner],
      })) as any;
      callbackSuccess && callbackSuccess();
    }
  } catch (e) {
    toast(getMessageError(e), { type: 'error' });
  } finally {
    callbackLoading && callbackLoading(false);
  }
};

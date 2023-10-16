import getMessageError from '@utils/getMessageError';
import { call } from '@apis/baseRequest';
import { toast } from 'react-toastify';
import { IPlan } from 'type';
import { FieldValues } from 'react-hook-form';
import dayjs from 'dayjs';
import { ISelect } from '@pages/business/plan/infor-modal';

export const getPlan = async (idEdit: number|undefined|null, callback: (res: IPlan) => void) => {
  try {
    const res = (await call({ uri: 'plans/' + idEdit, hasToken: true, method: 'GET' })) as IPlan;
    callback(res);
  } catch (e) {
    toast(getMessageError(e), { type: 'error' });
  }
};

export const addOrEditPlan = async (
  value: FieldValues,
  callback: (id: number, idParent: number | null, departmentProcess: ISelect, type: number) => void,
  callbackLoading: (loading: boolean) => void,
  idEdit,
  additionalPlan,
  watchValue: any,
  department
) => {
  try {
    callbackLoading(true);
    const data: IPlan = {
      code: value.code || null,
      description: value.description,
      id: idEdit as number | undefined,
      name: value.name,
      start_time: dayjs(value.start_time).toISOString(),
      end_time: dayjs(value.end_time).toISOString(),
      is_add: additionalPlan,
      note: value.note,
      ins_date: value.ins_date,
      ins_id: value.ins_id,
      upd_date: value.upd_date,
      upd_id: value.upd_id,
      type: value.type,
      department_process: value.department_process,
      department_require: value.department_require.id ? value.department_require : null,
      purpose: value.purpose,
      user_process: value.user_process,
      user_require: value.user_require.id ? value.user_require : null,
      status: value.status,
    };
    if (additionalPlan) {
      data.parent = value.parent;
    }
    const res = (await call({
      uri: idEdit ? `plans/${idEdit}` : 'plans',
      bodyParameters: data,
      hasToken: true,
      method: idEdit ? 'PUT' : 'POST',
    })) as any;

    if (callback) {
      callback(res.id, watchValue, res.department_process, res.type);
    }
  } catch (e) {
    toast(getMessageError(e), { type: 'error' });
  } finally {
    callbackLoading(false);
  }
};

export const getInforUserRequest = () =>
  call({
    uri: `info`,
    method: 'GET',
    hasToken: true,
  });

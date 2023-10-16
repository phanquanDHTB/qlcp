import { IDepartment, IPlan, IPlanCost, IUser, IplanRequiredUser } from 'type';
import FileSaver from 'file-saver';
import { call } from '../../../../apis/baseRequest';
import dayjs, { Dayjs } from 'dayjs';
import { pdfSignPosition } from '../../../../constants/enumConmon';

interface ISendData {
  amount?: number;
  approve_date?: string | dayjs.Dayjs | null;
  code?: string;
  department_process?: IDepartment;
  department_require?: IDepartment;
  total_estimated_amount?: number;
  description?: string;
  end_time?: string | dayjs.Dayjs;
  expired_time?: string;
  id?: number;
  ins_date?: string | dayjs.Dayjs;
  ins_id?: number;
  is_active?: boolean;
  name?: string;
  payment_name?: string;
  plan?: IPlan;
  plan_required_user?: IplanRequiredUser;
  plan_base?: string;
  plan_cost?: IPlanCost[];
  reason?: string;
  start_time?: string | dayjs.Dayjs;
  status?: number;
  type?: number;
  upd_date?: string | dayjs.Dayjs;
  upd_id?: number;
  user_require?: IUser;
}

export const UpdateAdvanceRequestApi = (bodyData: ISendData, idDetails: number | null) =>
  call({
    uri: 'plan-requireds/' + idDetails,
    hasToken: true,
    bodyParameters: bodyData,
    method: 'PUT',
  });

export const AddAdvanceRequestApi = (bodyData: ISendData) =>
  call({
    uri: 'plan-requireds',
    hasToken: true,
    bodyParameters: bodyData,
    method: 'POST',
  });

export const DownloadAdvanceRequestFile = async (idDetails: number | null) => {
  const res = (await call({
    uri: `export-pdf/advance-request-plan/${idDetails}`,
    method: 'GET',
    hasToken: true,
    configRequest: {
      responseType: 'blob',
    },
  })) as any;
  const formData = new FormData();
  formData.append('file', res, 'DE_NGHI_TAM_UNG.pdf');
  const dataInfor = (await call({
    uri: `files/upload-voffice?position=${pdfSignPosition.DE_NGHI_TAM_UNG}`,
    method: 'POST',
    hasToken: true,
    isFormUpload: true,
    bodyParameters: formData,
  })) as any;
  const res1 = await call({
    uri: `files/${dataInfor.file_id}/download`,
    method: 'GET',
    hasToken: true,
    configRequest: {
      responseType: 'blob',
    },
  });
  FileSaver.saveAs(new Blob([res]), dataInfor.file_name);
};

export const handleGetUserInfo = async () =>
  call({
    uri: `info`,
    method: 'GET',
    hasToken: true,
  });

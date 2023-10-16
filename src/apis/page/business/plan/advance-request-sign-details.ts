import { toast } from 'react-toastify';
import FileSaver from 'file-saver';
import getMessageError from '@utils/getMessageError';
import { call } from '../../../../apis/baseRequest';
import { IFilesList } from 'type/sign-interface';
import { pdfSignPosition } from '../../../../constants/enumConmon';

export const downloadFile = async (data: IFilesList) => {
  try {
    const res = (await call({
      uri: `files/${data.file_id}/download`,
      method: 'GET',
      hasToken: true,
      configRequest: {
        responseType: 'blob',
      },
    })) as any;
    FileSaver.saveAs(new Blob([res]), data.file_name);
  } catch (e) {
    toast(getMessageError(e), { type: 'error' });
  }
};

export const getDocumentsApi = async (idDetails: number | null) =>
  call({
    uri: 'documents?planId=' + idDetails + '&type.in=1',
    hasToken: true,
    method: 'GET',
  });

export const downloadFileSign = async (idDetails: number | null) => {
  try {
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
    })) as IFilesList;
    const res1 = (await call({
      uri: `files/${dataInfor.file_id}/download`,
      method: 'GET',
      hasToken: true,
      configRequest: {
        responseType: 'blob',
      },
    })) as IFilesList;
    FileSaver.saveAs(new Blob([res]), dataInfor.file_name);
  } catch (error) {
    console.log(error);
  }
};

export const handleGetUserInfo = async () =>
  call({
    uri: `info`,
    method: 'GET',
    hasToken: true,
  });

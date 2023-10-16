import constant from '../../constants/Constants';

import { call } from '../baseRequest';

export const save = () => {
  return call({
    uri: 'transfer-requests',
    method: 'POST',
    hasToken: true,
  });
};

export const detail = (id) => {
  return call({
    uri: `transfer-requests/${id}`,
    hasToken: true,
  });
};
export const deleteRecord = (id) => {
  return call({
    uri: `transfer-requests/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const handleGetTradeRequest = (id: number|null|undefined, params) => {
  return call({
    uri: `summary-requests/${id}`,
    hasToken: true,
    configRequest: {
      params,
    },
  });
};

export const handleAddOrEditRequest = (id: number|null|undefined, data: any) => call({
  uri: id ? `transfer-requests/${id}` : 'transfer-requests',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
});

export const handleResUpdateItem = (p, payloadItem) => call({
  uri: `${
    p?.type == constant.summaryRequestType.DE_NGHI_CHI ? 'payment-requests' : 'plan-requireds'
  }/cancel`,
  method: 'PUT',
  hasToken: true,
  bodyParameters: payloadItem,
});

export const handleGetDoctype = () => {
  return call({
    uri: 'voffice/docTypes?docType=true',
    method: 'GET',
    hasToken: true,
  });
};

export const handleGetDomain = () => {
  return call({
    uri: 'voffice/domains?domain=true',
    method: 'GET',
    hasToken: true,
  });
};

export const getFile = async (urlGet: string, urlUpload: string, callback: any, name: string) => {
  try {
    const res = (await call({
      uri: urlGet,
      method: 'GET',
      hasToken: true,
      configRequest: {
        responseType: 'blob',
      },
    })) as any;
    const formData = new FormData();
    formData.append('file', res, name);
    const dataInfor = await call({
      uri: urlUpload,
      method: 'POST',
      hasToken: true,
      isFormUpload: true,
      bodyParameters: formData,
    });
    callback(dataInfor);
  } catch (err) {
    console.log(err);
  }
};

export const handleDownloadFiles = (record) => {
  return call({
    uri: `files/${record.file_id}/download`,
    method: 'GET',
    hasToken: true,
    configRequest: {
      responseType: 'blob',
    },
  });
};

export const handleLoginVoffice = (data) => {
  return call({
    uri: 'voffice/login',
    method: 'POST',
    hasToken: true,
    bodyParameters: data,
  });
 }

 export const handleSendVoffice = (data) => {
  return call({
    uri: 'voffice/send',
    method: 'POST',
    hasToken: true,
    bodyParameters: data,
  });
 }

 export const handleResUpdate = (data) => {
  return call({
    uri: 'transfer-requests/update-status',
    method: 'PUT',
    hasToken: true,
    bodyParameters: data,
  });
 }

 export const handleGetSign = (id) => {
  return call({
    uri: `documents?transferRequestId=${id}&type.in=3`,
    method: 'GET',
    hasToken: true,
  });
 }

 export const handleExportExcelRequest = (entity, payload) => call({
    method: 'GET',
    uri: entity + `/export`,
    hasToken: true,
    configRequest: {
      params: payload,
      responseType: 'blob',
    },
  })
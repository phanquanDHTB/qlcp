import { call } from '@apis/baseRequest';
import { Invoices } from 'type/invoicesType';


interface contentData {
  content: Invoices[] | undefined;
}

export const handleAdd = (data: any) => call({
  uri: 'vehicles',
  bodyParameters: data,
  hasToken: true,
  method: 'POST',
});

export const getInvoices = (idDetails: number | null | undefined) =>
  call({
    uri: 'invoices?planId=' + idDetails,
    hasToken: true,
    method: 'GET',
  });

export const getInvoicesDetall = (id: number | null | undefined) =>
  call({
    uri: 'invoices/' + id,
    hasToken: true,
    method: 'GET',
  });

export const getCode = (idDetails: number | null | undefined) =>
  call({
    uri: 'plan-requireds?planId=' + idDetails,
    hasToken: true,
    method: 'GET',
  });

export const getFillInfoProvider = (textSearch: any) => {
  const data = {
    BP_GET_LISTS: [
      {
        SEQ: '1',
        VAT_REGISTRATION_NO: textSearch,
      },
    ],
  };
  return call({
    uri: 'invoices/tax-derpatment',
    hasToken: true,
    method: 'POST',
    bodyParameters: data,
  });
};

export const uploadFile = (fmData: any) => call({
  uri: 'files/upload',
  isFormUpload: true,
  hasToken: true,
  bodyParameters: fmData,
  method: 'POST',
});

export const uploadFileXML = (fmData: any) => call({
  uri: 'files/upload',
  isFormUpload: true,
  hasToken: true,
  bodyParameters: fmData,
  method: 'POST',
});

export const dowloadFile = (id: number | null | undefined) => call({
  uri: `files/` + id + `/download`,
  hasToken: true,
  method: 'GET',
  configRequest: {
    responseType: 'blob',
  },
});
export const handleAddOrEditRequest = (id: number | null | undefined, data: any) => call({
  uri: id ? `invoices/${id}` : 'invoices',
  bodyParameters: data,
  hasToken: true,
  method: id ? 'PUT' : 'POST',
});
export const handleAddOrRequest = (data: any) => call({
  uri: 'invoices',
  bodyParameters: data,
  hasToken: true,
  method: 'POST',
});

export const deleteRecord = (id) => {
  return call({
    uri: `invoices/${id}`,
    method: 'DELETE',
    hasToken: true,
  });
};

export const getInforUserRequest = () => {
  return call({
    uri: `info`,
    method: 'GET',
    hasToken: true,
  });
};

export const getPlan = (idDetails: number | null) => call({
  uri: "plans/" + idDetails,
  hasToken: true,
  method: "GET" 
})


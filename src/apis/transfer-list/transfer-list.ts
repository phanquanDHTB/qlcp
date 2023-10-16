import { call } from "../baseRequest";

export const handleAccountingTransferRequest = (data) => {
    return call({
        uri: 'transfer-requests',
        bodyParameters: data,
        hasToken: true,
        method: 'POST',
    });
  };

  export const handleGetSummaryRequest = (params) => {
    return call({
        uri: `summary-requests`,
        hasToken: true,
        configRequest: {
          params,
        },
    });
  };
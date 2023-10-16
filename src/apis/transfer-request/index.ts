import { call } from "../baseRequest";

export const accountingTransferRequest = (id) => {
  return call({
    uri: `sap/accounting-transfer-request/${id}`,
    method: "PUT",
    hasToken: true,
  });
};

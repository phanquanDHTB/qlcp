import { call } from "../../../apis/baseRequest";

export const refundRequest = (id: number) => call({
    uri: 'payment-requests/update-refunded/' + id,
    method: 'PUT',
    hasToken: true
})

export const accountingRequest = (id: number) => call({
    uri: 'sap/refunded-plan/' + id,
    method: 'PUT',
    hasToken: true
})
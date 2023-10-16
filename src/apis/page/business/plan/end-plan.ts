import { call } from "@apis/baseRequest";

export const getDomainRequest = () => call({
    uri: 'voffice/domains?domain=true',
    method: 'GET',
    hasToken: true,
})

export const getFileRequest = (urlGet) => call({
    uri: urlGet,
    method: 'GET',
    hasToken: true,
    configRequest: {
        responseType: "blob",
    }
})

export const getDoctypeRequest = () => call({
    uri: 'voffice/docTypes?docType=true',
    method: 'GET',
    hasToken: true,
})

export const uploadFileRequest = (urlUpload, formData) => call({
    uri: urlUpload,
    method: 'POST',
    hasToken: true,
    isFormUpload: true,
    bodyParameters: formData
})
export const signRequestBudget = (formData) => call({
    uri: 'voffice/budget',
    method: 'POST',
    hasToken: true,
    bodyParameters: formData
})

export const addSignRequest = (formData) => call({
    uri: 'voffice/send',
    method: 'POST',
    hasToken: true,
    bodyParameters: formData
})

export const loginVOfficeRequest = (formData) => call({
    uri: 'voffice/login',
    method: 'POST',
    hasToken: true,
    bodyParameters: formData
})

export const addOrEditPaymentRequest = (idPayment, params) => call({
    uri: idPayment ? 'payment-requests/' + idPayment : 'payment-requests',
    method: idPayment ? 'PUT' : 'POST',
    hasToken: true,
    bodyParameters: params
})

export const getPayment = (endPlan, money) => call({
    uri: 'payment-requests?planId=' + endPlan + '&type.in=' + money,
    method: 'GET',
    hasToken: true
})

export const getsignRequest = (endPlanId) => call({
    uri: `documents?planId=${endPlanId}&type.in=2`,
    method: 'GET',
    hasToken: true
})

export const signRequest = (data, endPlan) => call({
    uri: data.id ? 'plan-reports/' + data.id : 'plan-reports',
    method: data.id ? 'PUT' : 'POST',
    bodyParameters: {
        content: data.content,
        propose: data.propose,
        result: data.result,
        id: data.id,
        plan: endPlan
    },
    hasToken: true
})

export const getPlanReportRequest = (endPlan) => call({
    uri: "plan-reports?planId=" + endPlan.id,
    hasToken: true,
    method: "GET",
})

export const getPlanRequiredRequest = (endPlan) => call({
    uri: "plan-requireds?planId=" + endPlan.id,
    hasToken: true,
    method: "GET",
})

export const getInvoice = (endPlan, page) => call({
    uri: "invoices",
    hasToken: true,
    method: "GET",
    configRequest: {
        params: {
            planId: endPlan.id,
            pageSize: 50,
            pageIndex: page
        }
    }
})

export const getPlanQuotasRequest = (endPlan) => call({
    uri: "plan-cost-quotas/plan/" + endPlan.id,
    hasToken: true,
    method: "GET",
})

export const downloadFileRequest = (id) => {
    return call({
        uri: `files/${id}/download`,
        method: 'GET',
        hasToken: true,
        configRequest: {
            responseType: 'blob',
        },
    })
}

export const getFileRemakeRequest = (id) => {
    return call({
        uri: 'export-pdf/advance-request-remake',
        method: 'GET',
        hasToken: true,
        configRequest: {
            responseType: 'blob',
            params: {
                planId: id,
            },
        },
    })
}

export const getFileVOWithPosition = (formData) => {
    return call({
        uri: 'files/upload-voffice?position=11',
        method: 'POST',
        hasToken: true,
        isFormUpload: true,
        bodyParameters: formData,
    })
}
import { call } from "@apis/baseRequest";

export const downloadFile = (file) => call({
    uri: `files/` + file + `/download`,
    hasToken: true,
    method: "GET",
    configRequest: {
        responseType: "blob",
    }
})

export const getListPlanRouteRequest = (idDetails) => call({
    uri: "plan-routes",
    hasToken: true,
    configRequest: {
        params: { planId: idDetails },
    },
})

export const getPlanRequest = (idDetails) => call({
    uri: "plans/" + idDetails,
    hasToken: true,
    method: "GET",
})

export const getInforRequestConfirmRequest = (id) => call({
    uri: "plan-confirms/" + id,
    hasToken: true,
    method: "GET",
})

export const changeInforConfirmRequest = (bodyData) => call({
    uri: "plan-confirms/" + bodyData.id,
    hasToken: true,
    bodyParameters: bodyData,
    method: "PUT",
});

export const addConfirm = (data) => call({
    uri: 'plan-confirms',
    hasToken: true,
    method: 'POST',
    bodyParameters: data,
  })
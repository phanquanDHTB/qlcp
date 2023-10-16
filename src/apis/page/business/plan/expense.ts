import { call } from "@apis/baseRequest";

export const getPlanRoute = (idEdit) => call({
    uri: "plan-routes?planId=" + idEdit,
    hasToken: true,
    method: "GET",
})

export const getCostExpense = (idEdit: any) => call({
    uri: "plan-costs/estimate/" + idEdit,
    hasToken: true,
    method: "GET",
})

export const getCostByService = (service, user) => call({
    uri: `policy-limits/amount?serviceId=${service}&userId=${user}`,
    hasToken: true,
    method: "GET",
})

export const addCost = (formData) => call({
    uri: "plan-costs",
    hasToken: true,
    method: "POST",
    bodyParameters: formData,
})
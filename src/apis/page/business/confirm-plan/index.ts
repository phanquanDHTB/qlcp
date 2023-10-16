import { call } from "@apis/baseRequest";

export const getFileRequest = (file) => call({
    uri: `files/` + file + `/download`,
    hasToken: true,
    method: "GET",
    configRequest: {
        responseType: "blob",
    }
})

export const getDataEditRequest = (id) => call({
    uri: `plan-confirms/${id}`,
    hasToken: true,
})

export const updateStatusRequest = (dataEdit, status) => call({
    uri: "plan-confirms/update-status",
    method: "PUT",
    hasToken: true,
    bodyParameters: {
        plan_route_id: dataEdit.plan_route.id,
        status: status,
        plan_confirm_id: dataEdit.id,
    },
})
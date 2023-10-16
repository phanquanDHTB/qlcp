import { call } from "../../../../apis/baseRequest";

export const getListRouteUser = (idEdit) => call({
    uri: "plan-users?planId=" + idEdit,
    hasToken: true,
    method: "GET",
});

export const getListRoutePlanRequest = (idEdit) => call({
    uri: "plan-routes?planId=" + idEdit,
    hasToken: true,
    method: "GET",
})

export const addOrEditRouteRequest = (indexSelect, formData) => call({
    uri: indexSelect ? "plan-routes/" + indexSelect : "plan-routes",
    hasToken: true,
    method: indexSelect ? "PUT" : "POST",
    bodyParameters: formData,
})

export const deleteRouteRequest = (id: number) => {
    return call({
        uri: 'plan-routes/' + id,
        hasToken: true,
        method: 'DELETE',
    })
}

export const getDistantRequest = (fromProvinceId, toProvinceId, fromDistrictId, toDistrictId,) => {
    return call({
        uri: 'distance-quotas/distance',
        hasToken: true,
        method: 'GET',
        configRequest: {
            params: {
                fromProvinceId,
                toProvinceId,
                fromDistrictId,
                toDistrictId,
            },
        },
    })
}
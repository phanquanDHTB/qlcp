import { call } from "../../apis/baseRequest"

export const fetchDataRequest = (url: string, params: any) => {
    return call({
        uri: `${url}`,
        hasToken: true,
        configRequest: {
            params,
        },
    })
}

export const deleteRequest = (uriFetch, value) => {
    return call({
        uri: uriFetch + '/' + value,
        hasToken: true,
        method: 'DELETE',
    })
}
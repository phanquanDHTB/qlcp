import { call } from "../../apis/baseRequest"

export const fetchSearchRequest = (uri, uriSearch, debounceSearch) => {
    return call({
        uri: uri + `&${uriSearch}` + debounceSearch,
        hasToken: true,
        method: 'GET',
        configRequest: {
            params: {
                pageIndex: 0,
                pageSize: 200,
            },
        },
    })
}

export const fetchWithNewUriRequest = (uri) => {
    return call({
        uri: uri,
        hasToken: true,
        method: 'GET',
        configRequest: {
            params: {
                pageIndex: 0,
                pageSize: 20,
            },
        },
    })
}

export const getListOptionRequest = (uri, page) => {
    return call({
        uri,
        hasToken: true,
        method: 'GET',
        configRequest: {
            params: {
                pageIndex: page,
                pageSize: 20,
            },
        },
    })
}
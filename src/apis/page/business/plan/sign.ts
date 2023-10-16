import { call } from "../../../../apis/baseRequest";
import { IData } from "type/sign-interface";

export const handleSendSignRequest = (bodyData: IData) => call({
    uri: "voffice/send",
    method: "POST",
    hasToken: true,
    bodyParameters: bodyData,
})

export const handleLoginSignRequest = (bodyData: IData) => call({
    uri: "voffice/login",
    method: "POST",
    hasToken: true,
    bodyParameters: bodyData,
})

export const handleDownloadFileRequest = (record: any) => call({
    uri: `files/${record.file_id}/download`,
    method: "GET",
    hasToken: true,
    configRequest: {
      responseType: "blob",
    },
})

export const handleGetDocTypeRequest = () => call({
    uri: "voffice/docTypes?docType=true",
    method: "GET",
    hasToken: true,
})

export const handleGetDomainRequest = () => call({
    uri: "voffice/domains?domain=true",
    method: "GET",
    hasToken: true,
})


import { call } from "@apis/baseRequest";

export const getFile = async (
    urlGet: string,
    urlUpload: string,
    callback : (data: any) => void,
    name?: string
  ) => {
    try {
      const res = (await call({
        uri: urlGet,
        method: "GET",
        hasToken: true,
        configRequest: {
          responseType: "blob",
        },
      })) as any;
      const formData = new FormData();
      formData.append("file", res, name);
      const dataInfor = await call({
        uri: urlUpload,
        method: "POST",
        hasToken: true,
        isFormUpload: true,
        bodyParameters: formData,
      });
      callback(dataInfor);
    } catch (err) {
      console.log(err);
    }
  };
import { Modal, message } from 'antd';
import { AxiosError } from 'axios';

interface errorProps {
  e: Error | AxiosError | any;
  type?: 'modal' | 'message';
}
export const requestCatchHook = (error: errorProps) => {
  const data = error.e?.response?.data;
  const type = error.type ? error.type : 'message';
  let errMessage;
  switch (error?.e?.status) {
    case 400:
      errMessage = `${data.title}`;
      break;
    case 403:
      errMessage = 'Không có quyền truy cập';
      break;
    case 404:
      errMessage = 'Network request error, the resource was not found!';
      break;
    case 500:
      errMessage = 'Lỗi máy chủ, vui lòng liên hệ với quản trị viên!';
      break;
    default:
      errMessage = `${data?.title}` || '';
      break;
  }

  if (data) {
    if (type == 'modal') {
      Modal.error({
        title: 'Lỗi',
        content: errMessage,
      });
      return;
    } else {
      if (Array.isArray(data.fieldErrors)) {
        message.error(data.fieldErrors.map((p: any) => p.message).join('\n'));
      } else {
        message.error(data.message || data.title);
      }
      return;
    }
  }
  if (type == 'modal') {
    Modal.error({
      title: 'Lỗi',
      content: errMessage,
    });
  } else {
    message.error(errMessage || 'lỗi hệ thống');
  }
};

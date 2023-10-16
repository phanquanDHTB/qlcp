import { call } from '../baseRequest';

export const getUriWebBooking = (params?: any) => {
  return call({
    uri: 'airlines/getLandingPage',
    method: 'POST',
    hasToken: true,
    bodyParameters: { merchant: 'VTBay', ...params },
    // configRequest: {
    //   params: { merchant: "VTBay", ...params },
    // },
  });
};

export const getBookings = (params) => {
  return call({
    uri: 'bookings/list',
    hasToken: true,
    configRequest: {
      params: params,
    },
  });
};

import { call } from "../baseRequest";

export const handleGetPlanRoutesRequest = (id) => call({
    uri: `plan-routes?pageSize=999&pageIndex=${0}&planId=${id}&isAirTicket=true`,
    hasToken: true,
    method: 'GET',
  })
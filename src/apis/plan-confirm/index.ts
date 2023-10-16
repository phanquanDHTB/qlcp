import { call } from "../baseRequest";

export const getAllPlanRouteUserByPlanRoute = (id) => {
  return call({
    uri: `plan-routes/list-user/${id}`,
    hasToken: true,
  });
};


export const getPlanConfirm = (record) => call({
  uri: `plan-confirms/list?planRouteId=${record.id}`,
  hasToken: true,
  method: "GET",
})
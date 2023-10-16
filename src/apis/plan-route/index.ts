import { call } from "../baseRequest";

export const getAllPlanRoute = (params) => {
  return call({
    uri: "plan-routes",
    hasToken: true,
    configRequest: {
      params: params,
    },
  });
};

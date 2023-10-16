import { call } from "../baseRequest";

export const getAllPlanUser = (params) => {
  return call({
    uri: "plan-route-users/air-ticket"+`/${params?.plan_route_id}`,
    hasToken: true,
  });
};

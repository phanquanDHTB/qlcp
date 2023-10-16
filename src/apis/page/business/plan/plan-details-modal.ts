import { call } from "../../../../apis/baseRequest";

export const getPlanApi = (idDetails: number | null) => call({
     uri: "plans/" + idDetails,
     hasToken: true,
     method: "GET" 
})


export const getPlanRequiredApi = async (idDetails: number|null) =>  call({
     uri: "plan-requireds?planId=" + idDetails,
     hasToken: true,
     method: "GET" 
}); 


export const getRouteApi = async (idDetails: number | null) => call({
     uri: "plan-routes?planId="  + idDetails,
     hasToken: true,
     method: "GET" });


export const getCostRequestApi = async (idDetails: number | null) => call({
     uri: "plan-costs/plan/"  + idDetails,
     hasToken: true,
     method: "GET" });


export const getInforPlanApi = async (idDetails: number | null) => call({
     uri: "plans/Info/" + idDetails,
     hasToken: true,
     method: "GET"})

     
export const getStaffApi = async (idDetails: number | null) => call({
     uri: "plan-users?planId=" + idDetails,
     hasToken: true, 
     method: "GET" })

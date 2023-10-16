import { RouteItemType } from "./type";
import loadable from "@loadable/component";
const AirportPage = loadable(() => import("@pages/quota/airport"));
const HotelPage = loadable(() => import("@pages/quota/hotel"));
const LivingPage = loadable(() => import("@pages/quota/living"));
const MovingPage = loadable(() => import("@pages/quota/moving"));
const LivingCostPage = loadable(() => import("@pages/quota/living-cost"));

export const quotaRoute: RouteItemType[] = [
  {
    path: "/quota/airport",
    label: "Định mức taxi sân bay",
    element: AirportPage,
    show: false,
  },
  {
    path: "/quota/hotel",
    label: "Định mức phòng nghỉ",
    element: HotelPage,
    show: false,
  },
  {
    path: "/quota/living",
    label: "Định mức phụ cấp lưu trú",
    element: LivingPage,
    show: false,
  },
  {
    path: "/quota/moving",
    label: "Định mức chi phí di chuyển",
    element: MovingPage,
    show: false,
  },
  {
    path: "/quota/living-cost",
    label: "Định mức sinh hoạt phí",
    element: LivingCostPage,
    show: false,
  },
];
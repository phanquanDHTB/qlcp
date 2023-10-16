import { CalculatorOutlined } from "@ant-design/icons";
import loadable from "@loadable/component";
import { RouteItemType } from "./type";
const AirportPage = loadable(() => import("@pages/quota/airport"));
const HotelPage = loadable(() => import("@pages/quota/hotel"));
const LivingPage = loadable(() => import("@pages/quota/living"));
const MovingPage = loadable(() => import("@pages/quota/moving"));
const LivingCostPage = loadable(() => import("@pages/quota/living-cost"));
const quotaElement = loadable(() => import("./element/quotaElement"));

export const quota: RouteItemType = {
  path: "/quota",
  label: "Định mức",
  icon: CalculatorOutlined,
  element: quotaElement,
  //   children: [
  //     {
  //       path: "/quota/airport",
  //       label: "Định mức taxi sân bay",
  //       element: AirportPage,
  //     },
  //     {
  //       path: "/quota/hotel",
  //       label: "Định mức phòng nghỉ",
  //       element: HotelPage,
  //     },
  //     {
  //       path: "/quota/living",
  //       label: "Định mức phụ cấp lưu trú",
  //       element: LivingPage,
  //     },
  //     {
  //       path: "/quota/moving",
  //       label: "Định mức chi phí di chuyển",
  //       element: MovingPage,
  //     },
  //     {
  //       path: "/quota/living-cost",
  //       label: "Định mức sinh hoạt phí",
  //       element: LivingCostPage,
  //     },
  //   ],
};

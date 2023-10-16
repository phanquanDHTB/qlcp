import { DashboardOutlined } from "@ant-design/icons";
import loadable from "@loadable/component";
import { RouteItemType } from "./type";
const OrderTicketPage = loadable(() => import("@pages/air-ticket/book"));

export const airTicket: RouteItemType = {
  path: "/air-ticket",
  label: "Vé máy bay",
  icon: DashboardOutlined,
  element: OrderTicketPage,
  // children: [
  //   {
  //     path: "/air-ticket/order-ticket",
  //     label: "Đặt vé máy bay cho kế hoạch",
  //     element: OrderTicketPage,
  //   },
  // ],
};

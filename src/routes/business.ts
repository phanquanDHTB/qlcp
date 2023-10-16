import { DashboardOutlined } from '@ant-design/icons';
import loadable from '@loadable/component';
import { RouteItemType } from './type';
const PlanPage = loadable(() => import('@pages/business/plan'))
const ConfirmPlanPage = loadable(() => import('@pages/business/confirm-plan'))
const OrderTicketPage = loadable(() => import("@pages/air-ticket/book"));
const Payment = loadable(() => import('@pages/payment'))

export const business: RouteItemType = {
  path: "/business",
  label: "Công tác",
  icon: DashboardOutlined,
  element: null,
  children: [
    {
      path: "/business/plan",
      label: "Kế hoạch",
      element: PlanPage,
    },
    {
      path: "/business/confirm-plan",
      label: "Xác nhận kế hoạch",
      element: ConfirmPlanPage,
    },
    {
      path: "/business/air-ticket",
      label: "Vé máy bay",
      element: OrderTicketPage,
    },
    {
      path: "/business/payment",
      label: "Công tác hoàn ứng",
      element: Payment,
    },
  ],
};
import ParentNavigate from "../components/ParentNavigate";
import { business } from "./business";
import { payMoneyTransfer } from "./pay-money-transfer";
import { quota } from "./quota";
import { setting } from "./setting";
import { airTicket } from "./air-ticket";
import { RouteItemType } from "./type";
import { Route } from "react-router-dom";
import { categoryRoute } from "./category-route";
import { quotaRoute } from "./quota-route";
const routes: RouteItemType[] = [
  business,
  payMoneyTransfer,
  quota,
  setting,
  airTicket,
  ...categoryRoute,
  ...quotaRoute,
];

function replaceRouteItem(data: RouteItemType[]) {
  const replaceRoutes = [...data];
  const newRoute = replaceRoutes.map((item) => {
    if (
      !item.element &&
      Array.isArray(item.children) &&
      item.children.length > 0
    ) {
      return (
        <Route
          key={item.path}
          path={item.path}
          element={
            <ParentNavigate
              parentPath={item.path as string}
              indexChildPath={item.children[0].path as string}
            />
          }
        >
          {replaceRouteItem(item.children)}
        </Route>
      );
    }
    const ElementPage = item.element;
    return <Route path={item.path} key={item.path} element={<ElementPage />} />;
  });
  return newRoute;
}

function replaceMenuItem(data: RouteItemType[]) {
  const replaceRoutes = [...data];
  replaceRoutes.forEach((item) => {
    if (Object.hasOwn(item, "path")) {
      item.key = item.path;
      delete item.path;
    }
    delete item.element;
    if (Object.hasOwn(item, "icon")) {
      const IconComponent = item.icon;
      item.icon = <IconComponent />;
    }
    if (Object.hasOwn(item, "children") && Array.isArray(item.children)) {
      replaceMenuItem(item.children);
    }
  });
  return replaceRoutes;
}

export const routeItems = replaceRouteItem(routes);

export const menuItems = replaceMenuItem(
  routes.filter((i) => i?.show != false)
);

import { SettingOutlined, UserOutlined } from "@ant-design/icons";
import { RouteItemType } from "./type";
import loadable from "@loadable/component";
const UserPage = loadable(() => import("@pages/settings/company-info/user"));
const RolePage = loadable(() => import("@pages/settings/company-info/role"));
const DepartmentPage = loadable(
  () => import("@pages/settings/company-info/department")
);
const CountryPage = loadable(
  () => import("@pages/settings/location-info/country")
);
const ProvincePage = loadable(
  () => import("@pages/settings/location-info/province")
);
const DistrictPage = loadable(
  () => import("@pages/settings/location-info/district")
);
const WardPage = loadable(() => import("@pages/settings/location-info/ward"));
const AreaPage = loadable(() => import("@pages/settings/location-info/area"));
const AirportPage = loadable(
  () => import("@pages/settings/location-info/airport")
);
const HotelPage = loadable(() => import("@pages/settings/location-info/hotel"));
const VehiclePage = loadable(() => import("@pages/settings/category/vehicle"));
const VehicleGroupPage = loadable(
  () => import("@pages/settings/category/vehicle-group")
);
const ServicePage = loadable(() => import("@pages/settings/category/service"));
const ServiceGroupPage = loadable(
  () => import("@pages/settings/category/service-group")
);
const PositionPage = loadable(
  () => import("@pages/settings/category/position")
);
const PositionGroupPage = loadable(
  () => import("@pages/settings/category/position-group")
);
const PolicyPage = loadable(() => import("@pages/settings/category/policy"));
const PolicyLimitPage = loadable(
  () => import("@pages/settings/category/policy-limit")
);
const PurposePage = loadable(() => import("@pages/settings/category/purpose"));
const DistanceQuota = loadable(
  () => import("@pages/settings/category/distance-quota")
);

const SettingElement = loadable(
  () => import("../routes/element/settingElement")
);
export const setting: RouteItemType = {
  path: "/setting",
  label: "Thiết lập",
  icon: SettingOutlined,
  element: SettingElement,
//   children: [
//     {
//       path: "/setting/company-info",
//       label: "Thông tin công ty",
//       icon: SettingOutlined,
//       element: null,
//       children: [
//         {
//           path: "/setting/company-info/role",
//           label: "Phân quyền vai trò",
//           element: RolePage,
//         },
//         {
//           path: "/setting/company-info/user",
//           label: "Quản lý nhân viên",
//           element: UserPage,
//         },
//         {
//           path: "/setting/company-info/department",
//           label: "Đơn vị",
//           element: DepartmentPage,
//         },
//       ],
//     },
//     {
//       path: "/setting/location-info",
//       label: "Thông tin địa điểm",
//       icon: SettingOutlined,
//       element: null,
//       children: [
//         {
//           path: "/setting/location-info/country",
//           label: "Quốc gia",
//           element: CountryPage,
//         },
//         {
//           path: "/setting/location-info/province",
//           label: "Tỉnh",
//           element: ProvincePage,
//         },
//         {
//           path: "/setting/location-info/district",
//           label: "Huyện",
//           element: DistrictPage,
//         },
//         {
//           path: "/setting/location-info/area",
//           label: "Xã",
//           element: WardPage,
//         },
//         // {
//         // 	path: '/setting/location-info/areas',
//         // 	label: 'Khu vực',
//         // 	element: AreaPage,
//         // },
//         {
//           path: "/setting/location-info/airport",
//           label: "Sân bay",
//           element: AirportPage,
//         },
//         // {
//         // 	path: '/setting/location-info/hotel',
//         // 	label: 'Khách Sạn',
//         // 	element: HotelPage,
//         // },
//       ],
//     },
//     {
//       path: "/setting/category",
//       label: "Danh mục",
//       icon: SettingOutlined,
//       element: null,
//       children: [
//         {
//           path: "/setting/category/vehicle",
//           label: "Phương tiện",
//           element: VehiclePage,
//         },
//         {
//           path: "/setting/category/vehicle-group",
//           label: "Nhóm phương tiện",
//           element: VehicleGroupPage,
//         },
//         {
//           path: "/setting/category/service",
//           label: "Dịch vụ",
//           element: ServicePage,
//         },
//         {
//           path: "/setting/category/service-group",
//           label: "Nhóm dịch vụ",
//           element: ServiceGroupPage,
//         },
//         {
//           path: "/setting/category/position",
//           label: "Chức vụ",
//           element: PositionPage,
//         },
//         {
//           path: "/setting/category/position-group",
//           label: "Nhóm chức vụ",
//           element: PositionGroupPage,
//         },
//         // {
//         // 	path: '/setting/category/policy',
//         // 	label: 'Chính sách',
//         // 	element: PolicyPage,
//         // },
//         {
//           path: "/setting/category/policy-limit",
//           label: "Chính sách hạn mức",
//           element: PolicyLimitPage,
//         },
//         {
//           path: "/setting/category/purpose",
//           label: "Mục đích",
//           element: PurposePage,
//         },
//         {
//           path: "/setting/category/distance-quota",
//           label: "Khoảng cách",
//           element: DistanceQuota,
//         },
//       ],
//     },
//   ],
};

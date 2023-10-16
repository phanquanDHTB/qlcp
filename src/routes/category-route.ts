import loadable from "@loadable/component";
import { RouteItemType } from "./type";

const UserPage = loadable(() => import("@pages/settings/company-info/user"));
const DepartmentPage = loadable(() => import("@pages/settings/company-info/department"));
const RolePage = loadable(() => import("@pages/settings/company-info/role"));
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

const GuestHousePage = loadable(() => import("@pages/settings/category/guest-house"))

const RoomPage = loadable(() => import("@pages/settings/category/room"))

export const categoryRoute: RouteItemType[] = [
  {
    path: "/setting/role",
    label: "Phân quyền vai trò",
    element: RolePage,
    show: false,
  },
  {
    path: "/setting/user",
    label: "Nhân viên",
    element: UserPage,
    show: false,
  },
  {
    path: "/setting/department",
    label: "Đơn vị",
    element: DepartmentPage,
    show: false,
  },
  //location
  {
    path: "/setting/country",
    label: "Quốc gia",
    element: CountryPage,
    show: false,
  },
  {
    path: "/setting/province",
    label: "Tỉnh",
    element: ProvincePage,
    show: false,
  },
  {
    path: "/setting/district",
    label: "Huyện",
    element: DistrictPage,
    show: false,
  },
  {
    path: "/setting/ward",
    label: "Xã",
    element: WardPage,
    show: false,
  },
  {
    path: "/setting/area",
    label: "Khu vực",
    element: AreaPage,
    show: false,
  },
  {
    path: "/setting/airport",
    label: "Sân bay",
    element: AirportPage,
    show: false,
  },
  //category
  {
    path: "/setting/vehicle",
    label: "Phương tiện",
    element: VehiclePage,
    show: false,
  },
  {
    path: "/setting/vehicle-group",
    label: "Nhóm phương tiện",
    element: VehicleGroupPage,
    show: false,
  },
  {
    path: "/setting/service",
    label: "Dịch vụ",
    element: ServicePage,
    show: false,
  },
  {
    path: "/setting/service-group",
    label: "Nhóm dịch vụ",
    element: ServiceGroupPage,
    show: false,
  },
  {
    path: "/setting/position",
    label: "Chức vụ",
    element: PositionPage,
    show: false,
  },
  {
    path: "/setting/position-group",
    label: "Nhóm chức vụ",
    element: PositionGroupPage,
    show: false,
  },
  // {
  // 	path: '/setting/policy',
  // 	label: 'Chính sách',
  // 	element: PolicyPage,
  // },
  {
    path: "/setting/policy-limit",
    label: "Chính sách hạn mức",
    element: PolicyLimitPage,
    show: false,
  },
  {
    path: "/setting/purpose",
    label: "Mục đích",
    element: PurposePage,
    show: false,
  },
  {
    path: "/setting/distance-quota",
    label: "Khoảng cách",
    element: DistanceQuota,
    show: false,
  },
  {
    path: "/setting/guest-house",
    label: "Nhà khách",
    element: GuestHousePage,
    show: false,
  },
  {
    path: "/setting/room",
    label: "Phòng nghỉ",
    element: RoomPage,
    show: false,
  }
];

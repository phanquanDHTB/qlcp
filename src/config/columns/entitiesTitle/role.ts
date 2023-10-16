const Role = {
  name: "Vai trò",
  attribute: {
    name: "Tên vai trò",
    code: "Mã vai trò",
    ins_date: "Ngày tạo",
    upd_date: "Ngày sửa",
    description: "Mô tả",
    is_active: "Trạng thái",
  },
  extend: {
    permission_info: "Thông tin phân quyền",
  },
  groups: {
    dashboard: "Tổng quan",
    vehicle: "Phương tiện",
    location: "Địa điểm",
    user: "Nhân viên",
    service: "Dịch vụ",
    plan: "Kế hoạch",
    category: "Danh mục",
    quota: "Định mức",
  },
  roles: {
    dashboard: "Phân tích báo cáo",

    user: "Nhân viên",
    role: "Phân quyền",

    country: "Quốc gia",
    province: "Tỉnh/Thành phố",
    district: "Quận/Huyện",
    ward: "Xã/Phường",
    area: "Khu vực",
    airport: "Sân bay",
    hotel: "Khách sạn",

    airport_quota: "Định mức bay",
    distance: "Định mức khoảng cách",
    hotel_quota: "Định mức khách sạn",
    living: "Định mức lưu trú",
    moving: "Định mức di chuyển",

    plan: "Kế hoạch",

    department: "Bưu cục",
    vehicle: "Phương tiện",
    vehicle_group: "Nhóm phương tiện",
    service: "Dịch vụ",
    service_group: "Nhóm dịch vụ",
    policy: "Chính sách",
    policy_limit: "Chính sách hạn mức",
    position: "Chức vụ",
    position_group: "Nhóm chức vụ",
    purpose: "Mục đích",
  },
  title: {
    permission: "Quyền",
    general_information: "Thông tin chung",
    system_information: "Thông tin hệ thống",
    permission_info: "Thông tin phân quyền",
  },
};
export default Role;

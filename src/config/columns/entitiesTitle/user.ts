const User = {
  name: "Nhân viên",
  attribute: {
    code: "Mã nhân viên",
    username: "Tài khoản",
    email: "Email",
    password: "Mật khẩu",
    confirm_password: "Xác nhận mật khẩu",
    avatar_id: "Ảnh đại diện",

    full_name: "Họ và tên",
    phone_number: "Số điện thoại",
    name_of_role_ids: "Quyền",
    name_of_warehouse_ids: "Kho",
    roles: "Quyền",
    warehouse_ids: "Kho",
    activated: "Trạng thái",
    role: "Quyền",
    position: "Chức vụ",
    bank_name: "Ngân hàng",
    bank_account_number: "Số tài khoản",
    gender: "Giới tính",
    bank_location: "Chi nhánh",
    department: "Đơn vị",
    user_department_dtos: "Đơn vị",
  },
  extend: {
    active: "Đang làm việc",
    inactive: "Ngừng làm việc",
    all: "Tất cả nhân viên",
  },
  title: {
    general_information: "Thông tin chung",
  },
};
export default User;

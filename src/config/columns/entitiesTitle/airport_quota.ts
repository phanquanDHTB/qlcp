const AirportQuota = {
  name: "Định mức taxi sân bay",
  attribute: {
    //page
    code: "Mã định mức taxi sân bay",
    name: "Tên định",
    type: "Hình thức công tác",
    name_of_province_id: "Tỉnh",
    name_of_airport_id: "Tên sân bay",
    amount: "Định mức",
    description: "Mô tả",
    is_active: "Trạng thái",

    province_id: "Tỉnh",
    airport_id: "Sân bay",
    start_date: "Ngày bắt đầu",
    end_date: "Ngày kết thúc",
  },
  title: {
    general_information: "Thông tin chung",
    additional_information: "Thông tin bổ sung",
  },
  type: {
    1: "Trong nước",
    2: "Nước ngoài",
  },
};
export default AirportQuota;

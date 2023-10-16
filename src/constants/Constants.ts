const activeStatus = [
  { value: true, label: "Kích hoạt" },
  { value: false, label: "Không kích hoạt" },
];

const categoryDefault = {
  vietNamCountry: { label: "Vietnam", id: 192, key: 192, value: 192 },
  phongNghiServiceGroup: { label: "Phòng nghỉ", id: 4, key: 4, value: 4 },
  service: {
    PHONG_DON: { label: "Phòng đơn", id: 1, key: 1, value: 1 },
    PHONG_DOI: { label: "Phòng đôi", id: 2, key: 2, value: 2 },
  },
  serviceGroup: {
    SINH_HOAT_PHI: {
      id: 5,
      value: 5,
      key: 5,
      label: "Sinh hoạt phí",
      code: "NDV000005",
    },
    PHU_CAP_LUU_TRU: { label: "Phụ cấp lưu trú", id: 2, key: 2, value: 2 },
    PHONG_NGHI: { label: "Phòng nghỉ", id: 4, key: 4, value: 4 },
  },
  mayBayVehicle: { label: "Máy bay", id: 5, key: 5, value: 5 },
};

const summaryRequestType = {
  DE_NGHI_CHI: 1,
  DE_NGHI_TAM_UNG: 2,
};

const summaryStatus = {
  DA_PHE_DUYET: 1,
  TAO_BANG: 2,
  CHO_DUYET_BANG: 3,
  DA_PHE_DUYET_BANG: 4,
  TU_CHOI_BANG: 5,
  KE_TOAN_TU_CHOI: 6,
  HOAN_THANH_CHI: 7,
  CHUYEN_KHOAN_LOI: 8,
  DANG_XU_LY_CHI_TIEN: 9,
};

const transferRequestStatus = {
  CHUA_TRINH_KY: 1,
  CHO_PHE_DUYET: 2,
  DA_PHE_DUYET: 3,
  TU_CHOI: 4,
  DA_CAP_NHAT: 5,
};

const documentStatus = [
  { value: 1, label: "Văn thư từ chối" },
  { value: 2, label: "Từ chối" },
  { value: 3, label: "Đã ký" },
  { value: 4, label: "Hủy" },
  { value: 5, label: "Đã ký và ban hành" },
];

const planRequiredStatus = [
  { value: 0, label: "Chờ phê duyệt" },
  { value: 1, label: "Đã phê duyệt" },
  { value: 2, label: "Tạo bảng tổng hợp chuyển khoản" },
  { value: 3, label: "Chờ duyệt bảng tổng hợp chuyển khoản" },
  { value: 4, label: "Đã phê duyệt bảng tổng hợp chuyển khoản" },
  { value: 5, label: "Từ chối bảng tổng hợp chuyển khoản" },
  { value: 6, label: "Kế toán ngân hàng từ chối" },
  { value: 7, label: "Đã hoàn thành chi" },
  { value: 8, label: "Chuyển khoản lỗi" },
];

const planRequiredStatusPlan = [
  { value: 0, label: "Chờ phê duyệt" },
  { value: 1, label: "Đã phê duyệt" },
  { value: 6, label: "Kế toán ngân hàng từ chối" },
  { value: 2, label: "Từ chối phê duyệt" },
];

const transferRequestAccountingStatus = [
  { value: 1, text: "Chờ hạch toán" },
  { value: 2, text: "Thất bại" },
  { value: 3, text: "Thành công" },
];

export default {
  activeStatus,
  categoryDefault,
  summaryRequestType,
  summaryStatus,
  transferRequestStatus,
  documentStatus,
  planRequiredStatus,
  planRequiredStatusPlan,
  transferRequestAccountingStatus,
};

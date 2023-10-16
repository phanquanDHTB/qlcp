export const enum isActiveEnum {
  KICH_HOAT = 1,
  KHONG_KICH_HOAT = 0,
}

export const enum quotaTypeEnum {
  TRONG_NUOC = 1,
  NGOAI_NUOC = 2,
}

export const enum pdfSignPosition {
  KE_HOACH_CONG_TAC = 1,
  DE_NGHI_TAM_UNG = 2,
  PHU_LUC_CHI_PHI = 3,
  KE_HOACH_KET_THUC_CONG_TAC = 4,
  PHU_LUC_CHI_PHI_KET_THUC_CONG_TAC = 5,
  UNC = 6,
  DE_NGHI_CHUYEN_TIEN = 7,
  DE_NGHI_CHI_HOAN_UNG = 8,
  DE_NGHI_CHUYEN_KHOAN_KET_THUC_CONG_TAC = 9,
  GIAY_DE_NGHI_CHUYEN_KHOAN_KET_THUC_CONG_TAC = 10,
  DE_NGHI_CHUYEN_KHOAN_DO_SAI_THONG_TIN_TAI_KHOAN = 11,
  TONG_HOP_THANH_TOAN = 12
}

export const enum planStatus {
  init = 1, // Khởi tạo
  wait_approve = 2, // Chờ phê duyệt
  done_approve = 3, // Đã phê duyệt
  refuse_approve = 4, // Từ chối phê duyệt
  waiting_confirm_result_work = 5, // Chờ phê duyệt xác nhận công tác
  confirm_result_work = 6, // Xác nhận công tác
  waiting_approve_end_work = 7, // Chờ phê duyệt kết thúc công tác
  approve_end_work = 8, // Kết thúc công tác
  refuse_end_work = 9, // Từ chối kết thúc công tác
  destroy = 10, // Hủy
}

export const permissionEntity = {
  airportQuota: "airport_quota",
};
export const enum actionSysType{
  VIEW = "view",
  EDIT = "edit",
  ADD = "add",
  DELETE = "delete",
  IMPORT = "import",
  EXPORT = "export"

}
export const permissionConstants = {
  airportQuota: {
    VIEW: `${actionSysType.VIEW} ${permissionEntity.airportQuota}`,
    ADD: `${actionSysType.ADD} ${permissionEntity.airportQuota}`,
    EDIT: `${actionSysType.EDIT} ${permissionEntity.airportQuota}`,
    DELETE: `${actionSysType.DELETE} ${permissionEntity.airportQuota}`,
    IMPORT: `${actionSysType.IMPORT} ${permissionEntity.airportQuota}`,
    EXPORT: `${actionSysType.EXPORT} ${permissionEntity.airportQuota}`,
  },
};

export const paymentRequestType = {
  HOAN_UNG: 1,
  CHI: 2
}

export const roleSign = {
  PHU_TRACH_DON_VI: 1,
  KE_TOAN_THANH_TOAN: 2,
  PHONG_TAI_CHINH: 3,
  TONG_GIAM_DOC: 4
}

export const enum transferRequestAccountingStatus {
  WAIT = 1,
  REJECT = 2,
  SUCCESS = 3,
}

export const enum CurrentPlanDetailsModalScreen {
  THONG_TIN_CHUNG = 0,
  THONG_TIN_CAN_BO = 1,
  THONG_TIN_LO_TRINH = 2,
  DU_TOAN_CHI_PHI = 3,
  DE_NGHI_TAM_UNG = 4,
  XAC_NHAN_CONG_TAC = 5,
  HOA_DON = 6,
  KET_tHUC_CONG_TAC = 7,
}

export const enum AdvanceRequestStatus {
  CHO_PHE_DUYET = 0,
  DA_PHE_DUYET=4,
  TU_CHOI_BANG=5,
  TU_CHOI_PHE_DUYET=6,
}
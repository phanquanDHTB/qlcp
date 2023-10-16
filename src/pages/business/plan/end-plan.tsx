import FileSaver from 'file-saver';
import { Button, Checkbox, Col, Collapse, Modal, Row, message } from 'antd';
import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import { DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import TableData from '@components/TableData';
import { formatDate } from '@utils/formatDate';
import getMessageError from '@utils/getMessageError';
import { MzFormCheckbox } from '@components/forms/FormCheckbox';
import { handlePriority } from '@utils/handlePriority';
import { ICostHasBill, IPlanCost, IUploadFileResponse, IUser } from 'type';
import formatNumber from '@utils/formatNumber';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { MzFormPassword } from '@components/forms/FormPassword';
import { MzFormSelect } from '@components/forms/FormSelect';
import { AdvanceRequestStatus, pdfSignPosition, roleSign } from '../../../constants/enumConmon';
import planRequiredStatus from '../../../constants/Constants';
import {
  addOrEditPaymentRequest,
  addSignRequest,
  downloadFileRequest,
  getDoctypeRequest,
  getDomainRequest,
  getFileRemakeRequest,
  getFileRequest,
  getFileVOWithPosition,
  getInvoice,
  getPayment,
  getPlanQuotasRequest,
  getPlanReportRequest,
  getPlanRequiredRequest,
  getsignRequest,
  loginVOfficeRequest,
  signRequest,
  signRequestBudget,
  uploadFileRequest,
} from '../../../apis/page/business/plan/end-plan';
import { RouteUser } from './route-infor';
import { planStatus } from '../../../constants/enumConmon';
import TableSignPerson from './table-sign-person';
import formatMoney from '@utils/formatMoney';

const { Panel } = Collapse;
const { confirm } = Modal;

type PaymentTable = {
  code?: string;
  description?: string;
  expire_date?: string;
  id?: number;
  name?: string;
  payment_name?: string;
  plan_id?: number;
  plan_user: RouteUser;
  total_amount?: number;
  status?: number;
  type?: number;
  user: IUser;
  plan?: { id: number | undefined };
  department?: any;
  amount?: any;
};

type InforSign = {
  description?: string;
  document_file_list: any;
  document_type: any;
  document_user_list: any;
  domain: any;
  id: number;
  isAutoPromulgate?: boolean;
  status?: number;
  title?: string;
  priority_id?: number;
};

export const moneyType = {
  chi: 1,
  hoan_ung: 2,
};
const EndPlan = forwardRef((props: any, ref) => {
  const { endPlan, callback, closeModal } = props;
  const [active, setActive] = useState<string[]>(['1', '2', '3', '4', '5']);
  const [quotas, setQuotas] = useState<any>([]);
  const [total, setTotal] = useState(0);
  const [listBill, setListBill] = useState<ICostHasBill[]>([]);
  const [required, setRequired] = useState(0);

  const [listDoc, setListDoc] = useState<any>([]);
  const [listDomain, setListDomain] = useState<any>([]);

  const [isAdd, setIsAdd] = useState<any>(null);

  const { control, handleSubmit, reset, watch } = useForm();

  const getPlanQuotas = async () => {
    try {
      const res = (await getPlanQuotasRequest(endPlan)) as IPlanCost[];
      if (res) {
        const dataQuota = [] as any;
        const idRoute = Array.from(new Set(res.map((i: any) => i.plan_route_id)));
        idRoute?.forEach((i: any) => {
          const listQuotaRoute = res.filter((item: any) => item.plan_route_id === i);
          const name_of_service = Array.from(new Set(listQuotaRoute.map((i: any) => i.name_of_service)));
          dataQuota.push({
            name: listQuotaRoute[0]?.name_of_plan_route,
            _id: v4(),
            children: name_of_service?.map((i: any) => {
              const listUser = listQuotaRoute.filter((item: any) => item.name_of_service === i);
              if (i === 'Tiền taxi sân bay update') {
                i = 'Tiền taxi sân bay';
              }
              return {
                name: i,
                _id: v4(),
                children: listUser?.map((i: any) => {
                  return {
                    name: i.name_of_plan_route_user,
                    day: dayjs(i.to_date).diff(i.from_date, 'day') + 1,
                    quantity: i.quantity,
                    total_amount: i.total_amount,
                    _id: v4(),
                  };
                }),
              };
            }),
          });
        });
        const total = res.reduce((accumulator, currentValue) => accumulator + (currentValue.total_amount ?? 0), 0);
        setTotal(total);
        setQuotas(dataQuota);
      }
    } catch (error) {
      toast(getMessageError(error), { type: 'error' });
    }
  };

  const getInvoiceRequest = async (page) => {
    try {
      const res = (await getInvoice(endPlan, page)) as any;
      setListBill(res.content as ICostHasBill[]);
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };

  const getPlanRequired = async () => {
    try {
      const res = (await getPlanRequiredRequest(endPlan)) as any;
      setRequired((res?.content[0]?.plan_required_user.amount as number) || 0);
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };

  const [reportStatus, setReportStatus] = useState<number | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  const handleReportStatus = () => {
    switch (reportStatus) {
      case 0:
        return planRequiredStatus.planRequiredStatus[0].label;
      case 1:
        return planRequiredStatus.planRequiredStatus[1].label;
      case 2:
        return planRequiredStatus.planRequiredStatus[2].label;
      case 3:
        return planRequiredStatus.planRequiredStatus[3].label;
      case 4:
        return planRequiredStatus.planRequiredStatus[4].label;
      case 5:
        return planRequiredStatus.planRequiredStatus[5].label;
      case 6:
        return planRequiredStatus.planRequiredStatus[6].label;
      case 7:
        return planRequiredStatus.planRequiredStatus[7].label;
      case 8:
        return planRequiredStatus.planRequiredStatus[8].label;
      default:
        return '--';
    }
  };

  const getPlanReport = async () => {
    try {
      const res = (await getPlanReportRequest(endPlan)) as any;
      setReportStatus(res.content[0]?.status);
      setReason(res.content[0]?.reason);
      const data = {
        id: res.content[0]?.id,
        content: res.content[0]?.content,
        propose: res.content[0]?.propose,
        result: res.content[0]?.result,
      };
      reset(data);
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };
  useEffect(() => {
    getPlanQuotas();
    getInvoiceRequest(0);
    getPlanRequired();
    getPlanReport();
  }, []);

  const totalBill = useMemo(() => {
    return listBill.reduce((accumulator, currentValue) => accumulator + (currentValue.total_final_amount || 0), 0);
  }, [listBill]);

  const columns = [
    {
      title: 'Dịch vụ',
      dataIndex: 'name',
      key: 'd',
      width: 50,
      render: (v) => v,
    },
    {
      title: 'Số ngày',
      dataIndex: 'day',
      key: 'name',
      width: 50,
      render: (v) => v,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'g',
      width: 50,
      render: (v) => v,
    },
    {
      title: 'Định mức',
      dataIndex: 'total_amount',
      key: 'a',
      width: 50,
      align: 'right',
      render: (v) => (v ? formatMoney(v) : ''),
    },
  ];
  const columnsBill = [
    {
      title: 'STT',
      dataIndex: 'name',
      key: 'name',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mẫu số',
      dataIndex: 'type',
      key: 'nfame',
      width: 150,
    },
    {
      title: 'Kí hiệu',
      dataIndex: 'symbol',
      key: 'namfe',
      width: 150,
      render: (v) => v,
    },
    {
      title: 'Số hóa đơn',
      dataIndex: 'code',
      key: 'nasfme',
      width: 200,
    },
    {
      title: 'Ngày HĐ',
      dataIndex: 'invoice_date',
      key: 'nameee',
      width: 200,
      render: (v) => formatDate(v),
    },
    {
      title: 'MST',
      dataIndex: 'tax_code',
      key: 'nazzme',
      width: 200,
    },
    {
      title: 'NCC',
      dataIndex: 'provider',
      key: 'namezzzz',
      width: 200,
    },
    {
      title: 'Loại thanh toán',
      dataIndex: 'payment_type',
      key: 'nafdme',
      width: 200,
      render: (v) => (v === 1 ? 'Hoàn ứng' : 'Phải trả nhà cung cấp'),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_final_amount',
      key: 'naefme',
      align: 'right',
      render: (v) => {
        return v ? formatMoney(v) : '';
      },
    },
  ];

  const addReportPlan = async (data: any) => {
    try {
      await signRequest(data, endPlan);
      closeModal();
      toast('Lưu báo cáo kết thúc công tác thành công', { type: 'success' });
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };

  const sign = async (data: any) => {
    if (isAdd && moneyStatus() !== 0) {
      toast(`Tạo ${moneyStatus() === moneyType.chi ? 'đề nghị hoàn ứng' : 'đề nghị chi'} trước khi trình ký`, {
        type: 'error',
      });
    } else {
      try {
        await signRequest(data, endPlan);
        setIsVoffice(true);
      } catch (err) {
        toast(getMessageError(err), { type: 'error' });
      }
    }
  };
  const moneyStatus = () => {
    if (total + totalBill - required > 0) {
      return 2;
    } else if (total + totalBill - required < 0) {
      return 1;
    } else {
      return 0;
    }
  };

  useImperativeHandle(ref, () => ({
    addReportPlan: () => {
      handleSubmit((e) => addReportPlan(e))();
    },
    moneyStatus: moneyStatus(),
    isAdd: isAdd,
    openPaymentModal: () => {
      setIsOpenPaymentModal(true);
    },
    sign: () => {
      handleSubmit(sign)();
    },
    viewSign: () => setIsVofficeDetail(true),
  }));

  const [inforSign, setInforSign] = useState<any>(null);

  const getSign = async () => {
    try {
      const res = (await getsignRequest(endPlan.id)) as any;
      setInforSign(res.content[0] as InforSign);
      const position4 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === pdfSignPosition.KE_HOACH_KET_THUC_CONG_TAC
      );
      const position5 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === pdfSignPosition.PHU_LUC_CHI_PHI_KET_THUC_CONG_TAC
      );
      const position8 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === pdfSignPosition.DE_NGHI_CHI_HOAN_UNG
      );
      const position10 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === pdfSignPosition.GIAY_DE_NGHI_CHUYEN_KHOAN_KET_THUC_CONG_TAC
      );
      const position12 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === pdfSignPosition.TONG_HOP_THANH_TOAN
      );
      setDataTableQuota([...position5, ...position8]);
      setDataTablePayment([...position4, ...position10, ...position12]);
      vOfficeDetailForm.setValue(
        'usersSignDTOS',
        res.content[0]?.document_user_list?.map((i: any) => {
          i.display_name = i.full_name;
          i.isDisplay = i.is_display;
          i._id = v4();
          delete i.full_name;
          delete i.is_display;
          return i;
        })
      );
      setCheckIndex(res.content[0]?.document_user_list?.findIndex((i: any) => i?.role_key === 2));
      console.log(res.content[0]?.document_user_list?.findIndex((i: any) => i?.role_key === 2))
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };

  useEffect(() => {
    if (endPlan.status === planStatus.waiting_approve_end_work || endPlan.status === planStatus.approve_end_work) {
      getSign();
    }
  }, [endPlan?.id]);

  console.log(endPlan.status)
  const paymentForm = useForm();
  const vOfficeForm = useForm();
  const vOfficeDetailForm = useForm({
    defaultValues: { isAutoPromulgate: true, documentTypeId: listDoc[0]?.value },
  }) as any;
  const [isVoffice, setIsVoffice] = useState(false);
  const [isVofficeDetail, setIsVofficeDetail] = useState(false);
  const [idPayment, setIdPayment] = useState<any>(null);
  const [defaulPayment, setDefaulPayment] = useState<any>(null);
  const getPaymentRequest = async () => {
    try {
      const res = (await getPayment(endPlan.id, moneyStatus())) as any;
      if (res.content.length === 0) {
        setIsAdd(true);
        callback(true);
      } else {
        setIsAdd(false);
        callback(false);
      }
      setTablePayment(res.content as PaymentTable[]);
      paymentForm.setValue('expire_date', dayjs(res.content[0]?.expire_date));
      paymentForm.setValue('employee', res.content[0]?.plan_user?.id);
      if (res.content[0]) {
        setIdPayment(res.content[0].id);
        setDefaulPayment({
          label: res.content[0]?.plan_user?.name,
          value: res.content[0]?.plan_user?.id,
          id: res.content[0]?.plan_user?.id,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const addOreditPayment = async (e) => {
    if (tablePayment.length > 0) {
      try {
        const params = Object.assign(
          { ...tablePayment[0] },
          { expire_date: e.expire_date.format('YYYY-MM-DD'), type: moneyStatus() }
        );
        params.plan = { id: endPlan.id };
        params.plan_user = { id: params.plan_user.id };
        params.user = { id: params.user.id };
        params.plan_id = params.plan?.id;
        delete params.department;
        delete params.amount;
        delete params.id;
        if (idPayment) {
          params.id = idPayment;
        }
        await addOrEditPaymentRequest(idPayment, params);
        toast(idPayment ? 'Sửa thành công' : 'Thêm thành công', { type: 'success' });
        getPaymentRequest();
        setIsOpenPaymentModal(false);
      } catch (err) {
        console.log('errr', err);
        toast(getMessageError(err), { type: 'error' });
      }
    } else {
      toast('Vui lòng chọn nhân viên', { type: 'error' });
    }
  };

  useEffect(() => {
    if (moneyStatus() !== 0) {
      getPaymentRequest();
    }
  }, [moneyStatus()]);

  useEffect(() => {
    callback(isAdd);
  }, [isAdd]);

  const [isOpenPaymentModal, setIsOpenPaymentModal] = useState(false);
  const [dataSelect, setDataSelect] = useState<any>([]);
  const [tablePayment, setTablePayment] = useState<PaymentTable[]>([]);

  const [dataTablePayment, setDataTablePayment] = useState<any>([]);
  const [dataTableQuota, setDataTableQuota] = useState<any>([]);

  const paymentColumn = [
    {
      title: 'Mã nhân viên',
      dataIndex: 'code',
      key: 'name',
      width: 180,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'Email',
      dataIndex: 'plan_user',
      key: 'name',
      width: 180,
      render: (v) => v.email,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'plan_user',
      key: 'name',
      width: 250,
      render: (v) => v.phone_number,
    },
    {
      title: 'Người thụ hưởng',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: 'STK',
      dataIndex: 'plan_user',
      key: 'name',
      width: 200,
      render: (v) => v.account_number,
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'plan_user',
      key: 'name',
      width: 200,
      render: (v) => v.bank,
    },
    {
      title: 'Tổng số tiền',
      dataIndex: 'total_amount',
      key: 'name',
      align: 'right',
      render: (v) => {
        if (v) {
          return formatMoney(v);
        }
      },
    },
  ];

  // const handleRoleSign = (role: number) => {
  //   switch (role) {
  //     case roleSign.PHU_TRACH_DON_VI:
  //       return 'Phụ trách đơn vị';
  //     case roleSign.KE_TOAN_THANH_TOAN:
  //       return 'Kế toán thanh toán';
  //     case roleSign.PHONG_TAI_CHINH:
  //       return 'Phòng tài chính';
  //     case roleSign.TONG_GIAM_DOC:
  //       return 'Tổng giám đốc';
  //   }
  // };
  const [checkIndex, setCheckIndex] = useState<number | null>(0);
  const columnsVoffice = [
    {
      title: <Row>STT</Row>,
      dataIndex: 'code',
      key: 'name',
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: (
        <Row>
          {endPlan.status === planStatus.confirm_result_work && (
            <span style={{ color: 'red', marginRight: 10 }}>*</span>
          )}
          Nhân viên
        </Row>
      ),
      dataIndex: 'display_name',
      key: 'name',
      width: 250,
      render: (v) => v ?? '--',
    },
    {
      title: () => <Row>Email</Row>,
      dataIndex: 'email',
      key: 'name',
      width: 300,
    },
    {
      title: () => (
        <Row>
          {endPlan.status === planStatus.confirm_result_work && (
            <span style={{ color: 'red', marginRight: 10 }}>*</span>
          )}
          Đơn vị - Chức vụ
        </Row>
      ),
      dataIndex: 'plan_user',
      key: 'name',
      width: 400,
      render: (_, record, index) =>
        endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work ? (
          <MzFormSelectV2
            selectProps={{
              style: {
                width: 400,
              },
              placeholder: 'Chọn đơn vị, chức vụ',
              allowClear: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              onSelect: (_, record) => {
                vOfficeDetailForm.setValue(`defaulDataList.${index}`, record);
                vofficeData.update(
                  index,
                  Object.assign(vOfficeDetailForm.watch(`usersSignDTOS.${index}`), {
                    departmentSignId: record?.org_id,
                    sysUserId: record?.sys_user_id,
                    departmentRole: record,
                  })
                );
              },
            }}
            controllerProps={{
              control: vOfficeDetailForm.control,
              name: `usersSignDTOS.${index}.departmentRole.org_id`,
              rules: { required: 'Vui lòng chọn đơn vị - chức vụ người ký' },
            }}
            uri={`voffice/users-role?keyword=${record.employee_id}&username=${vOfficeForm.getValues(
              'username'
            )}&password=${vOfficeForm.getValues('password')}`}
            uriSearch={'orgName.contains='}
            displayLoading={true}
            labelObj={['position', 'org_name']}
            valueObj={'org_id'}
            defaultOption={vOfficeDetailForm.watch(`defaulDataList.${index}`)}
          />
        ) : (
          record?.position
        ),
    },
    {
      title: () => <Row>Kế toán thanh toán</Row>,
      dataIndex: 'role_key',
      key: 'name',
      width: 200,
      render: (_, __, index) => (
        <Checkbox
          checked={index === checkIndex}
          onChange={(e) => {
            if (e.target.checked) {
              setCheckIndex(index);
            } else {
              setCheckIndex(null);
            }
          }}
          disabled={
            endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work
              ? false
              : true
          }
        />
      ),
    },
    {
      title: <Row>Hiển thị chữ ký</Row>,
      dataIndex: 'id',
      width: 170,
      // align: 'center',
      render: (_, __, index) => (
        <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
          <MzFormCheckbox
            controllerProps={{
              control: vOfficeDetailForm.control,
              name: `usersSignDTOS.${index}.isDisplay`,
            }}
            checkboxProps={{
              disabled:
                endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work
                  ? false
                  : true,
            }}
          />
        </div>
      ),
    },
    endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work
      ? {
          title: 'Hành động',
          // align: 'center',
          dataIndex: 'role_key',
          key: 'name',
          width: 150,
          render: (_, __, index) => (
            <Button
              icon={<DeleteOutlined />}
              onClick={() => {
                vofficeData.remove(index);
                defaulVofficeDataList.remove(index);
              }}
            ></Button>
          ),
        }
      : {},
  ];

  const money = total + totalBill - required;

  const [isLogin, setIslogin] = useState(false);
  const loginVoffice = async (data) => {
    try {
      setIslogin(true);
      const res = (await loginVOfficeRequest(data)) as { errorCode: boolean | null; message?: string };
      if (!res.errorCode) {
        setIsVoffice(false);
        setIsVofficeDetail(true);
        toast('Đăng nhập thành công');
        getDoctype();
        getDomain();
        if (
          (endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work) &&
          reportStatus !== AdvanceRequestStatus.TU_CHOI_PHE_DUYET
        ) {
          getFile(
            'export-pdf/plan-cost-quota/appendix/plan/' + endPlan.id,
            `files/upload-voffice?position=${pdfSignPosition.PHU_LUC_CHI_PHI_KET_THUC_CONG_TAC}`,
            (data) => setDataTableQuota((pre) => [...pre, data]),
            'phu_luc_chi_phi_cong_tac.pdf'
          );
          getFile(
            'export-pdf/payment_aggregation/plan/' + endPlan.id,
            `files/upload-voffice?position=${pdfSignPosition.TONG_HOP_THANH_TOAN}`,
            (data) => setDataTableQuota((pre) => [...pre, data]),
            'bang_tong_hop_thanh_toan.pdf'
          );
          getFile(
            'export-pdf/plan-cost-quota/plan/' + endPlan.id,
            `files/upload-voffice?position=${pdfSignPosition.KE_HOACH_KET_THUC_CONG_TAC}`,
            (data) => setDataTablePayment((pre) => [...pre, data]),
            'de_nghi_xac_nhan_ket_thuc_cong_tac.pdf'
          );
          if (money !== 0) {
            getFile(
              `export-pdf/plan-transfer-request/plan/` + endPlan.id + `/${moneyStatus()}`,
              `files/upload-voffice?position=${pdfSignPosition.GIAY_DE_NGHI_CHUYEN_KHOAN_KET_THUC_CONG_TAC}`,
              (data) => setDataTablePayment((pre) => [...pre, data]),
              moneyStatus() === moneyType.chi ? 'giay_thanh_toan_tien_hoan_ung.pdf' : 'giay_de_nghi_chi.pdf'
            );
            getFile(
              'export-pdf/advance-payment/plan/' + endPlan.id,
              `files/upload-voffice?position=${pdfSignPosition.DE_NGHI_CHI_HOAN_UNG}`,
              (data) => setDataTablePayment((pre) => [...pre, data]),
              'de_nghi_chuyen_khoan.pdf'
            );
          }
        } else if (
          (endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work) &&
          reportStatus === AdvanceRequestStatus.TU_CHOI_PHE_DUYET
        ) {
          try {
            const res = (await getFileRemakeRequest(endPlan.id)) as any;
            const formData = new FormData();
            formData.append('file', res, 'de_nghi_chuyen_tien_do_sai_thong_tin_tai_khoan.pdf');
            const dataInfor = (await getFileVOWithPosition(formData)) as any;
            setDataTablePayment((pre) => [...pre, dataInfor]);
          } catch (err) {
            console.log(err);
          }
        }
      } else {
        toast(res.message, { type: 'error' });
      }
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    } finally {
      setIslogin(false);
    }
  };

  const getDoctype = async () => {
    try {
      const res = (await getDoctypeRequest()) as { name?: string; id?: number }[];
      const listDoc = res?.map((i: { name?: string; id?: number }) => ({ label: i.name, value: i.id }));
      setListDoc(listDoc);
    } catch (err) {
      console.log(err);
    }
  };

  const getDomain = async () => {
    try {
      const res = (await getDomainRequest()) as { name?: string; id: number }[];
      const listDomain = res?.map((i: { name?: string; id: number }) => ({ label: i.name, value: i.id }));
      setListDomain(listDomain);
    } catch (err) {
      console.log(err);
    }
  };

  const getFile = async (
    urlGet: string,
    urlUpload: string,
    callback: (data: IUploadFileResponse) => void,
    name: string
  ) => {
    try {
      const res = (await getFileRequest(urlGet)) as any;
      const formData = new FormData();
      formData.append('file', res, name);
      const dataInfor = (await uploadFileRequest(urlUpload, formData)) as IUploadFileResponse;
      callback(dataInfor);
    } catch (err) {
      console.log(err);
    }
  };

  const columnsTablePayment = [
    {
      title: <Row>STT</Row>,
      dataIndex: '',
      key: 'name',
      width: 180,
      render: (_, __, index) => index + 1,
    },
    {
      title: <Row>Tên File</Row>,
      dataIndex: 'file_name',
      key: 'name',
      width: 350,
      render: (v, record) =>
        v && (
          <a
            onClick={async () => {
              try {
                const res = (await downloadFileRequest(record.file_id)) as any;
                FileSaver.saveAs(new Blob([res]), record.file_name);
              } catch (err) {
                console.log(err);
              }
            }}
          >
            {v}
          </a>
        ),
    },
  ];

  const columnsTablePayment3 = [
    {
      title: <Row>STT</Row>,
      dataIndex: '',
      key: 'name',
      width: 180,
      render: (_, __, index) => index + 1,
    },
    {
      title: <Row>Số, Ký hiệu văn bản</Row>,
      dataIndex: 'file_name',
      key: 'name',
      width: 350,
      // render: (v) => v && <a href={''}>{v}</a>
    },
    {
      title: <Row>Trích yếu nội dung văn bản</Row>,
      dataIndex: 'file_name',
      key: 'name',
      width: 350,
      // render: (v) => v && <a href={''}>{v}</a>
    },
  ];

  const [userInfor, setUserInfor] = useState<any>(null);
  const vofficeData = useFieldArray({
    control: vOfficeDetailForm.control,
    name: 'usersSignDTOS',
  });

  const defaulVofficeDataList = useFieldArray({
    control: vOfficeDetailForm.control,
    name: 'defaulDataList',
  });

  console.log();

  useEffect(() => {
    vOfficeDetailForm.setValue('defaulDataList', [{}, {}, {}, {}]);
  }, []);

  const handleCloseSign = () => {
    setIsVofficeDetail(false);
    if (!(endPlan.status === planStatus.waiting_approve_end_work || endPlan.status === planStatus.approve_end_work)) {
      setDataTablePayment([]);
      setDataTableQuota([]);
      vofficeData.replace([]);
      vOfficeDetailForm.reset({});
      vOfficeDetailForm.setValue('nameUserSign', null);
      vOfficeForm.setValue('username', null);
      vOfficeForm.setValue('password', null);
    }
  };

  const [loadingSign, setLoadingSign] = useState(false);
  const addSign = async (data: any) => {
    const arr = [...dataTablePayment, ...dataTableQuota];
    if (arr.length > 0) {
      data.files = arr?.map((i: any) => i.file_id);
    }
    data.username = vOfficeForm.getValues('username');
    data.password = vOfficeForm.getValues('password');
    data.planId = endPlan.id;
    data.type = 2;
    data.usersSignDTOS?.forEach((i: any, index) => {
      i.is_display = i.isDisplay ? 1 : 0;
      i.isDisplay = i.isDisplay ? 1 : 0;
      i.full_name = i.display_name;
      i.fullName = i.display_name;
      i.org_name = i.departmentRole.org_name;
      if (index === checkIndex) {
        i.role_key = 2;
      } else {
        i.role_key = null;
      }
    });
    if (endPlan.status === planStatus.confirm_result_work) {
      data.reSign = 1;
    } else if (endPlan.status === planStatus.refuse_end_work) {
      data.reSign = 2;
    }
    try {
      setLoadingSign(true)
      // const res = await addSignRequest(data) as any
      // if (res.error) {
      //     toast(res.message, { type: 'error' })
      // } else {
      //     handleCloseSign()
      //     toast('Thành công', { type: 'success' })
      //     closeModal()
      //     getPlan()
      // }

      const resCheck = (await signRequestBudget(data)) as any;
      if (resCheck) {
        if (resCheck?.error) {
          confirm({
            title: resCheck?.title || 'Lỗi',
            content: resCheck?.message || '',
            okText: 'Xác nhận',
            cancelText: 'Hủy',
            onCancel() {
              console.log('Cancel');
            },
          });
        } else {
          if (resCheck?.title == 'PASS_WITH_WARNING') {
            message.warning(resCheck?.message || '');
          }
          setLoadingSign(true);
          const res = (await addSignRequest(data)) as any;
          if (res.error) {
            toast(res.message, { type: 'error' });
          } else {
            toast('Thành công', { type: 'success' });
            setIsVofficeDetail(false);
            setIsVoffice(false);
            closeModal();
          }
        }
      } else {
        setLoadingSign(true);
        const res = (await addSignRequest(data)) as any;
        if (res.error) {
          toast(res.message, { type: 'error' });
        } else {
          getPlanReport();
          toast('Thành công', { type: 'success' });
          setIsVofficeDetail(false);
          setIsVoffice(false);
          closeModal();
        }
      }
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    } finally {
      setLoadingSign(false);
    }
  };

  return (
    <>
      <Modal
        title={'Trình ký đề nghị kết thúc công tác'}
        open={isVofficeDetail}
        onCancel={() => handleCloseSign()}
        bodyStyle={{
          height: 'calc(100vh - 120px)',
          padding: '0px',
        }}
        style={{
          top: 0,
          height: '100vh',
          maxWidth: '100vw',
        }}
        width={'100vw'}
        footer={[
          <Button
            key={1}
            type={'primary'}
            onClick={() =>
              vOfficeDetailForm.handleSubmit(
                (data) => addSign(data),
                (err) => {
                  if (err.usersSignDTOS) {
                    const errorMesage = err.usersSignDTOS?.find((i: any) => i?.departmentRole?.org_id?.message);
                    toast(errorMesage?.departmentRole?.org_id?.message, { type: 'error' });
                  }
                }
              )()
            }
            disabled={
              endPlan.status === planStatus.waiting_approve_end_work || endPlan.status === planStatus.approve_end_work
                ? true
                : false
            }
            loading={loadingSign}
          >
            Trình ký
          </Button>,
          <Button key={2} onClick={() => handleCloseSign()}>
            Đóng
          </Button>,
        ]}
      >
        <div className={'modal-scroll'}>
          <Row>
            <h3>Thông tin trình ký</h3>
          </Row>
          <div style={{ borderBottom: '1px solid #d9d9d9', marginBottom: 20 }} />
          <Row style={{ padding: '10px 0' }}>
            <Col span={4}>
              {(endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work) && (
                <span style={{ color: 'red', marginRight: 5 }}>*</span>
              )}
              Trích yếu nội dung văn bản:
            </Col>
            <Col span={8}>
              {endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work ? (
                <MzFormInput
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'title',
                    rules: { required: 'Vui lòng nhập trích yếu nội dung văn bản' },
                  }}
                  inputProps={{
                    style: {
                      width: '80%',
                    },
                    placeholder: 'Trích yếu nội dung văn bản',
                  }}
                />
              ) : (
                inforSign?.title
              )}
            </Col>
            <Col span={4}>
              {(endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work) && (
                <span style={{ color: 'red', marginRight: 5 }}>*</span>
              )}
              Hình thức văn bản:
            </Col>
            <Col span={8}>
              {endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work ? (
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'documentTypeId',
                    rules: { required: 'Vui lòng chọn hình thức văn bản' },
                  }}
                  selectProps={{
                    style: {
                      width: '80%',
                    },
                    options: listDoc,
                    placeholder: 'Hình thức văn bản',
                  }}
                />
              ) : (
                inforSign?.document_type?.name
              )}
            </Col>
          </Row>
          <Row style={{ padding: '10px 0' }}>
            <Col span={4}>
              {(endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work) && (
                <span style={{ color: 'red', marginRight: 5 }}>*</span>
              )}
              Nội dung:
            </Col>
            <Col span={8}>
              {endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work ? (
                <MzFormInput
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'description',
                    rules: { required: 'Vui lòng nhập nội dung' },
                  }}
                  inputProps={{
                    style: {
                      width: '80%',
                    },
                    placeholder: 'Nội dung',
                  }}
                />
              ) : (
                inforSign?.description
              )}
            </Col>
            <Col span={4}>
              {(endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work) && (
                <span style={{ color: 'red', marginRight: 5 }}>*</span>
              )}
              Độ khẩn:
            </Col>
            <Col span={8}>
              {endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work ? (
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'priorityId',
                    rules: { required: 'Vui lòng chọn độ khẩn' },
                  }}
                  selectProps={{
                    style: {
                      width: '80%',
                    },
                    options: [
                      { value: 1, label: 'Bình thường' },
                      { value: 2, label: 'Khẩn' },
                      { value: 3, label: 'Hỏa tốc' },
                      { value: 4, label: 'Thượng khẩn' },
                    ],
                    placeholder: 'Độ khẩn',
                  }}
                />
              ) : (
                handlePriority(inforSign?.priority_id)
              )}
            </Col>
          </Row>
          <Row style={{ padding: '10px 0' }}>
            <Col span={4}>
              {(endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work) && (
                <span style={{ color: 'red', marginRight: 5 }}>*</span>
              )}
              Ngành:
            </Col>
            <Col span={8} style={{ zIndex: 5 }}>
              {endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work ? (
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'domainId',
                    rules: { required: 'Vui lòng chọn ngành' },
                  }}
                  selectProps={{
                    style: {
                      width: '80%',
                    },
                    options: listDomain,
                    placeholder: 'Ngành',
                  }}
                />
              ) : (
                inforSign?.domain?.name
              )}
            </Col>
          </Row>
          <Row>
            <h3>Danh sách người ký</h3>
          </Row>
          <div style={{ borderBottom: '1px solid #d9d9d9', marginBottom: 20 }} />
          <Col>
            <p style={{ width: 300 }}>
              Danh sách người ký duyệt :
              {endPlan.status === planStatus.waiting_approve_end_work &&
                inforSign?.document_user_list?.map((i: any) => <span style={{ margin: '0 5px' }}>{i?.full_name}</span>)}
            </p>
          </Col>
          {(endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work) && (
            <Row>
              <Col span={6}>
                <MzFormSelectV2
                  controllerProps={{ control: vOfficeDetailForm.control, name: 'nameUserSign' }}
                  selectProps={{
                    style: {
                      width: '100%',
                    },
                    placeholder: 'Nhập tên',
                    allowClear: true,
                    filterOption: (input, option) => {
                      const optionValue: string | undefined =
                        (option?.label !== undefined ? option?.label?.toString() : '') +
                        (option?.employee_code !== undefined ? option?.employee_code?.toString() : '') +
                        (option?.email !== undefined ? option?.email?.toString() : '');
                      return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                    },
                    onSelect: (_, record) => setUserInfor(record),
                  }}
                  labelObj={['display_name']}
                  valueObj="employee_id"
                  displayLoading
                  uri={`voffice/users?username=${vOfficeForm.getValues('username')}&password=${vOfficeForm.getValues(
                    'password'
                  )}`}
                  uriSearch={'keyWord='}
                />
              </Col>
              <Col span={1}></Col>
              <Col span={2}>
                <Button
                  type={'primary'}
                  onClick={() => {
                    if (vOfficeDetailForm.getValues('nameUserSign')) {
                      const duplicate = vofficeData.fields?.find((i: any) => i.employee_id === userInfor.employee_id);
                      if (!duplicate) {
                        vofficeData.append(Object.assign(userInfor, { _id: v4(), isDisplay: true }));
                      } else {
                        toast.error('Cán bộ này đã được chọn');
                      }
                    } else {
                      toast.error('Vui lòng chọn nhân viên');
                    }
                  }}
                >
                  Thêm
                </Button>
              </Col>
            </Row>
          )}
          <Row style={{ marginTop: 20, zIndex: -1 }}>
            <TableSignPerson
              vofficeData={vofficeData}
              columnsVoffice={columnsVoffice}
              defaulVofficeDataList={defaulVofficeDataList}
            />
          </Row>
          <Row style={{ margin: '30px 0' }}>
            <MzFormCheckbox
              controllerProps={{ control: vOfficeDetailForm.control, name: 'isAutoPromulgate' }}
              label={'Tự động ban hành'}
              checkboxProps={{
                disabled:
                  endPlan.status === planStatus.waiting_approve_end_work ||
                  endPlan.status === planStatus.approve_end_work
                    ? true
                    : false,
              }}
            />
          </Row>
          <Row style={{ margin: '20px 0' }}>
            <Col span={11}>
              <Row>
                <h3>Văn bản đính kèm</h3>
              </Row>
              <Row>
                <Col span={24}>
                  <TableData
                    tableProps={{
                      dataSource: dataTablePayment,
                      columns: columnsTablePayment,
                      rowKey: '_id',
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={2}></Col>
            <Col span={11}>
              <Row>
                <h3>Văn bản phụ lục</h3>
              </Row>
              <Row>
                <Col span={24}>
                  <TableData
                    tableProps={{
                      dataSource: dataTableQuota,
                      columns: columnsTablePayment,
                      rowKey: 'id',
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ margin: '20px 0' }}>
            <Col span={11}>
              <Row>
                <h3>Văn bản đính kèm</h3>
              </Row>
              <Row>
                <Col span={24}>
                  <TableData
                    tableProps={{
                      dataSource: [],
                      columns: columnsTablePayment3,
                      rowKey: 'id',
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Modal>
      <Modal
        title={'Thông tin đăng nhập'}
        open={isVoffice}
        onCancel={() => setIsVoffice(false)}
        footer={[
          <Button key={1} onClick={() => setIsVoffice(false)}>
            Đóng
          </Button>,
          <Button key={2} type={'primary'} onClick={() => vOfficeForm.handleSubmit(loginVoffice)()} loading={isLogin}>
            Đăng nhập
          </Button>,
        ]}
      >
        <Row>
          <Col style={{ color: 'red' }} span={1}>
            <span>*</span>
          </Col>
          <Col span={23}>
            <MzFormInput
              controllerProps={{
                control: vOfficeForm.control,
                name: 'username',
                rules: { required: true },
              }}
              label={'Tên đăng nhập Voffice'}
              inputProps={{
                style: {
                  width: '100%',
                },
                autoComplete: 'off',
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col style={{ color: 'red' }} span={1}>
            <span>*</span>
          </Col>
          <Col span={23}>
            <MzFormPassword
              controllerProps={{
                control: vOfficeForm.control,
                name: 'password',
                rules: { required: true },
              }}
              label={'Mật khẩu Voffice'}
              inputProps={{
                style: {
                  width: '100%',
                },
                type: 'password',
                autoComplete: 'off',
              }}
            />
          </Col>
        </Row>
      </Modal>
      <Modal
        open={isOpenPaymentModal}
        onCancel={() => {
          setIsOpenPaymentModal(false);
        }}
        title={'Thông tin thanh toán'}
        width={'100vw'}
        footer={[
          <Button key={1} onClick={() => setIsOpenPaymentModal(false)}>
            Hủy
          </Button>,
          <Button
            key={2}
            type={'primary'}
            onClick={paymentForm.handleSubmit(addOreditPayment)}
            disabled={endPlan.status === planStatus.waiting_approve_end_work || endPlan.status === planStatus.approve_end_work}
          >
            Lưu
          </Button>,
        ]}
      >
        <Row>
          <Col span={4} style={{}}>
            <span style={{ color: 'red' }}>*</span>Thời hạn thanh toán:
          </Col>
          <Col span={20}>
            <MzFormDatePicker
              controllerProps={{
                control: paymentForm.control,
                name: 'expire_date',
                rules: { required: true },
              }}
              datePickerProps={{
                placeholder: 'Thời hạn thanh toán',
                style: {
                  width: '30vw',
                },
                disabledDate: (current) => {
                  return current && current <= dayjs(dayjs(new Date()).format('YYYY/MM/DD'));
                },
                format: 'DD/MM/YYYY',
                disabled: endPlan.status === planStatus.waiting_approve_end_work || endPlan.status === planStatus.approve_end_work,
              }}
            />
          </Col>
        </Row>
        <Row style={{ margin: '20px 0' }}>
          <h3>Thông tin người nhận thanh toán</h3>
        </Row>
        <Row>
          <Col span={4} style={{}}>
            <span style={{ color: 'red' }}>*</span>Chọn nhân viên:
          </Col>
          <Col span={20}>
            <MzFormSelectV2
              controllerProps={{ control: paymentForm.control, name: 'employee' }}
              selectProps={{
                style: {
                  width: '30vw',
                },
                placeholder: 'Tìm kiếm theo tên',
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                onSelect: (_, record) =>
                  setDataSelect([Object.assign(record, { total_amount: Math.abs(money) }, { plan_user: record })]),
                disabled: endPlan.status === planStatus.waiting_approve_end_work || endPlan.status === planStatus.approve_end_work,
              }}
              defaultOption={idPayment ? defaulPayment : {}}
              labelObj={['name']}
              valueObj="id"
              uri={`plan-users?planId=${endPlan.id}&type.equals=1`}
              uriSearch="name.contains="
            />
          </Col>
        </Row>
        <Row>
          <Col span={4}></Col>
          <Col style={{ margin: '20px 0' }}>
            {endPlan.status !== planStatus.waiting_approve_end_work && endPlan.status !== planStatus.approve_end_work && (
              <Button
                type={'primary'}
                onClick={() => {
                  if (dataSelect[0]) {
                    if (dataSelect[0].account_number) {
                      setTablePayment(dataSelect);
                      paymentForm.setValue('employee', null);
                    } else {
                      toast('Nhân viên nhân thanh toán chưa cập nhật số tài khoản', {
                        type: 'error',
                      });
                    }
                  } else {
                    toast('Vui lòng chọn nhân viên', { type: 'error' });
                  }
                }}
              >
                Chọn
              </Button>
            )}
          </Col>
        </Row>
        <Row>
          <div className={'payment-table'}>
            <TableData
              tableProps={{
                dataSource: tablePayment,
                columns: paymentColumn as any,
                style: {
                  width: '93vw',
                },
                rowKey: 'id',
              }}
            />
          </div>
        </Row>
      </Modal>
      <Collapse defaultActiveKey={active} key={v4()} onChange={(e) => setActive(e as string[])}>
        <Panel header={<h3>Thông tin chung</h3>} key={'1'}>
          <Row>
            <Col span={12}>
              <Row>
                <Col style={{}} span={4}>
                  <p style={{}}>Mã kế hoạch:</p>
                </Col>
                <Col span={20}>
                  <p>{endPlan?.code}</p>
                </Col>
              </Row>
              <Row>
                <Col span={4}>
                  <p style={{}}>Tên kế hoạch:</p>
                </Col>
                <Col span={20}>
                  <p>{endPlan?.name}</p>
                </Col>
              </Row>
              <Row>
                <Col span={4}>
                  <p style={{}}>Ngày bắt đầu:</p>
                </Col>
                <Col span={20}>
                  <p>{formatDate(endPlan?.start_time)}</p>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col span={4}>
                  <p style={{}}>Trạng thái:</p>
                </Col>
                <Col span={20}>
                  <p>{handleReportStatus()}</p>
                </Col>
              </Row>
              <Row>
                <Col span={4}>
                  <p style={{}}>Lý do:</p>
                </Col>
                <Col span={20}>
                  <p>{reason || '--'}</p>
                </Col>
              </Row>
              <Row>
                <Col span={4}>
                  <p style={{}}>Ngày kết thúc:</p>
                </Col>
                <Col span={20}>
                  <p>{formatDate(endPlan?.end_time)}</p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Panel>
        <Panel header={<h3>Báo cáo kết quả công tác</h3>} key={'2'}>
          {endPlan.status === planStatus.confirm_result_work || endPlan.status === planStatus.refuse_end_work ? (
            <>
              <Row>
                <Col span={6} style={{}}>
                  <span style={{ color: 'red' }}>*</span>Nội dung công việc đã làm:
                </Col>
                <Col span={18}>
                  <MzFormInput
                    inputType="TextArea"
                    controllerProps={{
                      control,
                      name: 'content',
                      rules: { required: 'Vui lòng nhập nội dung công việc đã làm' },
                    }}
                    textAreaProps={{
                      placeholder: 'Nội dung công việc đã làm',
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={6} style={{}}>
                  <span style={{ color: 'red' }}>*</span>Kết quả thực hiện:
                </Col>
                <Col span={18}>
                  <MzFormInput
                    inputType="TextArea"
                    controllerProps={{
                      control,
                      name: 'result',
                      rules: { required: 'Vui lòng nhập kết quả công tác' },
                    }}
                    textAreaProps={{
                      placeholder: 'Kết quả thực hiện',
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={6} style={{}}>
                  <span style={{ color: 'red' }}>*</span>Đề xuất:
                </Col>
                <Col span={18}>
                  <MzFormInput
                    inputType="TextArea"
                    controllerProps={{
                      control,
                      name: 'propose',
                      rules: { required: 'Vui lòng nhập đề xuất' },
                    }}
                    textAreaProps={{
                      placeholder: 'Đề xuất',
                    }}
                  />
                </Col>
              </Row>
            </>
          ) : (
            <>
              <Row style={{ padding: '10px 0' }}>
                <Col span={6} style={{}}>
                  <span style={{ color: 'red' }}>*</span>Nội dung công việc đã làm:
                </Col>
                <Col span={18}>{watch('content')}</Col>
              </Row>
              <Row style={{ padding: '10px 0' }}>
                <Col span={6} style={{}}>
                  <span style={{ color: 'red' }}>*</span>Kết quả thực hiện:
                </Col>
                <Col span={18}>{watch('result')}</Col>
              </Row>
              <Row style={{ padding: '10px 0' }}>
                <Col span={6} style={{}}>
                  <span style={{ color: 'red' }}>*</span>Đề xuất:
                </Col>
                <Col span={18}>{watch('propose')}</Col>
              </Row>
            </>
          )}
        </Panel>
        <Panel header={<h3>Chi phí theo định mức</h3>} key={'3'}>
          <TableData
            tableProps={{
              columns: columns as any,
              dataSource: quotas,
              rowKey: '_id',
              expandable: {
                defaultExpandAllRows: true,
                expandRowByClick: true,
              },
              footer: () => (
                <Row>
                  <Col span={17}>
                    <h3>Tổng chi phí theo định mức:</h3>
                  </Col>
                  <Col span={7} style={{ paddingLeft: '20px' }}>
                    <h3>{formatMoney(total) || ''}</h3>
                  </Col>
                </Row>
              ),
            }}
          />
        </Panel>
        <Panel header={<h3>Chi phí có hóa đơn</h3>} key={'4'}>
          <TableData
            tableProps={{
              columns: columnsBill as any,
              dataSource: listBill,
              rowKey: 'id',
              footer: () => (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h3>
                    Tổng chi phí có hóa đơn:
                    {` ${formatMoney(totalBill)}`}
                  </h3>
                  {/* 
                    <Pagination
                        total={totalPage * 50}
                        onChange={(e) => getInvoiceRequest(e)}
                        pageSize={50}
                        showSizeChanger={false}
                    /> 
                    */}
                </div>
              ),
            }}
          />
        </Panel>
        <Panel header={<h3>Tổng chi phí</h3>} key={'5'}>
          <Row style={{ padding: '10px 0' }}>
            <Col>Tổng chi phí định mức:</Col>
            <span style={{ marginLeft: 10 }}>{formatNumber(total.toString().split('.')[0]) || 0} VNĐ</span>
          </Row>
          <Row style={{ padding: '10px 0' }}>
            <Col>Tổng chi phí hóa đơn:</Col>
            <span style={{ marginLeft: 10 }}>{formatNumber(totalBill.toString().split('.')[0]) || 0} VNĐ</span>
          </Row>
          <Row style={{ padding: '10px 0' }}>
            <Col>Số tiền đã tạm ứng:</Col>
            <span style={{ marginLeft: 10 }}>
              {formatNumber(required ? required.toString().split('.')[0] : 0) || 0} VNĐ
            </span>
          </Row>
          <Row style={{ padding: '10px 0' }}>
            <Col>{money > 0 ? 'Số tiền phải chi:' : 'Số tiền phải thu:'}</Col>
            <span style={{ marginLeft: 10 }}>
              {formatNumber(money.toString().split('.')[0]).toString().replace('-', '') || 0} VNĐ
            </span>
          </Row>
        </Panel>
      </Collapse>
    </>
  );
});

export default EndPlan;

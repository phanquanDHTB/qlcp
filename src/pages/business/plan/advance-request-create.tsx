import { Col, Collapse, Row, Select, Spin, Typography } from 'antd';
import type { RangePickerProps } from 'antd/es/date-picker';
import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';

import { ColumnsType } from 'antd/es/table';
import { FieldValues, useForm } from 'react-hook-form';
import { formatDate } from '@utils/formatDate';
import { MzFormInput } from '@components/forms/FormInput';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { MzFormInputNumber } from '@components/forms/FormNumber';
import TableData from '@components/TableData';
import { IDepartment, IPlan, IPlanCost, IUser, IplanRequired, IplanRequiredUser } from 'type';
import { IPlanRequiredContent, IPlanUserContent } from 'type/advance-request-sign-details';
import dayjs from 'dayjs';
import formatNumber from '@utils/formatNumber';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import Sign from '@components/Sign';
import { pdfSignPosition } from '../../../constants/enumConmon';
import {
  getCostRequestApi,
  getPlanApi,
  getPlanRequiredApi,
  getStaffApi,
} from '../../../apis/page/business/plan/plan-details-modal';
import { getFile } from '../../../apis/page/business/plan/cost-estimate-details';
import {
  AddAdvanceRequestApi,
  DownloadAdvanceRequestFile,
  UpdateAdvanceRequestApi,
  handleGetUserInfo
} from '../../../apis/page/business/plan/advance-request-create';
import { statusHandle } from '@utils/signIsStatus';
import { AlignType } from "rc-table/lib/interface";


const { Text } = Typography;

interface Props {
  status: number | null;
  idDetails: number | null;
  planCost?: number;
  onClosedModal: () => void;
  baseReload: () => void;
  handleGet: () => void;
  buttonLoading: () => void;
  buttonNotLoading: () => void;
  loadingDownloadButton: () => void;
  notLoadingDownloadButton: () => void;
  buttonAddLoading: () => void;
  buttonAddNotLoading: () => void;
}

interface ISendData {
  amount: number;
  approve_date?: string | dayjs.Dayjs | null;
  code?: string;
  department_process?: IDepartment;
  department_require?: IDepartment;
  total_estimated_amount?: number;
  description?: string;
  end_time?: string | dayjs.Dayjs;
  expired_time?: string;
  id?: number;
  ins_date?: string | dayjs.Dayjs;
  ins_id?: number;
  is_active?: boolean;
  name?: string;
  payment_name?: string;
  plan?: IPlan;
  plan_required_user?: IplanRequiredUser;
  plan_base?: string;
  plan_cost?: IPlanCost[];
  reason?: string;
  start_time?: string | dayjs.Dayjs;
  is_status?: number;
  status?: number;
  type?: number;
  upd_date?: string | dayjs.Dayjs;
  upd_id?: number;
  user_require?: IUser;
}

const AdvanceRequestCreateForm = forwardRef((props: Props, ref) => {
  const {
    idDetails,
    planCost,
    onClosedModal,
    baseReload,
    handleGet,
    buttonLoading,
    buttonNotLoading,
    loadingDownloadButton,
    notLoadingDownloadButton,
    buttonAddLoading,
    buttonAddNotLoading,
  } = props;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOpenModalLoginVO, setIsOpenModalLoginVO] = useState<boolean>(false);
  const [isLoginVOFFICE, setIsVOFFICE] = useState<boolean>(false);

  const [data, setData] = useState<IPlan>();
  const [departmentRequire, setDepartmentRequire] = useState<IDepartment>();
  const [departmentProcess, setDepartmentProcess] = useState<IDepartment>();
  const [totalAmount, setTotalAmount] = useState<number>();
  const [cost, setCost] = useState<IPlanCost[]>([]);
  const [planRequire, setPlanRequire] = useState<IplanRequired>();
  const [status, setStatus] = useState<number>();
  const [formAddData, setFormAddData] = useState<ISendData>();

  const [userList, setUserList] = useState<any>();
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [workPlanList, setWorkPlanList] = useState<any>([]);
  const [costFileList, setCostFileList] = useState<any>([]);
  const [signFileList, setSignFileList] = useState<any>([]);
  const [user, setUser] = useState<any>({});

  const { control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      type: 1,
      description: `VTP CHUYEN TIEN TAM UNG CONG TAC PHI THEO KE HOACH SO ${data?.code}`,
    } as any,
  });

  interface ColumnConfig {
    title: string;
    dataIndex: string;
    key: string;
    render?: (value: any) => JSX.Element;
  }

  const label1 = <Text strong>Thông tin chung</Text>;
  const label2 = <Text strong>Thông tin chuyển khoản tạm ứng</Text>;

  useEffect(() => {
    getUserInfo();
  }, []);
  const getUserInfo = async () => {
    const res = (await handleGetUserInfo()) as any;
    if (res.status == 'success') {
      setUser(res.data);
      console.log(res.data)
    }
  };

  const getData = async () => {
    try {
      const res = (await getPlanApi(idDetails)) as IPlan;
      setData(res);
      setDepartmentRequire(res.department_require);
      setDepartmentProcess(res.department_process);
      setStatus(res.status);
      setValue('description', `VTP CHUYEN TIEN TAM UNG CONG TAC PHI THEO KE HOACH SO ${data?.code}`);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const callBackGetCost = async () => {
    try {
      const res = (await getCostRequestApi(idDetails)) as any[];
      setCost(res);
      if (res.length === 0) {
        toast('Chưa tạo dự toán chi phí kế hoạch', { type: 'error' });
      } else {
        setTotalAmount(
          Math.round(res.reduce((accumulator, currentValue) => accumulator + currentValue.total_amount, 0))
        );
      }
    } catch (error) {
      toast(getMessageError(error), { type: 'error' });
    }
  };

  const getUserList = async () => {
    try {
      const res = (await getStaffApi(idDetails)) as IPlanUserContent;
      console.log(res, 'DATA');
      setUserList(res.content);
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const getPlanRequire = async () => {
    try {
      const res = (await getPlanRequiredApi(idDetails)) as IPlanRequiredContent;
      setPlanRequire(res.content[0]);
      console.log(res.content[0])
      if (res.content[0]) {
        setValue('amount', res.content[0]?.plan_required_user?.amount);
        setValue('description', res.content[0]?.description);
        setValue('expired_time', dayjs(res.content[0]?.expired_time));
        setSelectedUser(res.content[0]?.plan_required_user?.plan_user_id);
      }
    } catch (error) {
      console.log(error, 'e');
    }
  };

  const column: ColumnsType<ColumnConfig> = [
    {
      title: 'Mã nhân viên',
      dataIndex: 'code',
      key: 'Mã nhân viên',
      render: (value) => {
        return value;
      },
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'age',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (value) => {
        return <a href={`mailto:${value}`}>{value}</a>;
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (value) => {
        return <a href={`tel:+${value}`}>{value}</a>;
      },
    },
    {
      title: 'Số TK',
      dataIndex: 'account_number',
      key: 'account_number',
      render: (value) => {
        return value;
      },
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bank',
      key: 'bank',
      render: (value) => {
        return value;
      },
    },
    {
      title: 'Tổng số tiền',
      key: 'amount',
      align: 'right' as AlignType,
      render: () => {
        return formatNumber(amount) + ' VNĐ';
      },
    },
  ];

  const typeLabel = (type) => {
    switch (type) {
      case 1:
        return 'Nội địa';
      case 2:
        return 'Nước ngoài';
      default:
        return type;
    }
  };

  const formAdd = async (value: FieldValues) => {
    buttonAddLoading();
    if (!selectedUser) {
      toast("Vui lòng chọn thành viên", { type: "error" });
      buttonAddNotLoading()
    }
    const hasData = (await getPlanRequiredApi(idDetails)) as IPlanRequiredContent;
    try {
      const data1: ISendData = {
        amount: amount ? +amount : 0,
        approve_date: planRequire?.approve_date ? planRequire?.approve_date : undefined,
        code: data?.code,
        expired_time: dayjs(value.expired_time).toISOString(),
        department_process: departmentProcess,
        department_require: departmentRequire,
        total_estimated_amount: totalAmount,
        plan: data,
        id: hasData.content[0]?.id,
        plan_base: data?.code,
        plan_cost: cost,
        description: value.description,
        plan_required_user: {
          ...selectedUser,
          amount: amount ? +amount : 0,
          plan_user_id: { ...selectedUser },
        },

        name: 'Đề nghị chuyển khoản tạm ứng công tác phí cho kế hoạch số ' + data?.code,
        type: data?.type,
        reason: planRequire?.reason ? planRequire?.reason : undefined,
        is_status: hasData.content[0]?.is_status,
        status: hasData.content[0]?.status,
        user_require: user,
      };

      if (hasData.content.length > 0) {
        await UpdateAdvanceRequestApi(data1, idDetails);
        toast('Lưu thành công', { type: 'success' });
        buttonAddNotLoading();
      } else {
        await AddAdvanceRequestApi(data1);
        toast('Lưu thành công', { type: 'success' });
        buttonAddNotLoading();
      }
    } catch (error) {
      console.log(error);
      buttonAddNotLoading();
    }
  };

  const formAddAndLogin = async (value: FieldValues) => {
    buttonLoading();
    if (!selectedUser) {
      toast('Vui lòng chọn thành viên', { type: 'error' });
    }
    const hasData = (await getPlanRequiredApi(idDetails)) as IPlanRequiredContent;
    try {
      const data1: ISendData = {
        amount: amount ? +amount : 0,
        approve_date: planRequire?.approve_date ? planRequire?.approve_date : null,
        code: data?.code,
        expired_time: dayjs(value.expired_time).toISOString(),
        department_process: departmentProcess,
        department_require: departmentRequire,
        total_estimated_amount: totalAmount,
        plan: data,
        id: hasData.content[0]?.id,
        plan_base: data?.code,
        plan_cost: cost,
        description: value.description,
        plan_required_user: {
          ...selectedUser,
          amount: amount ? +amount : 0,
          plan_user_id: { ...selectedUser },
        },

        name: 'Đề nghị chuyển khoản tạm ứng công tác phí cho kế hoạch số ' + data?.code,
        type: data?.type,
        reason: planRequire?.reason ? planRequire?.reason : undefined,
        is_status: hasData.content[0]?.is_status,
        status: hasData.content[0]?.status,
        user_require: user,
      };
      if (hasData.content.length > 0) {
        await UpdateAdvanceRequestApi(data1, idDetails);
        toast('Lưu thành công', { type: 'success' });
        setFormAddData(data1)
        onOpenModalLoginVO();
        buttonNotLoading();
      } else {
        await AddAdvanceRequestApi(data1);
        toast('Lưu thành công', { type: 'success' });
        onOpenModalLoginVO();
        buttonNotLoading();
      }
    } catch (error) {
      console.log(error);
      buttonNotLoading();
    }
  };

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current <= dayjs().startOf('day');
  };

  const amount = watch('amount');

  const handleUserSelect = (value) => {
    const selectedUser = userList?.find((user) => user.id === value);
    if (selectedUser.account_number === null) {
      toast('Nhân viên nhận chuyển khoản tạm ứng chưa cập nhật số tài khoản', {
        type: 'error',
      });
      setSelectedUser(null);
    } else {
      setSelectedUser(selectedUser);
    }
  };

  const handleDownload = async () => {
    loadingDownloadButton();
    try {
      await DownloadAdvanceRequestFile(idDetails);
      notLoadingDownloadButton();
    } catch (err) {
      toast('Kế hoạch này không có file đề nghị chuyển khoản', {
        type: 'error',
      });
      notLoadingDownloadButton();
    }
  };

  useImperativeHandle(ref, () => ({
    submitInfor: () => {
      handleSubmit(formAdd)();
    },
    LoginVOffice: async () => {
      handleSubmit(formAddAndLogin)();
    },
    DownLoadTransferRequest: () => {
      handleDownload();
    },
    resetFields: () => {
      reset({});
    },
  }));

  const callbackGetFile = () => {
    if (planCost) {
      getFile(
        'export-pdf/cost-append/' + idDetails,
        `files/upload-voffice?position=${pdfSignPosition.PHU_LUC_CHI_PHI}`,
        (data) => setCostFileList(() => [data]),'phu_luc_chi_phi.pdf'
      );
      getFile(
        'export-pdf/advance-request-plan/' + idDetails,
        `files/upload-voffice?position=${pdfSignPosition.DE_NGHI_TAM_UNG}`,
        (data) => setSignFileList(() => [data]),
        'de_nghi_tam_ung.pdf'
      ); //2
        getFile(
          'export-pdf/work-plan/' + idDetails,
          `files/upload-voffice?position=${pdfSignPosition.KE_HOACH_CONG_TAC}`,
          (data) => setWorkPlanList(() => [data]),
          'ke_hoach_cong_tac.pdf'
        ); //1
    }
  };

  const onOpenModalLoginVO = () => {
    setIsVOFFICE(true);
  };

  const onCloseModalLoginVO = () => {
    setIsOpenModalLoginVO(false);
    setIsVOFFICE(false);
  };

  useEffect(() => {
    if (idDetails) {
      getData();
      getUserList();
      callBackGetCost();
      getPlanRequire();
    }
  }, [idDetails, data?.code]);

  return (
    <>
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '50vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div style={{ marginTop: '20px' }}>
          <Collapse defaultActiveKey={['1', '2']}>
            <Collapse.Panel header={label1} key="1">
              {isLoading ? (
                <div style={{ textAlign: 'center', marginTop: '10vh' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <>
                  <Row>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="advance-col">
                          <b>Người đề nghị:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          <p>{user ? user.full_name : '--'}</p>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={8} className="advance-col">
                          <b>Tên đề nghị:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          <p>Đề nghị chuyển khoản tạm ứng công tác phí cho kế hoạch số {data?.code}</p>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="advance-col">
                          <b>Trạng thái đề nghị tạm ứng:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          <p>{planRequire?.is_status !== null ? statusHandle(planRequire?.is_status) : "--"}</p>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={8} className="advance-col">
                          <b>Lý do KTNH từ chối:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          <p>{planRequire?.reason || '--'}</p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} className="advance-col">
                      <b>Đơn vị đề nghị:</b>
                    </Col>
                    <Col span={20} className="advance-col">
                      <p>{departmentProcess?.name || '--'}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="advance-col">
                          <b>Căn cứ kế hoạch số:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          <p>{data?.code || '--'}</p>
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="advance-col">
                          <b>Ngày:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          <p>{formatDate(planRequire?.approve_date) || '--'}</p>
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} className="advance-col">
                      <b>Hình thức công tác:</b>
                    </Col>
                    <Col span={20} className="advance-col">
                      <p>{typeLabel(data?.type) || '--'}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="advance-col">
                          <span style={{ color: 'red' }}>*</span>
                          <b>Số tiền yêu cầu:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          <MzFormInputNumber
                            controllerProps={{
                              control,
                              name: 'amount',
                              rules: {
                                required: 'Số tiền yêu cầu',
                                validate: () => {
                                  if (isNaN(amount)) {
                                    return 'Số tiền yêu cầu không hợp lệ';
                                  } else if (totalAmount ? amount > totalAmount : amount > 0) {
                                    return 'Số tiền yêu cầu không được phép lớn hơn số tiền tạm ứng tối đa';
                                  } else {
                                    return true;
                                  }
                                },
                              },
                            }}
                            inputNumberProps={{
                              min: '0',
                              style: { width: '100%', borderRadius: 0 },
                              placeholder: 'Số tiền yêu cầu',
                              formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                              parser: (value: any) => value?.replace(/\$\s?|(\.*)/g, ''),
                            }}
                          />
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="advance-col">
                          <b>Số tiền tạm ứng tối đa:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          {totalAmount ? formatNumber(Math.round(totalAmount)) + ' VNĐ' : '0 VNĐ'}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} className="advance-col">
                      <span style={{ color: 'red' }}>*</span>
                      <b>Thời hạn thanh toán:</b>
                    </Col>
                    <Col span={20} className="advance-col">
                      <MzFormDatePicker
                        controllerProps={{
                          control,
                          name: 'expired_time',
                          rules: { required: 'Vui lòng nhập thời hạn thanh toán' },
                        }}
                        datePickerProps={{
                          placeholder: 'Ngày thanh toán',
                          format: 'DD/MM/YYYY',
                          disabledDate: disabledDate,
                        }}
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} className="advance-col">
                      <span style={{ color: 'red' }}>*</span>
                      <b>Diễn giải chi tiết:</b>
                    </Col>
                    <Col span={20} className="advance-col">
                      <MzFormInput
                        controllerProps={{
                          control,
                          name: 'description',
                          rules: {
                            required: 'Vui lòng nhập diễn giải chi tiết',
                            validate: (value) => {
                              if (value.length > 95) {
                                return 'Không được phép nhập quá 95 kí tự';
                              } else if (/[^a-zA-Z\s0-9]/.test(value)) {
                                return 'Vui lòng nhập chữ không dấu';
                              } else {
                                return true;
                              }
                            },
                          },
                        }}
                        inputType="TextArea"
                        inputProps={{
                          placeholder: 'Diễn giải chi tiết',
                        }}
                      />
                    </Col>
                  </Row>
                </>
              )}
            </Collapse.Panel>
            <Collapse.Panel header={label2} key="2">
              {isLoading ? (
                <div style={{ textAlign: 'center', marginTop: '10vh' }}>
                  <Spin size="large" />
                </div>
              ) : (
                <>
                  <span style={{ color: 'red' }}>*</span>
                  <Text strong style={{ margin: 10 }}>
                    Chọn thành viên
                  </Text>
                  <Row>
                    <Col span={7}>
                      <Select
                        onChange={handleUserSelect}
                        placeholder="Chọn thành viên"
                        showSearch
                        optionFilterProp="children"
                        filterOption={(input, option) => {
                          const children = option?.props.children;
                          if (children && typeof children === 'string') {
                            return children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
                          }
                          return false;
                        }}
                        value={selectedUser}
                        style={{ width: '100%', marginBottom: '20px' }}
                      >
                        {userList
                          ?.filter((u) => u.type === 1)
                          .map((user) => (
                            <Select.Option key={user.id} value={user.id}>
                              {user.name}
                            </Select.Option>
                          ))}
                      </Select>
                    </Col>
                  </Row>
                  <TableData
                    tableProps={{
                      rowKey: '_id',
                      dataSource: selectedUser ? [selectedUser] : [],
                      columns: column,
                    }}
                  />
                </>
              )}
            </Collapse.Panel>
          </Collapse>

          {data?.is_add == false ? (
            <div>
              <Sign
                formAddData={formAddData}
                position={[4, 1, 2, 3]}
                openLogin={isLoginVOFFICE}
                openSign={isOpenModalLoginVO}
                listFile1={[...signFileList, ...workPlanList]}
                moneyStatus={1}
                listFile2={costFileList}
                endPlan={data}
                callbackClose={() => {
                  setIsVOFFICE(false);
                }}
                closeModal={() => {
                  handleGet();
                  // onClosedModal()
                  baseReload();
                }}
                callbackGetFile={callbackGetFile}
                planStatusNum={status}
              />
            </div>
          ) : (
            <Sign
              formAddData={formAddData}
              isAdd={false}
              openSign={isOpenModalLoginVO}
              listFile1={[...signFileList, ...workPlanList]}
              moneyStatus={1}
              listFile2={costFileList}
              endPlan={data}
              callbackClose={() => {
                buttonNotLoading();
                onCloseModalLoginVO();
              }}
              closeModal={() => {
                buttonNotLoading();
                onClosedModal();
                baseReload();
              }}
              callbackGetFile={callbackGetFile}
              planStatusNum={status}
            />
          )}
        </div>
      )}
    </>
  );
});

export default AdvanceRequestCreateForm;

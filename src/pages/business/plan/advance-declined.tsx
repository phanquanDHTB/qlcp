import { Col, Collapse, Row, Select, Spin, Typography } from 'antd';
import React, { useEffect, useState, useImperativeHandle, forwardRef } from 'react';

import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { FieldValues, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import TableData from '@components/TableData';
import { IDepartment, IPlan, IPlanCost, IUser, IplanRequired, IplanRequiredUser } from 'type';
import { IPlanRequiredContent, IStaff, IStaffContent } from 'type/advance-request-sign-details';
import { AlignType } from "rc-table/lib/interface";

import getMessageError from '@utils/getMessageError';
import { formatDate } from '@utils/formatDate';
import formatNumber from '@utils/formatNumber';
import Sign from '@components/Sign';
import { pdfSignPosition } from '../../../constants/enumConmon';
import {
  getCostRequestApi,
  getPlanApi,
  getPlanRequiredApi,
  getStaffApi,
} from '../../../apis/page/business/plan/plan-details-modal';
import { downloadFileSign } from '../../../apis/page/business/plan/advance-request-sign-details';
import { getFile } from '../../../apis/page/business/plan/cost-estimate-details';
import { AddAdvanceRequestApi, UpdateAdvanceRequestApi, handleGetUserInfo } from '../../../apis/page/business/plan/advance-request-create';

import { statusHandle } from '@utils/signIsStatus';

const { Text } = Typography;

interface Props {
  status: number | undefined;
  idDetails: number | null;
  buttonLoading: () => void;
  buttonNotLoading: () => void;
  loadingDownloadButton: () => void;
  notLoadingDownloadButton: () => void;
  buttonAddNotLoading: () => void;
  buttonAddLoading: () => void;
}

interface ColumnConfig {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any) => React.ReactNode;
}

interface ISendData {
  amount?: number;
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

const AdvanceDeclinedModal = forwardRef((props: Props, ref) => {
  const {
    idDetails,
    buttonLoading,
    buttonNotLoading,
    loadingDownloadButton,
    notLoadingDownloadButton,
    buttonAddNotLoading,
    buttonAddLoading,
  } = props;

  const [isLoading, setIsLoading] = useState(true);
  const [isOpenModalLoginVO, setIsOpenModalLoginVO] = useState(false);
  const [isLoginVOFFICE, setIsVOFFICE] = useState(false);

  const [data, setData] = useState<IPlan>();
  const [departmentRequire, setDepartmentRequire] = useState<IDepartment>();
  const [departmentProcess, setDepartmentProcess] = useState<IDepartment>();
  const [totalAmount, setTotalAmount] = useState<number>();
  const [cost, setCost] = useState<IPlanCost[]>([]);
  const [planRequire, setPlanRequire] = useState<IplanRequired>();
  const [requiredAmount, setRequiredAmount] = useState<number>();
  const [expiredtime, setExpiredTime] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [status, setStatus] = useState<number>();

  const [userList, setUserList] = useState<IStaff[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [signFileList, setSignFileList] = useState<any>([]);
  const [user, setUser] = useState<any>({});

  const { handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: {
      type: 1,
      description: `VTP CHUYEN TIEN TAM UNG CONG TAC PHI THEO KE HOACH SO ${data?.code}`,
    } as any,
  });

  const label1 = <Text strong>Thông tin chung</Text>;
  const label2 = <Text strong>Thông tin chuyển khoản tạm ứng</Text>;

  useEffect(() => {
    getUserInfo();
  }, []);
  const getUserInfo = async () => {
    const res = (await handleGetUserInfo()) as any;
    if (res.status == 'success') {
      setUser(res.data);
    }
  };

  const callBackGetData = async () => {
    try {
      const res = (await getPlanApi(idDetails)) as IPlan;
      setData(res);
      setDepartmentRequire(res.department_require);
      setDepartmentProcess(res.department_process);
      setStatus(res.status);
      setValue('description', `VTP CHUYEN TIEN TAM UNG CONG TAC PHI THEO KE HOACH SO ${data?.code}`);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const callBackCostRequest = async () => {
    try {
      const res = (await getCostRequestApi(idDetails)) as IPlanCost[];
      setCost(res);
      if (res.length === 0) {
        toast('Chưa tạo dự toán chi phí kế hoạch', { type: 'error' });
      } else {
        setTotalAmount(res.reduce((accumulator, currentValue) => accumulator + (currentValue.total_amount ?? 0), 0));
      }
    } catch (error) {
      toast(getMessageError(error), { type: 'error' });
    }
  };

  const callBackGetUser = async () => {
    try {
      const res = (await getStaffApi(idDetails)) as IStaffContent;
      setUserList(res.content);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };


  const callBackPlanRequire = async () => {
    try {
      const res = (await getPlanRequiredApi(idDetails)) as IPlanRequiredContent;
      setPlanRequire(res?.content[0]);
      setRequiredAmount(res.content[0]?.plan_required_user?.amount);
      setExpiredTime(formatDate(res.content[0]?.expired_time));
      setDescription(res.content[0]?.description);
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
        return value;
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone_number',
      key: 'phone_number',
      render: (value) => {
        return value;
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
      toast('Vui lòng chọn thành viên', { type: 'error' });
    }
    try {
      const hasData = (await getPlanRequiredApi(idDetails)) as IPlanRequiredContent;
      const data1: ISendData = {
        amount: +amount,
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
        plan_required_user: { ...selectedUser, amount: +amount, plan_user_id: { ...selectedUser } },

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
      toast(getMessageError(error), { type: 'error' });
      buttonAddNotLoading();
    }
  };

  const formAddAndLogin = async (value: FieldValues) => {
    buttonLoading();
    if (!selectedUser) {
      toast('Vui lòng chọn thành viên', { type: 'error' });
    }
    try {
      const hasData = (await getPlanRequiredApi(idDetails)) as IPlanRequiredContent;
      const data1: ISendData = {
        amount: +amount,
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
        plan_required_user: { ...selectedUser, amount: +amount, plan_user_id: { ...selectedUser } },
        name: 'Đề nghị chuyển khoản tạm ứng công tác phí cho kế hoạch số ' + data?.code,
        type: data?.type,
        reason: planRequire?.reason ? planRequire?.reason : undefined,
        // isStatus: status,
        is_status: hasData.content[0]?.is_status,
        status: hasData.content[0]?.status,
        user_require: user,
      };
      if (hasData.content.length > 0) {
        await UpdateAdvanceRequestApi(data1, idDetails);
        toast('Lưu thành công', { type: 'success' });
        onOpenModalLoginVO();
        buttonNotLoading();
      } else {
        await AddAdvanceRequestApi(data1);
        toast('Lưu thành công', { type: 'success' });
        onOpenModalLoginVO();
        buttonNotLoading();
      }
    } catch (error) {
      buttonNotLoading();
    }
  };

  const amount = watch('amount');

  const handleUserSelect = (value) => {
    const selectedUser = userList?.find((user) => user.id === value);
    if (selectedUser?.account_number === null) {
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
      await downloadFileSign(idDetails);
      notLoadingDownloadButton();
    } catch (err) {
      console.log(err);
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

  const onOpenModalLoginVO = () => {
    setIsVOFFICE(true);
  };

  const onCloseModalLoginVO = () => {
    setIsOpenModalLoginVO(false);
    setIsVOFFICE(false);
  };

  const callbackGetFile = () => {
    getFile(
      'export-pdf/advance-request-remake?planId=' +
        idDetails +
        `&nameUser=${encodeURIComponent(selectedUser.name)}
           &accountNumber=${selectedUser.account_number}
           &bankName=${encodeURIComponent(selectedUser.bank)}&proof=`,
      `files/upload-voffice?position=${pdfSignPosition.DE_NGHI_CHUYEN_KHOAN_DO_SAI_THONG_TIN_TAI_KHOAN}`,
      (data) => setSignFileList(() => [data]),
      'DE_NGHI_CHUYEN_KHOAN_DO_SAI_THONG_TIN_TAI_KHOAN.pdf'
    ); //2
  };

  useEffect(() => {
    if (idDetails) {
      callBackGetData();
      callBackGetUser();
      callBackCostRequest();
      callBackPlanRequire();
    }
  }, [idDetails, data?.code]);

  return (
    <div>
      {isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '50vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
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
                          <p>{planRequire?.is_status != null ? statusHandle(planRequire?.is_status) : "--"}</p>
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
                          <b>Số tiền yêu cầu:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          {requiredAmount ? formatNumber(requiredAmount) : '--'}
                        </Col>
                      </Row>
                    </Col>
                    <Col span={12}>
                      <Row>
                        <Col span={8} className="advance-col">
                          <b>Số tiền tạm ứng tối đa:</b>
                        </Col>
                        <Col span={15} className="advance-col">
                          {totalAmount ? formatNumber(totalAmount) + ' VNĐ' : '0 VNĐ'}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} className="advance-col">
                      <b>Thời hạn thanh toán:</b>
                    </Col>
                    <Col span={20} className="advance-col">
                      {expiredtime ? expiredtime : '--'}
                    </Col>
                  </Row>
                  <Row>
                    <Col span={4} className="advance-col">
                      <b>Diễn giải chi tiết:</b>
                    </Col>
                    <Col span={20} className="advance-col">
                      {description}
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
                  <Text strong>Chọn thành viên</Text>
                  <Row>
                    <Col span={7}>
                      <Select
                        onChange={handleUserSelect}
                        placeholder="Select a user"
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
                        style={{ width: '100%' }}
                      >
                        {userList.map((user) => (
                          <Select.Option key={user.id} value={user.id}>
                            {user.name}
                          </Select.Option>
                        ))}
                      </Select>
                    </Col>
                  </Row>
                  <TableData
                    tableProps={{ dataSource: selectedUser ? [selectedUser] : [], columns: column, pagination: false }}
                  />
                </>
              )}
            </Collapse.Panel>
          </Collapse>
          {data?.is_add == false ? (
            <Sign
              position={[1, 4, 3, 2]}
              openLogin={isLoginVOFFICE}
              openSign={isOpenModalLoginVO}
              listFile1={signFileList}
              moneyStatus={1}
              listFile2={[]}
              endPlan={data}
              callbackClose={() => {
                setIsVOFFICE(false);
              }}
              callbackGetFile={callbackGetFile}
              planStatusNum={status}
            />
          ) : (
            <Sign
              position={[1, 4, 3, 2]}
              isAdd={false}
              openSign={isOpenModalLoginVO}
              listFile1={signFileList}
              moneyStatus={1}
              listFile2={[]}
              endPlan={data}
              callbackClose={() => {
                onCloseModalLoginVO();
              }}
              callbackGetFile={callbackGetFile}
              planStatusNum={status}
            />
          )}
        </>
      )}
    </div>
  );
});

export default AdvanceDeclinedModal;

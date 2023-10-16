import { Checkbox, Col, Row, Modal, Steps, Button, Typography, Spin } from 'antd';
import { useState, useEffect, useRef } from 'react';
import { v4 } from 'uuid';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { IDepartment, IPlan, IPurpose, IUser } from 'type';
import { IPlanRequiredContent } from 'type/advance-request-sign-details';
import { formatDate } from '@utils/formatDate';

import { getInforPlanApi, getPlanApi, getPlanRequiredApi } from '../../../apis/page/business/plan/plan-details-modal';

import StaffInformationModal from './staff-information-modal';

import { PlanRouteDetails } from './plan-route-details-modal';
import InvoiceInfor from './invoicesModal';
import ConfirmInfo from './confirm-info';
import CostEstimateDetails from './cost-estimate-detail';
import { AdvanceRequest } from './advance-request-details';
import { AdvanceRequestSignModal } from './advance-request-sign-details';
import AdvanceRequestCreateForm from './advance-request-create';
import EndPlan from './end-plan';
import AdvanceDeclinedModal from './advance-declined';
import { AdvanceRequestStatus, CurrentPlanDetailsModalScreen, planStatus } from '../../../constants/enumConmon';
import { getInforUserRequest } from '../../../apis/page/business/plan/infor-modal';

interface IProps {
  open: boolean;
  onOK: () => void;
  title: string;
  onCancel: () => void;
  idDetails: number | null;
  baseReload: any;
}

const { Text } = Typography;
const PlanDetailsModal = (props: IProps) => {
  const advanceRequestRef = useRef<{
    submitInfor: () => void;
    LoginVOffice: () => void;
    DownLoadTransferRequest: () => void;
  }>();
  const advanceDeclinedRef = useRef<{
    submitInfor: () => void;
    LoginVOffice: () => void;
    DownLoadTransferRequest: () => void;
  }>();
  const CostEstimateRef = useRef<{
    SignModalOpen: () => void;
    watchOf: () => void;
  }>();

  const [data, setData] = useState<IPlan>();
  const [purpose, setPurpose] = useState<IPurpose>();
  const [parent, setParent] = useState<IPlan>();
  const [departmentRequire, setDepartmentRequire] = useState<IDepartment>();
  const [userRequire, setUserRequire] = useState<IUser>();
  const [departmentProcess, setDepartmentProcess] = useState<IDepartment>();
  const [userProcess, setUserProcess] = useState<IUser>();
  const [isAddPlan, setIsAddPlan] = useState<boolean>();
  const [isStatus, setIsStatus] = useState<number>();
  const [reason, setReason] = useState<string>();

  const [isOpenModalAdvanceRequestSign, setisOpenModalAdvanceRequestSign] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [buttonDownloadLoading, setButtonDownloadLoading] = useState(false);
  const [buttonAddLoading, setButtonAddLoading] = useState(false);

  const [current, setCurrent] = useState<number>(0);
  const [listStepsInfor, setListStepsInfor] = useState<{ title: string; status: 'process' | 'wait' }[]>([
    { title: 'Thông tin chung', status: 'process' },
    { title: 'Thông tin cán bộ', status: 'process' },
    { title: 'Thông tin lộ trình', status: 'process' },
    { title: 'Dự toán chi phí', status: 'process' },
    { title: 'Đề nghị tạm ứng', status: 'process' },
    { title: 'Xác nhận công tác', status: 'process' },
    { title: 'Hóa đơn', status: 'process' },
    { title: 'Kết thúc công tác', status: 'process' },
  ]);

  //////loading nut Add, Add va Login, Download Trinh ky

  //add va login
  const loadingButton = () => {
    setButtonLoading(true);
  };
  const notLoadingButton = () => {
    setButtonLoading(false);
  };

  //   Download Trinh ky
  const loadingDownloadButton = () => {
    setButtonDownloadLoading(true);
  };
  const notLoadingDownloadButton = () => {
    setButtonDownloadLoading(false);
  };

  //loading nut Add
  const loadingAddbutton = () => {
    setButtonAddLoading(true);
  };
  const notLoadingAddbutton = () => {
    setButtonAddLoading(false);
  };
  ///////////////////////////////////////////////////////
  const onChangeSteps = (value: number) => {
    setListStepsInfor((prevListSteps) => {
      const newListSteps = prevListSteps.map((step, index) => {
        if (index === value) {
          return { ...step, status: 'process' as const };
        } else if (index < value) {
          return { ...step, status: 'wait' as const };
        } else {
          return { ...step, status: 'wait' as const };
        }
      });

      return newListSteps;
    });

    setCurrent(value);
  };

  const { open, onOK, onCancel, idDetails, baseReload } = props;

  const onOpenModalAdvanceRequestSign = () => {
    setisOpenModalAdvanceRequestSign(true);
  };

  const onCloseModalAdvanceRequestSign = () => {
    setisOpenModalAdvanceRequestSign(false);
  };

  useEffect(() => {
    if (idDetails) {
      getPlan();
      getPlanRequired();
    } else {
      setCurrent(0);
      onChangeSteps(0);
    }
  }, [idDetails]);

  const [planCost, setPlanCost] = useState<any>(0);

  const getPlanRequired = async () => {
    setIsLoading(true);
    try {
      const res = (await getPlanRequiredApi(idDetails)) as IPlanRequiredContent;
      setReason(res.content[0]?.reason);
      setIsStatus(res.content[0]?.is_status);
      setIsLoading(false);
    } catch (error) {
      toast(getMessageError(error), { type: 'error' });
      setIsLoading(false);
    }
  };

  const getPlan = async () => {
    try {
      const res = (await getPlanApi(idDetails)) as any;
      const status = res.status;
      const isAdd = res.is_add;
      setIsAddPlan(res.is_add);

      getPlanRequired();

      if ((status === planStatus.init || status === planStatus.refuse_approve) && isAdd === true) {
        setListStepsInfor([
          { title: 'Thông tin chung', status: 'process' },
          { title: 'Thông tin cán bộ', status: 'wait' },
          { title: 'Thông tin lộ trình', status: 'wait' },
          { title: 'Dự toán chi phí', status: 'wait' },
        ]);
      } else if (
        status < planStatus.waiting_confirm_result_work &&
        status !== planStatus.done_approve &&
        planCost !== 0
      ) {
        setListStepsInfor([
          { title: 'Thông tin chung', status: 'process' },
          { title: 'Thông tin cán bộ', status: 'wait' },
          { title: 'Thông tin lộ trình', status: 'wait' },
          { title: 'Dự toán chi phí', status: 'wait' },
          { title: 'Đề nghị tạm ứng', status: 'wait' },
        ]);
      } else if (status < planStatus.waiting_confirm_result_work && status !== planStatus.done_approve) {
        setListStepsInfor([
          { title: 'Thông tin chung', status: 'process' },
          { title: 'Thông tin cán bộ', status: 'wait' },
          { title: 'Thông tin lộ trình', status: 'wait' },
          { title: 'Dự toán chi phí', status: 'wait' },
          { title: 'Đề nghị tạm ứng', status: 'wait' },
        ]);
      } else if (status === planStatus.waiting_confirm_result_work || status === planStatus.done_approve) {
        setListStepsInfor([
          { title: 'Thông tin chung', status: 'process' },
          { title: 'Thông tin cán bộ', status: 'wait' },
          { title: 'Thông tin lộ trình', status: 'wait' },
          { title: 'Dự toán chi phí', status: 'wait' },
          { title: 'Đề nghị tạm ứng', status: 'wait' },
          { title: 'Xác nhận công tác', status: 'wait' },
          { title: 'Hóa đơn', status: 'wait' },
        ]);
      } else if (status > planStatus.waiting_confirm_result_work) {
        setListStepsInfor([
          { title: 'Thông tin chung', status: 'process' },
          { title: 'Thông tin cán bộ', status: 'wait' },
          { title: 'Thông tin lộ trình', status: 'wait' },
          { title: 'Dự toán chi phí', status: 'wait' },
          { title: 'Đề nghị tạm ứng', status: 'wait' },
          { title: 'Xác nhận công tác', status: 'wait' },
          { title: 'Hóa đơn', status: 'wait' },
          { title: 'Kết thúc công tác', status: 'wait' },
        ]);
      }
      setIsLoading(false);
      setData({ ...res });
      console.log(data, 'Data');

      setPurpose({ ...res.purpose });
      setParent({ ...res.parent });
      setDepartmentRequire({ ...res.department_require });
      setUserRequire({ ...res.user_require });
      setDepartmentProcess({ ...res.department_process });
      setUserProcess({ ...res.user_process });
      setIsLoading(false);
      await getInforPlan();
    } catch (error) {
      setIsLoading(false);
      toast('Error', { type: 'error' });
    }
  };

  const [addConfirm, setAddConfirm] = useState(false);
  const confirmInforRef = useRef<{
    isConfirm: boolean;
    openModal: () => void;
  }>();

  const endPlanRef = useRef<{
    addReportPlan: () => void;
    moneyStatus?: number;
    isAdd: boolean;
    openPaymentModal: () => void;
    // eslint-disable-next-line @typescript-eslint/ban-types
    sign: () => {};
    viewSign: () => void;
  }>();

  const renderButtonEndPlan = () => {
    if (add) {
      if (endPlanRef.current?.moneyStatus === 2) {
        return [
          <Button key={1} onClick={onCancel}>
            Đóng
          </Button>,
          <Button
            type={'primary'}
            key={3}
            onClick={endPlanRef.current.addReportPlan}
            disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
          >
            Lưu
          </Button>,
          <Button
            type={'primary'}
            key={2}
            onClick={() => endPlanRef.current?.openPaymentModal()}
            disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
          >
            Tạo đề nghị chi
          </Button>,
          data?.status === planStatus.confirm_result_work || data?.status === planStatus.refuse_end_work ? (
            <Button
              type={'primary'}
              key={4}
              onClick={() => endPlanRef.current?.sign()}
              disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
            >
              Trình ký
            </Button>
          ) : (
            <Button type={'primary'} key={5} onClick={() => endPlanRef.current?.viewSign()}>
              Xem trình ký
            </Button>
          ),
        ];
      } else if (endPlanRef.current?.moneyStatus === 1) {
        return [
          <Button key={1} onClick={onCancel}>
            Đóng
          </Button>,
          <Button
            type={'primary'}
            key={3}
            onClick={endPlanRef.current?.addReportPlan}
            disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
          >
            Lưu
          </Button>,
          <Button
            type={'primary'}
            key={2}
            onClick={() => endPlanRef.current?.openPaymentModal()}
            disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
          >
            Tạo đề nghị hoàn ứng
          </Button>,
          data?.status === planStatus.confirm_result_work || data?.status === planStatus.refuse_end_work ? (
            <Button
              type={'primary'}
              key={4}
              onClick={() => endPlanRef.current?.sign()}
              disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
            >
              Trình ký
            </Button>
          ) : (
            <Button type={'primary'} key={5} onClick={() => endPlanRef.current?.viewSign()}>
              Xem trình ký
            </Button>
          ),
        ];
      } else {
        return [
          <Button key={1} onClick={onCancel}>
            Đóng
          </Button>,
          data?.status === planStatus.confirm_result_work || data?.status === planStatus.refuse_end_work ? (
            <Button
              type={'primary'}
              key={4}
              onClick={() => endPlanRef.current?.sign()}
              disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
            >
              Trình ký
            </Button>
          ) : (
            <Button type={'primary'} key={5} onClick={() => endPlanRef.current?.viewSign()}>
              Xem trình ký
            </Button>
          ),
        ];
      }
    } else {
      if (endPlanRef.current?.moneyStatus === 2) {
        return [
          <Button key={1} onClick={onCancel}>
            Đóng
          </Button>,
          data?.status === planStatus.confirm_result_work || data?.status === planStatus.refuse_end_work ? (
            <Button
              type={'primary'}
              key={3}
              onClick={endPlanRef.current.addReportPlan}
              disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
            >
              Lưu
            </Button>
          ) : (
            <></>
          ),
          <Button type={'primary'} key={2} onClick={() => endPlanRef.current?.openPaymentModal()}>
            Xem đề nghị chi
          </Button>,
          data?.status === planStatus.confirm_result_work || data?.status === planStatus.refuse_end_work ? (
            <Button
              type={'primary'}
              key={4}
              onClick={() => endPlanRef.current?.sign()}
              disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
            >
              Trình ký
            </Button>
          ) : (
            <Button type={'primary'} key={5} onClick={() => endPlanRef.current?.viewSign()}>
              Xem trình ký
            </Button>
          ),
        ];
      } else if (endPlanRef.current?.moneyStatus === 1) {
        return [
          <Button key={1} onClick={onCancel}>
            Đóng
          </Button>,
          data?.status === planStatus.confirm_result_work || data?.status === planStatus.refuse_end_work ? (
            <Button
              type={'primary'}
              key={3}
              onClick={endPlanRef.current.addReportPlan}
              disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
            >
              Lưu
            </Button>
          ) : (
            <></>
          ),
          <Button type={'primary'} key={2} onClick={() => endPlanRef.current?.openPaymentModal()}>
            Xem đề nghị hoàn ứng
          </Button>,
          data?.status === planStatus.confirm_result_work || data?.status === planStatus.refuse_end_work ? (
            <Button
              type={'primary'}
              key={4}
              onClick={() => endPlanRef.current?.sign()}
              disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
            >
              Trình ký
            </Button>
          ) : (
            <Button type={'primary'} key={5} onClick={() => endPlanRef.current?.viewSign()}>
              Xem trình ký
            </Button>
          ),
        ];
      } else {
        return [
          <Button key={1} onClick={onCancel}>
            Đóng
          </Button>,
          data?.status === planStatus.confirm_result_work || data?.status === planStatus.refuse_end_work ? (
            <Button
              type={'primary'}
              key={4}
              onClick={() => endPlanRef.current?.sign()}
              disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
            >
              Trình ký
            </Button>
          ) : (
            <Button type={'primary'} key={5} onClick={() => endPlanRef.current?.viewSign()}>
              Xem trình ký
            </Button>
          ),
        ];
      }
    }
  };

  const [endPlanButton, setEndPlanButton] = useState<any>();
  const [add, setAdd] = useState<any>();
  const [isVisible, setIsViSible] = useState(false);

  useEffect(() => {
    setEndPlanButton(renderButtonEndPlan());
  }, [add]);

  const handleCancel = () => {
    setIsViSible(false);
  };

  const [user, setUser] = useState<any>({});
  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    const res = (await getInforUserRequest()) as any;

    if (res.status == 'success') {
      setUser(res.data);
    }
  };

  const renderFooterButtons = () => {
    if (current === 3 && (data?.is_add === true || planCost === 0)) {
      return [
        data?.status === planStatus.init || data?.status === planStatus.refuse_approve ? (
          <Button
            onClick={() => {
              CostEstimateRef.current?.SignModalOpen();
            }}
            type={'primary'}
            key={v4()}
            disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
          >
            Trình ký
          </Button>
        ) : (
          <Button
            key={4}
            type={'primary'}
            onClick={() => {
              CostEstimateRef.current?.watchOf();
            }}
          >
            Xem trình ký
          </Button>
        ),
        <Button onClick={onCancel} key={v4()}>
          Đóng
        </Button>,
      ];
    } else if (
      current === CurrentPlanDetailsModalScreen.THONG_TIN_CHUNG ||
      current === CurrentPlanDetailsModalScreen.THONG_TIN_CAN_BO ||
      current === CurrentPlanDetailsModalScreen.THONG_TIN_LO_TRINH ||
      (current === CurrentPlanDetailsModalScreen.DU_TOAN_CHI_PHI && data?.is_add === false)
    ) {
      return [
        <Button onClick={onCancel} key={v4()} type={'primary'}>
          Đóng
        </Button>,
      ];
    } else if (
      current === CurrentPlanDetailsModalScreen.DE_NGHI_TAM_UNG &&
      data?.status === planStatus.refuse_approve
    ) {
      return [
        <Button
          onClick={() => {
            advanceRequestRef.current?.submitInfor();
          }}
          type={'primary'}
          key={v4()}
          disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
        >
          Lưu
        </Button>,
        <Button
          loading={buttonLoading}
          onClick={() => {
            advanceRequestRef.current?.LoginVOffice();
          }}
          type={'primary'}
          key={v4()}
          disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
        >
          Lưu và trình ký
        </Button>,
        <Button
          loading={buttonDownloadLoading}
          onClick={() => {
            advanceRequestRef.current?.DownLoadTransferRequest();
          }}
          type={'primary'}
          key={v4()}
        >
          Tải về đề nghị chuyển khoản
        </Button>,
        <Button onClick={onCancel} key={v4()}>
          Hủy
        </Button>,
      ];
    } else if (
      current === CurrentPlanDetailsModalScreen.DE_NGHI_TAM_UNG &&
      isStatus === AdvanceRequestStatus.TU_CHOI_PHE_DUYET
    ) {
      return [
        <Button
          loading={buttonAddLoading}
          onClick={() => {
            advanceDeclinedRef.current?.submitInfor();
          }}
          type={'primary'}
          key={v4()}
          disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
        >
          Lưu
        </Button>,
        <Button
          loading={buttonLoading}
          onClick={() => {
            advanceDeclinedRef.current?.LoginVOffice();
          }}
          type={'primary'}
          key={v4()}
          disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
        >
          Lưu và trình ký
        </Button>,
        <Button
          loading={buttonDownloadLoading}
          onClick={() => {
            advanceDeclinedRef.current?.DownLoadTransferRequest();
          }}
          type={'primary'}
          key={v4()}
          disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
        >
          Tải về đề nghị chuyển khoản
        </Button>,
        <Button onClick={onCancel} key={v4()}>
          Hủy
        </Button>,
      ];
    } else if (
      current === CurrentPlanDetailsModalScreen.DE_NGHI_TAM_UNG &&
      data?.status &&
      data?.status > planStatus.init &&
      planCost > 0
    ) {
      return [
        <Button onClick={onCancel} key={v4()}>
          Trở lại
        </Button>,
        <Button onClick={onOpenModalAdvanceRequestSign} type={'primary'} key={v4()}>
          Xem trình ký
        </Button>,
        <AdvanceRequestSignModal
          title="Chi tiết trình ký"
          open={isOpenModalAdvanceRequestSign}
          onCloseModalAdvanceRequestSign={() => {
            onCloseModalAdvanceRequestSign();
          }}
          idDetails={idDetails}
        />,
      ];
    } else if (current === CurrentPlanDetailsModalScreen.DE_NGHI_TAM_UNG && data?.status === planStatus.init) {
      return [
        <Button
          loading={buttonAddLoading}
          onClick={() => {
            advanceRequestRef.current?.submitInfor();
          }}
          type={'primary'}
          key={v4()}
          disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
        >
          Lưu
        </Button>,
        <Button
          loading={buttonLoading}
          onClick={() => {
            advanceRequestRef.current?.LoginVOffice();
          }}
          type={'primary'}
          key={v4()}
          disabled={user?.id === data?.ins_id || user?.id === data?.user_process?.id ? false : true}
        >
          Lưu và trình ký
        </Button>,
        <Button
          loading={buttonDownloadLoading}
          onClick={() => {
            advanceRequestRef.current?.DownLoadTransferRequest();
          }}
          type={'primary'}
          key={v4()}
        >
          Tải về đề nghị chuyển khoản
        </Button>,
        <Button onClick={onCancel} key={v4()}>
          Hủy
        </Button>,
      ];
    } else if (current === CurrentPlanDetailsModalScreen.XAC_NHAN_CONG_TAC) {
      return [
        addConfirm ? (
          <Button
            type="primary"
            onClick={() => confirmInforRef.current?.openModal()}
            disabled={(user?.id === data?.ins_id || user?.id === data?.user_process?.id) ? false : true}
          >
            {' '}
            + Xác nhận công tác
          </Button>
        ) : (
          ''
        ),
        <Button onClick={onCancel} key={v4()}>
          Đóng
        </Button>,
      ];
    } else if (current === CurrentPlanDetailsModalScreen.KET_tHUC_CONG_TAC) {
      return endPlanButton;
    } else {
      return [
        <Button onClick={onOK} type={'primary'} key={v4()}>
          Đóng
        </Button>,
      ];
    }
  };

  const statusLabel = (status: number) => {
    switch (status) {
      case 1:
        return 'Khởi tạo';
      case 2:
        return 'Chờ phê duyệt';
      case 3:
        return 'Đã phê duyệt';
      case 4:
        return 'Từ chối phê duyệt';
      case 5:
        return 'Chờ xác nhận kết quả công tác';
      case 6:
        return 'Xác nhận kết quả công tác';
      case 7:
        return 'Chờ phê duyệt kết thúc công tác';
      case 8:
        return 'Kết thúc công tác';
      case 9:
        return 'Từ chối kết thúc công tác';
      case 10:
        return 'Hủy';
      default:
        return status;
    }
  };

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

  function isAdditional(parent: IPlan | undefined): boolean {
    return !!parent && Object.keys(parent).length > 0;
  }

  const isAdditionalPlan = isAdditional(parent);

  const getInforPlan = async () => {
    setIsLoading(true);
    try {
      const res = (await getInforPlanApi(idDetails)) as any;
      setPlanCost(res.plan_cost?.length);
      console.log(res.plan_cost?.length, res.plan.status);
      if (
        (res.plan_cost?.length === 0 && res.plan.status === planStatus.init) ||
        (res.plan_cost?.length === 0 && res.plan.status === planStatus.refuse_approve) ||
        res.plan.is_add
      ) {
        setListStepsInfor([
          { title: 'Thông tin chung', status: 'process' },
          { title: 'Thông tin cán bộ', status: 'wait' },
          { title: 'Thông tin lộ trình', status: 'wait' },
          { title: 'Dự toán chi phí', status: 'wait' },
        ]);
      } else if (res.plan_cost?.length === 0 && data?.status !== undefined && [4, 1].includes(data?.status)) {
        setListStepsInfor([
          { title: 'Thông tin chung', status: 'process' },
          { title: 'Thông tin cán bộ', status: 'wait' },
          { title: 'Thông tin lộ trình', status: 'wait' },
          { title: 'Dự toán chi phí', status: 'wait' },
          { title: 'Đề nghị tạm ứng', status: 'wait' },
          { title: 'Xác nhận công tác', status: 'wait' },
          { title: 'Hóa đơn', status: 'wait' },
          { title: 'Kết thúc công tác', status: 'wait' },
        ]);
      }
      setIsLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  // useEffect(() => {
  //   if (idDetails) {
  //     setTimeout(() => {
  //       getInforPlan()
  //     }, 0)
  //   }
  // }, [idDetails])

  return (
    <Modal
      open={open}
      title="Kế hoạch công tác"
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
      onCancel={onCancel}
      footer={renderFooterButtons()}
    >
      {isLoading ? (
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
        </div>
      ) : (
        <div className={'modal-scroll'}>
          <Steps type="navigation" size="small" items={listStepsInfor} onChange={onChangeSteps} current={current} />
          {current === CurrentPlanDetailsModalScreen.THONG_TIN_CHUNG && (
            <div className={'infor-wrap'}>
              <Row>
                <Col span={12} style={{ marginBottom: 20, paddingTop: 40 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong>Mã kế hoạch:</Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{data?.code}</Text>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} style={{ marginBottom: 20, paddingTop: 40 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong> Tên kế hoạch: </Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{data?.name}</Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
              {current === CurrentPlanDetailsModalScreen.THONG_TIN_CHUNG && isAddPlan === true && (
                <Row style={{ paddingTop: 5, marginBottom: 34 }}>
                  <Col span={3}>
                    <Text strong> Kế hoạch gốc: </Text>
                  </Col>
                  <Col span={21}>
                    <Text style={{ paddingLeft: 5 }}>
                      {parent?.code} - {parent?.name}
                    </Text>
                  </Col>
                </Row>
              )}
              <Row>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong>Trạng thái kế hoạch:</Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{data?.status ? statusLabel(data?.status) : '--'}</Text>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong> Mục đích công tác: </Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{purpose?.name}</Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong>Hình thức công tác:</Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{typeLabel(data?.type)}</Text>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong> Kế hoạch bổ sung: </Text>
                    </Col>
                    <Col span={18}>
                      <Checkbox style={{ paddingLeft: 5 }} checked={isAdditionalPlan} disabled />
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong>Đơn vị yêu cầu:</Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>
                        {departmentRequire && Object.keys(departmentRequire).length > 0 ? departmentRequire.name : '--'}
                      </Text>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong> Người yêu cầu: </Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>
                        {userRequire && Object.keys(userRequire).length > 0 ? userRequire.fullName : '--'}
                      </Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong> Đơn vị thực hiện:</Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{departmentProcess?.name}</Text>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong> Người thực hiện: </Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{userProcess?.fullName}</Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong>Ngày bắt đầu:</Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{formatDate(data?.start_time)}</Text>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} style={{ marginBottom: 20 }}>
                  <Row>
                    <Col span={6}>
                      <Text strong> Ngày kết thúc: </Text>
                    </Col>
                    <Col span={18}>
                      <Text style={{ paddingLeft: 5 }}>{formatDate(data?.end_time)}</Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row style={{ paddingTop: 5, marginBottom: 34 }}>
                <Col span={3}>
                  <Text strong> Lý do từ chối: </Text>
                </Col>
                <Col span={21}>
                  <Text style={{ paddingLeft: 5 }}>{reason ? reason : '--'}</Text>
                </Col>
              </Row>
              <Row>
                <Col span={3}>
                  <Text strong>Chi tiết công việc:</Text>
                </Col>
                <Col span={21}>
                  <Text style={{ paddingLeft: 5 }}>{data?.description}</Text>
                </Col>
              </Row>
            </div>
          )}
          {current === CurrentPlanDetailsModalScreen.THONG_TIN_CAN_BO && (
            <StaffInformationModal idDetails={idDetails} />
          )}
          {current === CurrentPlanDetailsModalScreen.THONG_TIN_LO_TRINH && <PlanRouteDetails idDetails={idDetails} />}
          {current === CurrentPlanDetailsModalScreen.DU_TOAN_CHI_PHI && (
            <CostEstimateDetails
              idDetails={idDetails}
              planInfor={data}
              planCost={planCost}
              callback={getPlan}
              ref={CostEstimateRef}
              baseReload={baseReload}
            />
          )}
          {current === CurrentPlanDetailsModalScreen.DE_NGHI_TAM_UNG &&
            (data?.status === planStatus.init || data?.status === planStatus.refuse_approve) && (
              <AdvanceRequestCreateForm
                ref={advanceRequestRef}
                idDetails={idDetails}
                status={data?.status}
                planCost={planCost}
                handleGet={getPlan}
                onClosedModal={onCancel}
                baseReload={baseReload}
                buttonAddLoading={loadingAddbutton}
                buttonAddNotLoading={notLoadingAddbutton}
                buttonLoading={loadingButton}
                buttonNotLoading={notLoadingButton}
                loadingDownloadButton={loadingDownloadButton}
                notLoadingDownloadButton={notLoadingDownloadButton}
              />
            )}
          {current === CurrentPlanDetailsModalScreen.DE_NGHI_TAM_UNG &&
            data?.status &&
            data.status > planStatus.init &&
            data?.status !== planStatus.refuse_approve &&
            isStatus !== AdvanceRequestStatus.TU_CHOI_PHE_DUYET && <AdvanceRequest idDetails={idDetails} />}
          {current === CurrentPlanDetailsModalScreen.DE_NGHI_TAM_UNG &&
            isStatus === AdvanceRequestStatus.TU_CHOI_PHE_DUYET &&
            planCost > 0 && (
              <AdvanceDeclinedModal
                ref={advanceDeclinedRef}
                idDetails={idDetails}
                status={data?.status}
                buttonAddLoading={loadingAddbutton}
                buttonAddNotLoading={notLoadingAddbutton}
                buttonLoading={loadingButton}
                buttonNotLoading={notLoadingButton}
                loadingDownloadButton={loadingDownloadButton}
                notLoadingDownloadButton={notLoadingDownloadButton}
              />
            )}
          {current === CurrentPlanDetailsModalScreen.XAC_NHAN_CONG_TAC && (
            <ConfirmInfo
              idDetails={idDetails}
              handleCancel={handleCancel}
              ref={confirmInforRef}
              callback={(e) => setAddConfirm(e)}
            />
          )}
          {current === CurrentPlanDetailsModalScreen.HOA_DON && (
            <InvoiceInfor idDetails={idDetails} departmentProcess={departmentProcess} />
          )}
          {current === CurrentPlanDetailsModalScreen.KET_tHUC_CONG_TAC && (
            <EndPlan
              endPlan={data}
              ref={endPlanRef}
              callback={(e) => setAdd(e)}
              closeModal={onCancel}
              getPlan={getPlan}
            />
          )}
        </div>
      )}
    </Modal>
  );
};

export default PlanDetailsModal;

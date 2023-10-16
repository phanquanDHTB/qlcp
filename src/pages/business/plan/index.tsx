import { Button, Modal, Space, Steps } from 'antd';
import { toast } from 'react-toastify';
import { useEffect, useRef, useState } from 'react';
import { v4 } from 'uuid';
import { EditOutlined, DeleteOutlined, CloseOutlined } from '@ant-design/icons';
import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import planTitle from '@columnTitles/plan';
import getMessageError from '@utils/getMessageError';
import Infor, { ISelect } from './infor-modal';
import './styles.scss';
import PersonInfor from './person-infor';
import RouteInfor from './route-infor';
import Expense from './expense';
import PlanDetailsModal from './plan-details-modal';
import { call } from '../../../apis/baseRequest';
import { IDepartment } from 'type';
import { useDebounce } from 'usehooks-ts';
import { planStatus } from '../../../constants/enumConmon';

const PlanPage = () => {
  const [isOpenConfirm, setIsOpenConfirm] = useState(false);
  const [idDelete, setIdDelete] = useState<any>(null);
  const [isDelete, setIsDelete] = useState(false);

  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 150,
      dataIndex: 'code',
      key: '1',
      fixed: 'left',
      render: (value, record) => (
        <Button
          type="link"
          onClick={() => {
            onOpenModalPlanDetails(record);
          }}
        >
          {value}
        </Button>
      ),
    },
    {
      width: 300,
      dataIndex: 'name',
      key: '2',
      render: (v) => (
        <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', height: '22px', whiteSpace: 'nowrap' }}>{v}</div>
      ),
    },
    {
      width: 200,
      dataIndex: 'status',
      key: '3',
      dataType: 'list',
      dataSource: [
        {
          value: 1,
          text: 'Khởi tạo',
        },
        {
          value: 2,
          text: 'Chờ phê duyệt',
        },
        {
          value: 3,
          text: 'Đã phê duyệt',
        },
        {
          value: 4,
          text: 'Từ chối phê duyệt',
        },
        {
          value: 5,
          text: 'Chờ xác nhận kết quả công tác',
        },
        {
          value: 6,
          text: 'Xác nhận kết quả công tác',
        },
        {
          value: 7,
          text: 'Chờ phê duyệt kết thúc công tác',
        },
        {
          value: 8,
          text: 'Kết thúc công tác',
        },
        {
          value: 9,
          text: 'Từ chối kết thúc công tác',
        },
        {
          value: 10,
          text: 'Hủy',
        },
      ],
    },
    {
      dataIndex: 'payment_request_status',
      width: 250,
      dataType: 'list',
      dataSource: [
        {
          value: 1,
          text: 'Khởi tạo',
        },
        {
          value: 2,
          text: 'Chờ phê duyệt',
        },
      ],
      render: (_, record) =>
        record?.payment_request?.refunded_status === 0
          ? 'Chưa hoàn ứng'
          : record?.payment_request?.refunded_status === 1
            ? 'Đã hoàn ứng'
            : '--',
    },
    {
      width: 180,
      dataIndex: 'start_time',
      key: '4',
      dataType: 'date',
    },
    {
      width: 180,
      dataIndex: 'end_time',
      key: '5',
      dataType: 'date',
    },
    {
      width: 180,
      dataIndex: 'is_add',
      key: '6',
      dataType: 'list',
      dataSource: [
        {
          value: true,
          text: 'Kế hoạch bổ sung',
        },
        {
          value: false,
          text: 'Kế hoạch gốc',
        },
      ],
    },
    {
      width: 300,
      dataIndex: 'parent',
      key: '7',
      render: (v) => {
        return (
          <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', height: '22px', whiteSpace: 'nowrap' }}>
            {v?.name}
          </div>
        );
      },
    },
    {
      width: 200,
      dataIndex: 'name_of_purpose_id',
      key: '8',
    },
    {
      width: 200,
      dataIndex: 'type',
      key: '9',
      dataType: 'list',
      dataSource: [
        {
          value: 1,
          text: 'Nội địa',
        },
        {
          value: 2,
          text: 'Nước ngoài',
        },
      ],
    },
    {
      width: 250,
      dataIndex: 'name_of_department_require_id',
      key: '10',
    },
    {
      width: 200,
      key: '11',
      dataIndex: 'name_of_user_require_id',
      nameOfRender: 'fullName',
    },
    {
      width: 250,
      dataIndex: 'name_of_department_process_id',
    },
    {
      width: 200,
      key: '12',
      dataIndex: 'name_of_user_process_id',
      nameOfRender: 'fullName',
    },
    {
      width: 180,
      dataIndex: 'id',
      key: '13',
      align: 'center',
      render: (v, record) => (
        <Space>
          {record.status === planStatus.done_approve && (
            <Button
              onClick={() => {
                setIsDelete(false);
                setIdDelete({ id: record.id, code: record.code, isCancel: true });
                setIsOpenConfirm(true);
              }}
            >
              <CloseOutlined />
            </Button>
          )}
          {(record.status === planStatus.init || record.status === planStatus.refuse_approve) && (
            <Button
              onClick={() => {
                setTimeout(() => setIdEdit(v), 0);
                setIsOpenModal(true);
                setIsAdd(false);
              }}
            >
              <EditOutlined />
            </Button>
          )}
          {record.status === planStatus.init && (
            <Button
              onClick={() => {
                setIsDelete(true);
                setIdDelete({ id: record.id, code: record.code, isCancel: false });
                setIsOpenConfirm(true);
              }}
            >
              <DeleteOutlined />
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const [isAdd, setIsAdd] = useState(true);
  const [idEdit, setIdEdit] = useState<null | number>(null);
  const [idParent, setIdParent] = useState<null | number>(null);
  const [idDetails, setIdDetails] = useState<null | number>(null);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isOpenModalPlanDetails, setisOpenModalPlanDetails] = useState(false);

  const [current, setCurrent] = useState(0);
  const [listSteps, setListSteps] = useState<{ title: string; status: 'finish' | 'process' | 'wait' }[]>([
    {
      title: 'Thông tin chung',
      status: 'process',
    },
    {
      title: 'Thông tin cán bộ',
      status: 'wait',
    },
    {
      title: 'Thông tin lộ trình',
      status: 'wait',
    },
    {
      title: 'Dự toán chi phí',
      status: 'wait',
    },
  ]);

  const inforRef = useRef<{ submitInfor: () => void; resetFields: () => void }>();
  const personRef = useRef<{ addOrEditPlanUserRef: () => void }>();
  const routeRef = useRef<{
    addOrEditRouteRef: () => void;
    listRoute: any;
    handleContinue: () => void;
    loading: any;
  }>();
  const expenseRef = useRef<{ addCost: () => void }>();

  const onCloseModal = () => {
    setIdEdit(null);
    setIsOpenModal(false);
    setListSteps([
      {
        title: 'Thông tin chung',
        status: 'process',
      },
      {
        title: 'Thông tin cán bộ',
        status: 'wait',
      },
      {
        title: 'Thông tin lộ trình',
        status: 'wait',
      },
      {
        title: 'Dự toán chi phí',
        status: 'wait',
      },
    ]);
    setCurrent(0);
  };

  const [departmentProcess, setDepartmentProcess] = useState<IDepartment | undefined>();

  const onOpenModalPlanDetails = (record) => {
    setIdDetails(record.id);
    setisOpenModalPlanDetails(true);
  };

  const onCloseModalPlanDetails = () => {
    setIdDetails(null);
    setisOpenModalPlanDetails(false);
  };
  const basePage = useRef<{ reloadToStartPage?: () => void; reloadBasePage?: () => void }>();

  const [type, setType] = useState(3);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [loadingPerson, setLoadingPerson] = useState(false);
  const [loadingInfor, setLoadingInfor] = useState(false);
  const [loadingExpense, setLoadingExpense] = useState(false);

  const [isAddRoute, setIsAddRoute] = useState(false)
  const [debounceBtn, setDebounceBtn] = useState(0);
  const debounce = useDebounce(debounceBtn, 300);
  useEffect(() => {
    if (debounce && isAddRoute) {
      routeRef.current?.addOrEditRouteRef();
    }
    if (debounce && !isAddRoute) {
      routeRef.current?.handleContinue();
    }
  }, [debounce]);

  return (
    <div className="plans-wrap">
      <Modal
        title={`Bạn chắc chắn muốn ${isDelete ? 'xoá' : 'hủy'} bản ghi ` + idDelete?.code + ' ?'}
        open={isOpenConfirm}
        onCancel={() => setIsOpenConfirm(false)}
        footer={[
          <Button key={1} onClick={() => setIsOpenConfirm(false)}>
            Hủy
          </Button>,
          <Button
            key={2}
            onClick={async () => {
              try {
                if (!idDelete.isCancel) {
                  await call({
                    uri: 'plans/' + idDelete.id,
                    hasToken: true,
                    method: 'DELETE',
                  });
                  toast('Xóa ' + idDelete.code + ' thành công', { type: 'success' });
                  if (basePage.current?.reloadBasePage) {
                    basePage.current.reloadBasePage();
                  }
                  setIsOpenConfirm(false);
                  setIdDelete(null);
                } else {
                  await call({
                    uri: 'plans/cancel/' + idDelete.id,
                    method: 'PUT',
                    hasToken: true,
                  });
                  toast(`Hủy ${idDelete.code} thành công`, { type: 'success' });
                  if (basePage.current?.reloadBasePage) {
                    basePage.current.reloadBasePage();
                  }
                  setIsOpenConfirm(false);
                  setIdDelete(null);
                }
              } catch (e) {
                toast(getMessageError(e), { type: 'error' });
              }
            }}
            type={'primary'}
          >
            Xác nhận
          </Button>,
        ]}
      ></Modal>
      <BasePage
        uriFetch="plans"
        columnTiles={planTitle}
        columns={columns}
        isAddButton
        headerTitle={'Kế hoạch công tác'}
        onAddClick={() => {
          setIsOpenModal(true);
          setIdEdit(null);
          setIsAdd(true);
        }}
        isDeleteButton={true}
        ref={basePage}
      />
      <Modal
        open={isOpenModal}
        onCancel={() => {
          onCloseModal();
          if (current === 0) {
            inforRef.current?.resetFields();
          }
        }}
        title={`${!isAdd ? 'Sửa' : 'Thêm'} kế hoạch công tác`}
        footer={
          current === 0
            ? [
              <Button
                onClick={() => {
                  onCloseModal();
                  inforRef.current?.resetFields();
                }}
                key={v4()}
              >
                Thoát
              </Button>,
              <Button
                onClick={() => {
                  if (inforRef.current) {
                    inforRef.current.submitInfor();
                  }
                }}
                key={v4()}
                type={'primary'}
                loading={loadingInfor}
              >
                Tiếp tục
              </Button>,
            ]
            : current === 1
              ? [
                <Button onClick={onCloseModal} key={v4()}>
                  Thoát
                </Button>,
                <Button onClick={() => setCurrent(0)} key={v4()}>
                  Quay lại
                </Button>,
                <Button
                  onClick={() => {
                    if (personRef.current) {
                      personRef.current.addOrEditPlanUserRef();
                    }
                  }}
                  key={v4()}
                  type={'primary'}
                  loading={loadingPerson}
                >
                  Tiếp tục
                </Button>,
              ]
              : current === 2
                ? [
                  <Button onClick={onCloseModal} key={v4()}>
                    Thoát
                  </Button>,
                  <Button onClick={() => setCurrent(1)} key={v4()}>
                    Quay lại
                  </Button>,
                  <Button
                    onClick={() => {
                      setIsAddRoute(true)
                      setDebounceBtn((pre) => (pre += 1));
                    }}
                    loading={loadingRoute}
                  >
                    Lưu
                  </Button>,
                  <Button
                    onClick={() => {
                      setIsAddRoute(false)
                      setDebounceBtn((pre) => (pre += 1));
                    }}
                    key={v4()}
                    type={'primary'}
                    loading={loadingRoute}
                  >
                    Tiếp tục
                  </Button>,
                ]
                : current === 3
                  ? [
                    <Button onClick={onCloseModal} key={v4()}>
                      Thoát
                    </Button>,
                    <Button onClick={() => setCurrent(2)} key={v4()}>
                      Quay lại
                    </Button>,
                    <Button
                      onClick={() => {
                        expenseRef.current?.addCost();
                      }}
                      key={v4()}
                      type={'primary'}
                      loading={loadingExpense}
                    >
                      Tiếp tục
                    </Button>,
                  ]
                  : ''
        }
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
      >
        <div className={'modal-scroll'}>
          <Steps type="navigation" size="small" current={current} items={listSteps} />
          <div>
            {current === 0 && (
              <Infor
                idEdit={idEdit}
                ref={inforRef}
                callback={(id: number, idParent: number | null, departmentProcess: IDepartment, type: number) => {
                  setType(type);
                  setListSteps((pre) => {
                    pre[0].status = 'finish';
                    pre[1].status = 'process';
                    return pre;
                  });
                  setCurrent(1);
                  setIdEdit(id);
                  setIdParent(idParent);
                  setDepartmentProcess(departmentProcess);
                  if (basePage.current?.reloadToStartPage) {
                    basePage.current.reloadToStartPage();
                  }
                }}
                callbackLoading={(loading: boolean) => setLoadingInfor(loading)}
                openModal={isOpenModal}
              />
            )}
            {current === 1 && (
              <PersonInfor
                ref={personRef}
                idEdit={idEdit}
                idParent={idParent}
                callbackSuccess={() => {
                  setListSteps((pre) => {
                    pre[0].status = 'finish';
                    pre[1].status = 'finish';
                    pre[2].status = 'process';
                    return pre;
                  });
                  setCurrent(2);
                }}
                callbackLoading={(loading: boolean) => setLoadingPerson(loading)}
              />
            )}
            {current === 2 && (
              <RouteInfor
                type={type}
                ref={routeRef}
                idEdit={idEdit}
                departmentProcess={departmentProcess}
                callBack={() => {
                  setListSteps([
                    {
                      title: 'Thông tin chung',
                      status: 'finish',
                    },
                    {
                      title: 'Thông tin cán bộ',
                      status: 'finish',
                    },
                    {
                      title: 'Thông tin lộ trình',
                      status: 'finish',
                    },
                    {
                      title: 'Dự toán chi phí',
                      status: 'process',
                    },
                  ]);
                  setCurrent(3);
                }}
                callbackLoading={(loading: boolean) => setLoadingRoute(loading)}
              />
            )}
            {current === 3 && (
              <Expense
                idEdit={idEdit}
                ref={expenseRef}
                callback={() => {
                  onCloseModal();
                }}
                callbackLoading={(loading: boolean) => setLoadingExpense(loading)}
                isAdd={isAdd}
              />
            )}
          </div>
        </div>
      </Modal>
      <PlanDetailsModal
        baseReload={basePage.current?.reloadBasePage}
        idDetails={idDetails}
        open={isOpenModalPlanDetails}
        onCancel={() => {
          onCloseModalPlanDetails();
        }}
        title="Kế hoạch công tác"
        onOK={onCloseModalPlanDetails}
      />
    </div>
  );
};
export default PlanPage;

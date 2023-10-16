import PlanPayment from '@columnTitles/payment-title';
import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import { Button, Col, Collapse, Modal, Row, Space } from 'antd';
import { useRef, useState, useMemo, useEffect } from 'react';
import { RetweetOutlined, CheckOutlined } from '@ant-design/icons';
import formatNumber from '@utils/formatNumber';
import TableData from '@components/TableData';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import dayjs from 'dayjs';
import { requestCatchHook } from '@utils/hook/handleError';
import { v4 } from 'uuid';
import { ICostHasBill, IPlan, IPlanCost } from 'type';
import { formatDate } from '@utils/formatDate';
import { accountingRequest, refundRequest } from '../../apis/page/payment';
import {
  getInvoice,
  getPlanQuotasRequest,
  getPlanReportRequest,
  getPlanRequiredRequest,
} from '../../apis/page/business/plan/end-plan';
import planRequiredStatus from '../../constants/Constants';

const { Panel } = Collapse;

export const paymentStatus = {
  chua_hoan_ung: 0,
  da_hoan_ung: 1
}

const Payment = () => {
  const basePage = useRef<{ reloadToStartPage?: () => void; reloadBasePage?: () => void }>();
  const [confirmInfor, setConfirmInfor] = useState<{ id: number; type: 'refund' | 'account'; code: string }>({
    id: 0,
    type: 'refund',
    code: '',
  });

  const is_accounting = {
    init: 0,
    fail: 1,
    success: 2,
  };

  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 150,
      dataIndex: 'code_of_payment_request_id',
      key: '1ccz',
      fixed: 'left',
      nameOfRender: 'code',
      render: (_, record) =>
        (
          <a
            onClick={() => {
              setEndPlan(record);
              setIsRefundModal(true);
            }}
          >
            {record?.payment_request?.code}
          </a>
        ) || '--',
    },
    {
      width: 250,
      dataIndex: 'total_amount_of_payment_request_id',
      key: '1sdfd',
      render: (_, record) =>
        record?.payment_request?.total_amount !== null
          ? formatNumber(Math.abs(record?.payment_request?.total_amount))
          : '--',
    },
    {
      width: 200,
      dataIndex: 'status_of_payment_request_id',
      key: '1zaqqs',
      render: (_, record) =>
        record?.payment_request?.refunded_status === paymentStatus.chua_hoan_ung
          ? 'Chưa hoàn ứng'
          : record?.payment_request?.refunded_status === paymentStatus.da_hoan_ung
          ? 'Đã hoàn ứng'
          : '--',
    },
    {
      width: 200,
      dataIndex: 'is_accounting',
      key: '1aawq',
      render: (value) =>
        value === is_accounting.init
          ? 'Khởi tạo'
          : value === is_accounting.success
          ? 'Thành công'
          : value === is_accounting.fail
          ? 'Thất bại'
          : '--',
    },
    {
      width: 150,
      dataIndex: 'code',
      key: '1',
      render: (value) => value || '--',
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
          {record?.payment_request?.refunded_status === 0 && (
            <>
              <Button
                icon={<CheckOutlined />}
                onClick={async () => {
                  setConfirmInfor({ id: v, type: 'refund', code: record?.code });
                  setIsModal(true);
                }}
              ></Button>
              <Modal />
            </>
          )}
          {record?.payment_request?.refunded_status === 1 && record?.is_accounting !== 2 && (
            <Button
              icon={<RetweetOutlined />}
              onClick={() => {
                setConfirmInfor({ id: v, type: 'account', code: record?.code });
                setIsModal(true);
              }}
            ></Button>
          )}
        </Space>
      ),
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
      render: (v) => (v ? formatNumber(v) : ''),
    },
  ];

  const [loadingRefund, setLoadingRefund] = useState<boolean>(false);

  const [isModal, setIsModal] = useState(false);
  const [isRefundModal, setIsRefundModal] = useState<boolean>(false);

  const [active, setActive] = useState<any>(['1', '2', '3', '4', '5']);

  const [endPlan, setEndPlan] = useState<IPlan>();
  const [total, setTotal] = useState(0);

  const [reportStatus, setReportStatus] = useState<number | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [listBill, setListBill] = useState<ICostHasBill[]>([]);

  const getInvoiceRequest = async () => {
    try {
      const res = (await getInvoice(endPlan, 0)) as any;
      setListBill(res.content as ICostHasBill[]);
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };

  const getPlanReport = async () => {
    try {
      const res = (await getPlanReportRequest(endPlan)) as any;
      setReportStatus(res.content[0]?.status);
      setReason(res.content[0]?.reason);
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };

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

  const [quotas, setQuotas] = useState<any>([]);
  const totalBill = useMemo(() => {
    return listBill.reduce((accumulator, currentValue) => accumulator + currentValue.total_final_amount, 0);
  }, [listBill]);
  const [required, setRequired] = useState(0);

  const getPlanRequired = async () => {
    try {
      const res = (await getPlanRequiredRequest(endPlan)) as any;
      setRequired((res?.content[0]?.plan_required_user.amount as number) || 0);
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };

  useEffect(() => {
    if (endPlan) {
      getPlanQuotas();
      getPlanRequired();
      getPlanReport();
      getInvoiceRequest();
    }
  }, [endPlan?.id]);
  const money = total + totalBill - required;
  const columnsCost = [
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
      render: (v) => (v ? formatNumber(v) : ''),
    },
  ];
  return (
    <>
      <Modal
        open={isModal}
        onCancel={() => setIsModal(false)}
        onOk={() => setIsModal(false)}
        title={
          confirmInfor.type === 'refund'
            ? `Bạn có muốn xác nhận ${confirmInfor.code} đã hoàn ứng?`
            : `Bạn có muốn hạch toán ${confirmInfor.code} ?`
        }
        footer={[
          <Button onClick={() => setIsModal(false)} key={1}>
            Hủy
          </Button>,
          <Button
            loading={loadingRefund}
            onClick={async () => {
              if (confirmInfor.type === 'refund') {
                try {
                  setLoadingRefund(true);
                  await refundRequest(confirmInfor.id);
                  if (basePage.current?.reloadBasePage) {
                    basePage.current?.reloadBasePage();
                  }
                  setIsModal(false);
                } catch (err) {
                  requestCatchHook({ e: err });
                } finally {
                  setLoadingRefund(false);
                }
              } else {
                try {
                  setLoadingRefund(true);
                  await accountingRequest(confirmInfor.id);
                  if (basePage.current?.reloadBasePage) {
                    basePage.current?.reloadBasePage();
                  }
                  setIsModal(false);
                } catch (err) {
                  requestCatchHook({ e: err });
                } finally {
                  setLoadingRefund(false);
                }
              }
            }}
            key={2}
            type="primary"
          >
            Xác nhận
          </Button>,
        ]}
      ></Modal>
      <Modal
        title={'Xem công tác hoàn ứng'}
        open={isRefundModal}
        onCancel={() => setIsRefundModal(false)}
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
          <Button onClick={() => setIsRefundModal(false)} type="primary">
            Đóng
          </Button>,
        ]}
      >
        <div className={'modal-scroll'}>
          <Collapse defaultActiveKey={active} key={v4()} onChange={(e) => setActive(e)}>
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
              {
                <>
                  <Row style={{ padding: '10px 0' }}>
                    <Col span={6} style={{}}>
                      <span style={{ color: 'red' }}>*</span>Nội dung công việc đã làm:
                    </Col>
                    <Col span={18}>{/* {watch('content')} */}</Col>
                  </Row>
                  <Row style={{ padding: '10px 0' }}>
                    <Col span={6} style={{}}>
                      <span style={{ color: 'red' }}>*</span>Kết quả thực hiện:
                    </Col>
                    <Col span={18}>{/* {watch('result')} */}</Col>
                  </Row>
                  <Row style={{ padding: '10px 0' }}>
                    <Col span={6} style={{}}>
                      <span style={{ color: 'red' }}>*</span>Đề xuất:
                    </Col>
                    <Col span={18}>{/* {watch('propose')} */}</Col>
                  </Row>
                </>
              }
            </Panel>
            <Panel header={<h3>Chi phí theo định mức</h3>} key={'3'}>
              <TableData
                tableProps={{
                  columns: columnsCost,
                  dataSource: quotas,
                  rowKey: '_id',
                  expandable: {
                    defaultExpandAllRows: true,
                    expandRowByClick: true,
                  },
                  footer: () => (
                    <Row>
                      <Col span={17}>Tổng</Col>
                      <Col span={7} style={{ paddingLeft: '20px' }}>
                        {formatNumber(total) || ''}
                      </Col>
                    </Row>
                  ),
                }}
              />
            </Panel>
            <Panel header={<h3>Chi phí có hóa đơn</h3>} key={'4'}>
              <TableData
                tableProps={{
                  columns: columnsBill,
                  dataSource: listBill,
                  rowKey: 'id',
                  footer: () => (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3>
                        Tổng chi phí có hóa đơn:{' '}
                        {formatNumber(
                          listBill?.reduce(
                            (accumulator, currentValue) => accumulator + (+currentValue.total_final_amount || 0),
                            0
                          )
                        )}
                      </h3>
                    </div>
                  ),
                }}
              />
            </Panel>
            <Panel header={<h3>Tổng chi phí</h3>} key={'5'}>
              <Row style={{ padding: '10px 0' }}>
                <Col style={{}}>Tổng chi phí định mức:</Col>
                <span style={{ marginLeft: 10 }}>{formatNumber(total.toString().split('.')[0]) || 0} VNĐ</span>
              </Row>
              <Row style={{ padding: '10px 0' }}>
                <Col style={{}}>Tổng chi phí hóa đơn:</Col>
                <span style={{ marginLeft: 10 }}>{formatNumber(totalBill.toString().split('.')[0]) || 0} VNĐ</span>
              </Row>
              <Row style={{ padding: '10px 0' }}>
                <Col style={{}}>Số tiền đã tạm ứng:</Col>
                <span style={{ marginLeft: 10 }}>
                  {formatNumber(required ? required.toString().split('.')[0] : 0) || 0} VNĐ
                </span>
              </Row>
              <Row style={{ padding: '10px 0' }}>
                <Col style={{}}>{money > 0 ? 'Số tiền phải chi:' : 'Số tiền phải thu:'}</Col>
                <span style={{ marginLeft: 10 }}>
                  {formatNumber(money.toString().split('.')[0]).toString().replaceAll('-', '') || 0} VNĐ
                </span>
              </Row>
            </Panel>
          </Collapse>
        </div>
      </Modal>
      <BasePage
        uriFetch="plans/refunded"
        columnTiles={PlanPayment}
        columns={columns}
        isAddButton
        headerTitle={PlanPayment.name}
        isDeleteButton={true}
        ref={basePage}
      />
    </>
  );
};

export default Payment;

import {
  Button,
  Modal,
  Col,
  Divider,
  Row,
  Steps,
  message,
  Table,
  Radio,
  Empty,
} from 'antd';
import { toast } from 'react-toastify';
import { useEffect, useState, useRef } from 'react';
import { ColumnsType } from 'antd/es/table';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { getUriWebBooking, getBookings } from '../../../../apis/air-ticket/order-ticket';
import { getAllPlanUser } from '../../../../apis/plan-route-user/index';
import { MzFormSelect } from '@components/forms/FormSelect';
import toSlug from '@utils/toSlug';
import getMessageError from '@utils/getMessageError';
import { MzFormSelectV3 } from '@components/forms/FormSelectV3';
import { getAllPlanRoute } from '../../../../apis/plan-route/index';
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import './css/order-ticket-modal.css';
import { formatDate } from '../../../../utils/formatDate';
import { planStatus as PlanStatusEnum } from '../../../../constants/enumConmon';
import { handleGetPlanRoutesRequest } from '../../../../apis/order-ticket/order-ticket';

const queryClient = new QueryClient();

export enum ConfirmStatus {
  CHO_XAC_NHAN = 1,
  DA_XAC_NHAN = 2,
  TU_CHOI = 3,
}
export interface ISelect {
  label: string;
  value: number;
}
export const formatCurrency = (value) => {
  return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

export const userGender = [
  { label: 'Nữ', value: '1' },
  { label: 'Nam', value: '0' },
];
export const OrderStatus = [
  { label: 'Vào trang', value: 0 },
  { label: 'Để lại thông tin', value: 1 },
  { label: 'Đặt vé', value: 2 },
  { label: 'Xuất vé', value: 3 },
  { label: 'Đã được đồng bộ dữ liệu', value: 4 },
];

const OrderTicketModal = (props) => {
  const enum currentPage {
    DANH_SACH_NHAN_VIEN = 0,
    DANH_SACH_VE_DA_DAT = 1,
  }
  const enum ServerStateKeysEnum {
    planRoute = 'plan-route',
    planRouteUser = 'plan-route-user',
    orderTicket = 'order-ticket',
  }
  const enum OrderType {
    VE_MOT_CHIEU = 1,
    VE_KHU_HOI = 2,
  }

  const enum isBookingStatus {
    CHƯA_DAT_VE = 1,
    CHO_THANH_TOAN = 2,
    DA_THANH_TOAN = 3,
    HOAN_THANH_DAT_VE = 4,
  }

  const planRouteUserColumns: ColumnsType<any> = [
    {
      title: 'Mã nhân viên',
      dataIndex: 'code',
    },
    {
      title: 'Tên nhân viên',
      dataIndex: 'full_name',
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone_number',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      render: (value) => (value ? renderGender(value) : '--'),
    },
    {
      title: 'Nhóm chức vụ',
      dataIndex: 'position_name',
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'start_time',
      render: (value) => (value ? formatDate(value) : '--'),
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'end_time',
      render: (value) => (value ? formatDate(value) : '--'),
    },
    {
      title: 'Tình trạng',
      dataIndex: 'is_booking',
      render: (_, recordValue: any) => {
        return renderStatusUserBooking(recordValue?.order_status);
      },
    },
  ];
  const renderStatusUserBooking = (value: any) => {
    let res = 'Chưa đặt vé';
    switch (value) {
      case isBookingStatus.CHO_THANH_TOAN.toString():
        res = 'Chờ thanh toán';
        break;
      case isBookingStatus.DA_THANH_TOAN.toString():
        res = 'Đã thanh toán';
        break;
      case isBookingStatus.HOAN_THANH_DAT_VE.toString():
        res = 'Đã đặt vé';
        break;

      default:
        break;
    }
    return res;
  };
  const orderTicketColumns: ColumnsType<any> = [
    {
      title: 'Mã đặt vé',
      dataIndex: 'code',
      render: (value, recordValue) => (
        <Button type="link" onClick={() => showBookingDetail(recordValue)}>
          {value}
        </Button>
      ),
    },
    {
      title: 'Hãng bay',
      dataIndex: 'airline_name',
    },
    {
      title: 'Số hiệu chuyến bay',
      dataIndex: 'code',
    },
    {
      title: 'Điểm đi',
      dataIndex: 'from_province_name',
    },
    {
      title: 'Điểm đến',
      dataIndex: 'to_province_name',
    },
    {
      title: 'Ngày khởi hành',
      dataIndex: 'departure_date',
      render: (value) => (value != 0 ? formatDate(value) : '--'),
    },
    {
      title: 'Giờ khởi hành',
      dataIndex: 'departure_time',
    },
    {
      title: 'Số lượng vé',
      dataIndex: 'total_ticket',
      render: (_, recordValue) => recordValue?.booking_customers.length,
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_price',
      render: (value) => (value != 0 ? formatCurrency(value) : 0),
    },
  ];
  const bookingColumns: ColumnsType<any> = [
    {
      title: 'Hãng',
      dataIndex: 'airline_name',
      width: 100,
    },
    {
      title: 'Số hiệu',
      dataIndex: 'airline_code',
      width: 80,
    },
    {
      title: 'Số hiệu chuyến bay',
      dataIndex: 'code',
      width: 100,
    },
    {
      title: 'Hạng ghế',
      dataIndex: 'seat_class',
      width: 100,
      render: (_, recordValue) => {
        return recordValue?.seat_class ? recordValue?.seat_class : '--';
      },
    },
    {
      title: 'Điểm đi',
      dataIndex: 'from_province_name',
      width: 150,
    },
    {
      title: 'Điểm đến',
      dataIndex: 'to_province_name',
      width: 150,
    },
    {
      title: 'Ngày bay',
      dataIndex: 'departure_date',
      width: 150,
      render: (value) => (value ? formatDate(value) : '--'),
    },
    {
      title: 'Giờ bay',
      dataIndex: 'departure_time',
      width: 100,
    },
  ];

  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [current, setCurrent] = useState(currentPage.DANH_SACH_NHAN_VIEN);
  const [planRouteParams, setPlanRouteParams] = useState(props?.plan ? { planId: props?.plan?.id } : {});
  const [planRouteDatas, setPlanRouteDatas] = useState([]);
  const [orderTicketDatas, setOrderTicketDatas] = useState([]);
  const [planRouteUserDatas, setPlanRouteUserDatas] = useState([]);
  const [planRouteUserParams, setPlanRouteUserParams] = useState({
    plan_route_id: null,
  });
  const [isTicketTwoWay, setIsTicketTwoWay] = useState(false);

  //
  const [fareAmountTotal, setFareAmount] = useState(0);
  const [taxAmountTotal, setTaxAmount] = useState(0);
  const [signedLuggageFeeTotal, setSingedLuggageFee] = useState(0);
  const [feeDifTotal, setFeeDifTotal] = useState(0);
  const [totalPrice, setTotalPrice] = useState(0);
  const [planRouteSelect, setPlanRouteSelect] = useState<any>();
  const { isLoading: planRouteLoading } = useQuery({
    queryKey: [`${ServerStateKeysEnum.planRoute}${props.plan.plan.id}`],
    queryFn: async () => {
      const res: any = await getAllPlanRoute({
        planId: props.plan.plan.id,
        isAirTicket: true,
      });
      await setPlanRouteDatas(res.content);
      return res.content;
    },
    enabled: props.plan.plan.id != null,
    retry: false,
  });

  const { isLoading: planRouteUserLoading } = useQuery({
    queryKey: [`${ServerStateKeysEnum.planRouteUser}${planRouteUserParams.plan_route_id}`],
    queryFn: async () => {
      const res: any = await getAllPlanUser(planRouteUserParams);
      setPlanRouteUserDatas(res);
      return res;
    },
    enabled: planRouteUserParams.plan_route_id != null,
    retry: false,
  });

  const { isLoading: orderTicketLoading } = useQuery({
    queryKey: [`${ServerStateKeysEnum.orderTicket}${planRouteUserParams.plan_route_id}`],
    queryFn: async () => {
      const res: any = await getBookings({
        planRouteId: planRouteUserParams.plan_route_id,
      });
      setOrderTicketDatas(res);
      return res;
    },
    enabled: planRouteUserParams.plan_route_id != null,
    retry: false,
  });

  const onSelectChange = (newSelectedRowKeys: React.Key[]) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    getCheckboxProps: (record: any) => {
      return {
        disabled:
          [
            // isBookingStatus.CHO_THANH_TOAN.toString(),
            isBookingStatus.DA_THANH_TOAN.toString(),
            isBookingStatus.HOAN_THANH_DAT_VE.toString(),
          ].includes(record.order_status) || record?.confirm_status == ConfirmStatus.DA_XAC_NHAN, // Column configuration not to be checked
        name: record.id,
      };
    },
  };
  const hasSelected =
    selectedRowKeys.length > 0 &&
    [PlanStatusEnum.done_approve, PlanStatusEnum.wait_approve].includes(props?.plan?.plan?.status);

  const onChangeCurrentPage = (value: number) => {
    setCurrent(value);
  };

  const openCreateOrderTicketModal = () => {
    setShowCreateOrderTicket(true);
  };
  const closeCreateOrderTicketModal = () => {
    setShowCreateOrderTicket(false);
  };

  const handleBooking = async () => {
    openCreateOrderTicketModal();
  };
  const [indexActive, setIndexActive] = useState(null);
  const [showCreateOrderTicketModal, setShowCreateOrderTicket] = useState(false);
  const [showOrderTicketDetail, setShowOrderTicketDetail] = useState(false);
  const renderStyle = (index: any) => {
    if (indexActive == null) return {};
    if (index == indexActive) {
      return {
        color: 'white',
        backgroundColor: 'rgb(247, 55, 55)',
      };
    } else {
      return {};
    }
  };
  const chosePlanRoute = (item: any, index: any) => {
    setIndexActive(index);
    setPlanRouteUserParams({ plan_route_id: item.id });
    setPlanRouteSelect(item);
  };

  const handleCreateOrderTicket = async (value: FieldValues) => {
    const plan_route_user_revert: any[] = Array.isArray(value?.plan_route_user_revert)
      ? value.plan_route_user_revert
      : [];

    const data = {
      ...value,
      ...planRouteUserParams,
      plan_route_user: [...selectedRowKeys, ...plan_route_user_revert].map((i) => {
        return {
          plan_route_user_id: i,
        };
      }),
      plan_id: props.plan?.plan ? props.plan?.plan?.id : null,
    } as any;
    // setHiddenIframe(false);
    getUriWebBooking(data)
      .then((res: any) => {
        if (!res?.error && res.data != null) {
          window.open(res.data, '_blank');
          setShowCreateOrderTicket(false);
          setSelectedRowKeys([]);
          //set form default
          setValue('type', OrderType.VE_MOT_CHIEU);
          setValue('plan_route_revert_id', null);
          setValue('plan_route_user_revert', []);
        } else {
          message.warning('Hệ thống đặt vé máy bay xảy ra sự cố!');
        }
      })
      .catch(() => {
        message.warning('Hệ thống đặt vé máy bay xảy ra sự cố!');
      });

    // setIframe(true);
  };

  const showBookingDetail = (record: any) => {
    setBookingDetail(record);
    setBookingDatas([record]);

    if (Array.isArray(record?.booking_customers) && record?.booking_customers.length > 0) {
      setBookingCustomersDatas(record?.booking_customers);
      setFareAmount(
        record?.booking_customers.map((item) => (item.fare_amount ? item.fare_amount : 0)).reduce((a, b) => a + b, 0)
      );
      setTaxAmount(
        record?.booking_customers.map((item) => (item.tax_amount ? item.tax_amount : 0)).reduce((a, b) => a + b, 0)
      );
      setSingedLuggageFee(
        record?.booking_customers
          .map((item) => (item.signed_luggage_fee ? item.signed_luggage_fee : 0))
          .reduce((a, b) => a + b, 0)
      );
      setTotalPrice(record?.total_price);
      // setFeeDifTotal(
      //   totalPrice - signedLuggageFeeTotal - taxAmountTotal - fareAmountTotal
      // );
    }
    setShowOrderTicketDetail(true);
  };
  useEffect(() => {
    setFeeDifTotal(totalPrice - signedLuggageFeeTotal - taxAmountTotal - fareAmountTotal);
  }, [signedLuggageFeeTotal, taxAmountTotal, fareAmountTotal, totalPrice]);
  const [bookingDetail, setBookingDetail] = useState({} as any);

  const [listPlanRoute, setListplanRoute] = useState<ISelect[]>([]);

  const fetchRef = useRef(0);

  const getListPlanRoute = async (page: number) => {
    try {
      const res = (await handleGetPlanRoutesRequest(props.plan.plan.id)) as any;
      setListplanRoute(() => {
        return [...res.content];
      });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };

  const renderGender = (value: any) => {
    const gender: any = userGender.find((i) => i.value == value);
    return gender?.label;
  };

  const { control, handleSubmit, watch, reset, setValue, getValues } = useForm({
    defaultValues: {
      type: OrderType.VE_MOT_CHIEU,
      plan_route_revert_id: null,
    },
  } as any);
  const [bookingDatas, setBookingDatas] = useState<any>([]);
  const [bookingCustomersDatas, setBookingCustomersDatas] = useState([]);
  const [hiddenIframe, setHiddenIframe] = useState(true);

  const [srcIframe, setSrcIframe] = useState(null);
  const [iframe, setIframe] = useState(false);
  const onOkIframe = () => {
    setIframe(false);
    setSrcIframe(null);
    setShowCreateOrderTicket(false);
  };
  const cancelIframe = () => {
    setIframe(false);
    setSrcIframe(null);
    setShowCreateOrderTicket(false);
  };

  useEffect(() => {
    if (Array.isArray(planRouteDatas) && planRouteDatas.length > 0) {
      chosePlanRoute(planRouteDatas[0], 0);
    }
  }, [planRouteDatas]);

  // useEffect(() => {
  //   console.log("run watch");
  //   if (
  //     Array.isArray(bookingCustomersDatas) &&
  //     bookingCustomersDatas.length > 0
  //   ) {
  //     console.log("check");
  //   }
  // }, [bookingCustomersDatas]);
  return (
    <>
      {/* <div>{srcIframe}</div> */}

      <Row gutter={16}>
        <Col className="border_plan_route_list" span={6}>
          <div>
            <h2>{'Danh sách lộ trình'}</h2>
          </div>
          <div>
            {Array.isArray(planRouteDatas)
              ? planRouteDatas.map((item: any, index) => {
                  return (
                    <div
                      onClick={() => {
                        chosePlanRoute(item, index);
                      }}
                      key={item.id}
                    >
                      <Col span={24} className="border_route" style={renderStyle(index)}>
                        <Row className="row_plan_route">
                          <Col span={24}>
                            <h2 style={{}}>{item?.name ? item?.name : '--'}</h2>
                          </Col>
                        </Row>
                        <Row className="row_plan_route">
                          <Col span={7}>
                            <h3 style={{}}>{'Đơn vị đi'}</h3>
                          </Col>
                          :
                          <Col span={16} className="col_plan_route">
                            {item.from_department ? item?.from_department?.name : '--'}
                          </Col>
                        </Row>
                        <Row className="row_plan_route">
                          <Col span={7}>
                            <h3>{'Đơn vị đến'}</h3>
                          </Col>
                          :
                          <Col span={16} className="col_plan_route">
                            {item.to_department ? item?.to_department?.name : '--'}
                          </Col>
                        </Row>
                        <Row className="row_plan_route">
                          <Col span={7}>
                            <h3>{'Ngày bắt đầu'}</h3>
                          </Col>
                          :
                          <Col span={16} className="col_plan_route">
                            {item.start_time ? formatDate(item.start_time) : '--'}
                          </Col>
                        </Row>
                        <Row className="row_plan_route">
                          <Col span={7}>
                            <h3>{'Ngày kết thúc'}</h3>
                          </Col>
                          :
                          <Col span={16} className="col_plan_route">
                            {item.end_time ? formatDate(item.end_time) : '--'}
                          </Col>
                        </Row>
                      </Col>
                    </div>
                  );
                })
              : null}
          </div>
        </Col>
        <Col className="gutter-row" span={18}>
          <Row gutter={16}>
            <Col span={12}>
              <Steps
                type="navigation"
                size="small"
                current={current}
                onChange={onChangeCurrentPage}
                items={[
                  {
                    title: 'Danh sách nhân viên',
                  },
                  {
                    title: 'Danh sách vé đã đặt',
                  },
                ]}
              ></Steps>
            </Col>
            <Col span={2} offset={10}>
              <Button onClick={handleBooking} hidden={!hasSelected}>
                {'Đặt vé'}
              </Button>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={24} hidden={current != currentPage.DANH_SACH_NHAN_VIEN}>
              <Table
                rowSelection={rowSelection}
                columns={planRouteUserColumns}
                dataSource={planRouteUserDatas}
                pagination={false}
                loading={planRouteUserLoading}
                rowKey={'id'}
                locale={{
                  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} />,
                }}
              />
            </Col>
            <Col span={24} hidden={current != currentPage.DANH_SACH_VE_DA_DAT}>
              <Table
                columns={orderTicketColumns}
                dataSource={orderTicketDatas}
                pagination={false}
                loading={orderTicketLoading}
                locale={{
                  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} />,
                }}
              />
            </Col>
          </Row>
        </Col>
        <Modal
          destroyOnClose={true}
          title="Đặt vé máy bay"
          open={showCreateOrderTicketModal}
          onOk={() => handleSubmit(handleCreateOrderTicket)()}
          onCancel={closeCreateOrderTicketModal}
          okText="Đặt vé"
          cancelText="Trở về"
          width={'350px'}
        >
          <div>
            <Row>
              <Col span={16}>
                <Controller
                  name={'type'}
                  control={control}
                  render={({ field }) => (
                    <Radio.Group
                      {...field}
                      defaultValue={1}
                      onChange={(e) => {
                        setValue('type', e.target.value);
                        if (e.target.value == OrderType.VE_KHU_HOI) {
                          setIsTicketTwoWay(true);
                        } else {
                          setIsTicketTwoWay(false);
                          setValue('plan_route_revert_id', null);
                          setValue('plan_route_user_revert', []);
                        }
                      }}
                    >
                      <Radio value={OrderType.VE_MOT_CHIEU}>{'Vé một chiều'}</Radio>
                      <Radio value={OrderType.VE_KHU_HOI}>{'Vé khứ hồi'}</Radio>
                    </Radio.Group>
                  )}
                />
              </Col>
              <div>{watch('type') == OrderType.VE_KHU_HOI}</div>

              <Col span={24}>
                <MzFormSelect
                  controllerProps={{
                    control,
                    name: 'plan_route_revert_id',
                    rules: {
                      required: watch('type') == OrderType.VE_KHU_HOI ? 'Vui lòng chọn lộ trình chiều về' : false,
                    },
                  }}
                  selectProps={{
                    disabled: !isTicketTwoWay,
                    placeholder: 'Lộ trình chiều về',
                    options: listPlanRoute
                      ?.filter((item: any) => item.id !== planRouteUserParams.plan_route_id)
                      ?.map((i: any) => {
                        return {
                          label: i.name,
                          value: i.id,
                        };
                      }),
                    allowClear: true,
                    showSearch: true,
                    filterOption: (input, option) => {
                      const optionValue: string | undefined =
                        option?.label !== undefined ? option?.label?.toString() : '';
                      return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                    },
                  }}
                  callBack={(page) => {
                    getListPlanRoute(page);
                  }}
                  callbackChange={async (e) => {
                    if (e.length > 0) {
                      try {
                        const res = (await handleGetPlanRoutesRequest(props.plan.plan.id)) as any;
                        setListplanRoute(res.content);
                      } catch (e) {
                        toast(getMessageError(e), { type: 'error' });
                      }
                    } else {
                      getListPlanRoute(0);
                    }
                  }}
                />
              </Col>
              <Col span={24}>
                <MzFormSelectV3
                  isFormItem={true}
                  controllerProps={{
                    control,
                    name: 'plan_route_user_revert',
                    rules:
                      watch('plan_route_revert_id') != null ? { required: 'Vui lòng chọn nhân viên vé chiều về' } : {},
                  }}
                  selectProps={{
                    mode: 'multiple',
                    placeholder: 'Nhân viên chiều về',
                    allowClear: true,
                    showSearch: true,
                    disabled: watch('plan_route_revert_id') != null ? false : true,
                    filterOption: (input, option) => {
                      const optionValue: string | undefined =
                        option?.label !== undefined ? option?.label?.toString() : '';
                      return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                    },
                    style: {
                      width: '100%',
                    },
                  }}
                  uri={`plan-route-users/air-ticket/${
                    watch('plan_route_revert_id') != null ? watch('plan_route_revert_id') : 0
                  }`}
                  uriSearch={'name.contains='}
                  labelObj={['full_name']}
                  valueObj="id"
                  disabledValueObj={(i) => {
                    return parseInt(i.order_status) >= 3;
                  }}
                  defaultOption={{}}
                />
              </Col>
            </Row>
          </div>
        </Modal>
        <Modal
          destroyOnClose={true}
          title="Thông tin vé máy bay"
          open={showOrderTicketDetail}
          onOk={() => setShowOrderTicketDetail(false)}
          onCancel={() => setShowOrderTicketDetail(false)}
          cancelButtonProps={{
            hidden: true,
          }}
          okText="Đóng"
          cancelText="Đóng"
          width={'45%'}
          style={{
            top: 30,
            height: '100vh',
            maxWidth: '100vw',
          }}
          bodyStyle={{
            height: 'calc(90vh - 120px)',
            overflowY: 'scroll',
          }}
        >
          <h2 style={{ color: 'red' }}>{'Thông tin đặt chỗ'}</h2>

          <Row style={{ marginBottom: 8 }}>
            <Col span={4}>{'Hãng bay:'}</Col>
            <Col span={20}>
              <span style={{ fontWeight: 'bold', color: 'red' }}>
                {bookingDetail?.airline_name != null ? bookingDetail?.airline_name : '--'}
              </span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={4}>{'Mã đặt chỗ:'}</Col>
            <Col span={20}>
              <span style={{ fontWeight: 'bold', color: 'red' }}>
                {bookingDetail.order_ticket?.code != null ? bookingDetail?.code : '--'}
              </span>
            </Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={4}>{'Ngày đặt vé:'}</Col>
            <Col span={20}>
              {bookingDetail?.order_ticket?.order_date ? formatDate(bookingDetail?.order_ticket?.order_date) : '--'}
            </Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={4}>{'Người đặt:'}</Col>
            <Col span={8}>
              {bookingDetail?.order_ticket?.contact_name ? bookingDetail?.order_ticket?.contact_name : '--'}
            </Col>
            <Col span={4}>{'Số điện thoại:'}</Col>
            <Col span={8}>
              {bookingDetail?.order_ticket?.contact_phone ? bookingDetail?.order_ticket?.contact_phone : '--'}
            </Col>
          </Row>

          <h2 style={{ color: 'red' }}>{'Thông tin Khách hàng'}</h2>
          {bookingCustomersDatas.length > 0 ? (
            bookingCustomersDatas.map((item: any, index) => {
              return (
                <>
                  <Row style={{ marginBottom: 8 }}>
                    <Col span={12}>
                      {' '}
                      <span className="font_weight_boil">{`${index + 1}. ${item?.name}`}</span>
                    </Col>
                    <Col span={3}>{'Giá vé:'}</Col>
                    <Col span={9}>
                      <span className="font_weight_boil">
                        {item?.fare_amount ? `${formatCurrency(item?.fare_amount)}  VNĐ` : '--  VNĐ'}
                      </span>
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: 8 }}>
                    <Col span={3}>{'Giới tính:'}</Col>
                    <Col span={21} className="font_weight_boil">
                      {item?.gender ? renderGender(item?.gender) : '--'}
                    </Col>
                  </Row>
                  <Row style={{ marginBottom: 8 }}>
                    <Col span={24} hidden={item?.signed_luggage == null || item?.signed_luggage == 0}>
                      <Row>
                        <Col span={4}>{'Hành lý kí gửi'}</Col>
                        <Col span={8} className="font_weight_boil">
                          {item?.signed_luggage ? `${item?.signed_luggage}  kg` : '0 kg'}
                        </Col>
                        <Col span={9} offset={3} className="font_weight_boil">
                          {item?.signed_luggage_fee ? `${formatCurrency(item?.signed_luggage_fee)}  VNĐ` : '0 kg'}
                        </Col>
                      </Row>
                    </Col>
                  </Row>
                </>
              );
            })
          ) : (
            <div></div>
          )}
          <Row>
            <Col span={20}>
              <Divider />
            </Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={15}>Giá vé</Col>
            <Col span={8}>{`${formatCurrency(fareAmountTotal)} VNĐ`}</Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={15}>Thuế</Col>
            <Col span={8}>{`${formatCurrency(taxAmountTotal)} VNĐ`}</Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={15}>Hành lý kí gửi</Col>
            <Col span={8}>{`${formatCurrency(signedLuggageFeeTotal)} VNĐ`}</Col>
          </Row>
          <Row style={{ marginBottom: 8 }}>
            <Col span={15}>Chi phí khác</Col>
            <Col span={8}>{`${formatCurrency(feeDifTotal)} VNĐ`}</Col>
          </Row>
          <Row style={{ marginBottom: 8 }} className="font_weight_boil">
            <Col span={15}>Tổng</Col>
            <Col span={8}>{`${formatCurrency(totalPrice)} VNĐ`}</Col>
          </Row>

          <h2 style={{ color: 'red' }}>{'Thông tin Chuyến bay'}</h2>
          <Table
            columns={bookingColumns}
            dataSource={bookingDatas}
            size="small"
            pagination={false}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} />,
            }}
          ></Table>
        </Modal>
      </Row>
      {/* <Modal
        destroyOnClose={true}
        title="Đặt vé máy bay"
        open={iframe}
        onOk={onOkIframe}
        onCancel={cancelIframe}
        okText="OK"
        cancelText="Trở về"
        bodyStyle={{
          height: "calc(100vh - 120px)",
        }}
        style={{
          top: 0,
          height: "100vh",
          maxWidth: "100vw",
        }}
        width={"100vw"}
      >
        <iframe
          width="100%"
          height="100%"
          src={srcIframe}
          frameborder="0"
          allowfullscreen
        ></iframe>
      </Modal> */}
    </>
  );
};

export default function orderTicket(value) {
  return (
    <QueryClientProvider client={queryClient}>
      <OrderTicketModal plan={value} />
    </QueryClientProvider>
  );
}

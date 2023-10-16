import { Space, Button, Modal, Col, Row, Empty, Table, Input } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { DeleteOutlined } from '@ant-design/icons';
import { ColumnsType } from 'antd/es/table';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import formatNumber from '@utils/formatNumber';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
// import { call } from '../../../apis/baseRequest';
import './styles.scss';
import constant from '../../../constants/Constants';
import { handleAccountingTransferRequest, handleGetSummaryRequest } from '../../../apis/transfer-list/transfer-list';

const { Search } = Input;

interface Props {
  idEdit?: number | null;
  recordSelected?: Array<any>;
  isSignVoffice: boolean;
  reloadTable?: () => void;
  closeForm?: () => void;
  setBtnLoading?: (value) => void;
  setTransferRequestId?: (value) => void;
  setTransferRequestItem?: (value: Array<any>) => void;
}
const Form = forwardRef((props: Props, ref) => {
  const {
    idEdit,
    recordSelected,
    reloadTable,
    closeForm,
    isSignVoffice,
    setTransferRequestId,
    setTransferRequestItem,
    setBtnLoading,
  } = props;
  const { control, handleSubmit, watch, reset } = useForm();
  const [summaryRequestList, setSummaryRequestList] = useState<any>([]);
  const [isActive, setIsActive] = useState(true);
  const [isAddTrade, setIsAddTrade] = useState<boolean>(false);
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);
  const [tradeList, setTradeList] = useState<any>([]);
  const [tradeListSelected, setTradeListSelected] = useState<any>([]);
  // const { user } = useUserInfor();
  const summaryRequestColumns: ColumnsType<any> = [
    {
      title: 'STT',
      dataIndex: 'key',
      key: 'key',
      // dataType: "number",
      width: '5%',
    },
    {
      title: 'Tên đề nghị chuyển khoản',
      dataIndex: 'transfer_request_name',
      width: '15%',

      key: 'transfer_request_name',
    },
    {
      title: 'Mã nhân viên / Số CMND',
      dataIndex: 'account_number',
      width: '10%',

      key: 'account_number',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      width: '10%',

      key: 'full_name',
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'bank_account_number',
      width: '10%',

      key: 'bank_account_number',
    },
    {
      title: 'Số tiền',
      dataIndex: 'total_amount',

      width: '10%',
      key: 'total_amount',
      render: (text: string) => formatNumber(text),
    },
    {
      title: 'Nội dung gửi SMS',
      dataIndex: 'sms_content',
      width: '15%',

      key: 'sms_content',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      width: '15%',

      key: 'content',
    },
    {
      title: 'Hành động',
      dataIndex: 'id',
      align: 'center',
      render: (_, record) => (
        <Space>
          <DeleteOutlined
            onClick={() => {
              deleteSummaryRequest(record);
            }}
            style={{ color: 'red' }}
          />
        </Space>
      ),
    },
  ];
  const tradeColumns = [
    {
      title: 'Mã kế hoạch',
      dataIndex: 'code',
      width: '10%',
      dataType: 'string',
      key: 'code',
    },
    {
      title: 'Tên đề nghị chuyển khoản',
      dataIndex: 'transfer_request_name',
      width: '15%',
      dataType: 'string',
      key: 'transfer_request_name',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      width: '10%',
      dataType: 'string',
      key: 'full_name',
    },
    {
      title: 'Tên ngân hàng',
      dataIndex: 'bank_name',
      width: '10%',
      dataType: 'string',
      key: 'bank_name',
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'bank_account_number',
      width: '10%',
      dataType: 'string',
      key: 'bank_account_number',
    },
    {
      title: 'Số tiền',
      dataIndex: 'total_amount',
      dataType: 'number',
      width: '10%',
      key: 'total_amount',
      render: (text: string) => formatNumber(text),
    },
    {
      title: 'Nội dung gửi SMS',
      dataIndex: 'content_sms',
      width: '15%',
      dataType: 'string',
      key: 'content_sms',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      width: '15%',
      dataType: 'string',
      key: 'content',
    },
  ];
  useEffect(() => {
    let total_amount = 0;
    summaryRequestList.map((p) => (total_amount += Number(p.total_amount)));
    const item = {
      name: watch('name'),
      bank_account_number: watch('bank_account_number'),
      bank_name: watch('bank_name'),
      amount: formatNumber(total_amount),
    };
    reset(item);
  }, [summaryRequestList]);
  useEffect(() => {
    const result: any = JSON.parse(JSON.stringify(recordSelected));
    if (result.length > 0) {
      result.forEach((p, index) => {
        p.key = index + 1;
      });
    }
    setSummaryRequestList(result);
  }, [recordSelected]);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const deleteSummaryRequest = (record: any) => {
    const data: any = summaryRequestList.filter((p) => p.id !== record.id);
    if (data.length > 0) {
      data.forEach((p, index) => {
        p.key = index + 1;
      });
    }
    setSummaryRequestList(data);
  };
  const searchTrade = (value: string) => {
    const filter: any = {};

    filter['code.contains'] = value;
    filter['status.in'] = [constant.summaryStatus.DA_PHE_DUYET];
    getTrade(filter);
  };
  const addTrade = () => {
    const record: any = [...summaryRequestList, ...tradeListSelected];

    if (record.length > 0) {
      record.forEach((p, index) => {
        p.key = index + 1;
      });
    }
    setSummaryRequestList(record);
    setIsAddTrade(false);
  };
  // const getVehicle = async () => {
  //   try {
  //     const res = (await call({
  //       uri: "vehicles/" + idEdit,
  //       hasToken: true,
  //       method: "GET",
  //     })) as any;
  //     debugger;
  //     const resetData = { ...res };
  //     const vehicle_group: any = {};
  //     if (resetData.vehicle_group) {
  //       vehicle_group.label =
  //         resetData.vehicle_group.code + " - " + resetData.vehicle_group.name;
  //       vehicle_group.value = resetData.vehicle_group.id;
  //     }

  //     setListDefault([vehicle_group]);
  //     reset(resetData);
  //   } catch (e) {
  //     toast(getMessageError(e), { type: "error" });
  //   }
  // };
  // useEffect(() => {
  //   if (idEdit) {
  //     getVehicle();
  //   } else {
  //     reset({ name: null });
  //   }
  // }, [idEdit]);
  const addTransfer = async (value: FieldValues) => {
    if (summaryRequestList && summaryRequestList.length > 0) {
      try {
        const transfer_request_item: Array<any> = JSON.parse(JSON.stringify(summaryRequestList));
        if (transfer_request_item.length > 0) {
          transfer_request_item.forEach((p: any) => {
            p.amount = p.total_amount;
            p.status = constant.summaryStatus.TAO_BANG;
            p.name = p.transfer_request_name;
            p.entity_id = p.id;
            p.id_request = p.id;
            delete p.key;
          });
        }
        const data: any = {
          name: value.name,
          amount: Number(value.amount.replaceAll(',', '').replaceAll('.', '')),
          bank_account_number: '10979000899',
          bank_name: 'ViettelPay',
          created_time: dayjs().toISOString(),
          request_amount: summaryRequestList.length,
          status: constant.transferRequestStatus.CHUA_TRINH_KY,
          is_active: true,
          transfer_request_item: transfer_request_item,
          // ins_date: value.ins_date,
          // ins_id: value.ins_id,
          // upd_date: value.upd_date,
          // upd_id: value.upd_id,
        };
        // data.vehicle_group = {
        //   id: value.vehicle_group.id,
        // };
        if (setBtnLoading) {
          setBtnLoading(true);
        }

        const res = (await handleAccountingTransferRequest(data)) as any;
        if (setBtnLoading) {
          setBtnLoading(false);
        }
        if (!isSignVoffice) {
          if (closeForm) {
            closeForm();
          }
          if (reloadTable) {
            reloadTable();
          }
        } else {
          if (setTransferRequestId) {
            setTransferRequestId(res.id);
            setTransferRequestItem?.(transfer_request_item);
            if (closeForm) {
              closeForm();
            }
            if (reloadTable) {
              reloadTable();
            }
          }
        }

        toast(`Tạo bảng đề nghị thành công`, { type: 'success' });
      } catch (e) {
        if (setBtnLoading) {
          setBtnLoading(false);
        }
        toast(getMessageError(e), { type: 'error' });
      }
    } else {
      toast('Vui lòng thêm giao dịch', { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addTransfer)();
    },
  }));
  const openAddTrade = () => {
    setIsAddTrade(true);
  };
  const getTrade = async (params?: any) => {
    setTradeLoading(true);
    try {
      const res = (await handleGetSummaryRequest(params)) as any;
      const currentIds: any = [];
      let tradeList: any = [];
      summaryRequestList.map((p) => {
        currentIds.push(p.id);
      });
      tradeList = res.content.filter((p) => !currentIds.includes(p.id));
      setTradeLoading(false);
      setTradeList(tradeList);
    } catch (error) {
      setTradeLoading(false);
      console.error(error);
    }
  };
  useEffect(() => {
    if (isAddTrade) {
      const filter: any = {};
      filter['status.in'] = [constant.summaryStatus.DA_PHE_DUYET];
      getTrade(filter);
    }
  }, [isAddTrade]);
  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[8, 8]} align="middle">
          <Col span={12}>
            <Col span={24}>
              {' '}
              <span style={{ color: 'red' }}>*</span> Tên đề nghị chuyển khoản:
            </Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'name',
                  rules: { required: 'Vui lòng nhập tên đề nghị' },
                }}
                inputProps={{
                  placeholder: 'Tên đề nghị',
                }}
              />
            </Col>
          </Col>
          <Col span={12}>
            <Row>
              <Col span={24}>Ngày tạo:</Col>
              <Col span={24}>
                <MzFormDatePicker
                  controllerProps={{
                    control,
                    name: 'created_time',
                  }}
                  datePickerProps={{
                    placeholder: 'Ngày tạo',
                    style: { width: '100%' },
                    defaultValue: dayjs(),
                    format: 'DD/MM/YYYY',
                    disabled: true,
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row>Nguồn đi tiền</Row>
        <Row gutter={[8, 8]}>
          <Col span={12}>
            <Col span={24}>Tên ngân hàng:</Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'bank_name',
                }}
                inputProps={{
                  placeholder: 'Tên ngân hàng',
                  defaultValue: 'ViettelPay',
                  disabled: true,
                }}
              />
            </Col>
          </Col>
          <Col span={12}>
            <Col span={24}>Số tài khoản:</Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'bank_account_number',
                }}
                inputProps={{
                  placeholder: 'Số tài khoản',
                  defaultValue: '10979000899',
                  disabled: true,
                }}
              />
            </Col>
          </Col>
          <Col span={12}>
            <Col span={24}>Tổng tiền:</Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'amount',
                }}
                inputProps={{
                  placeholder: 'Tổng tiền',
                  disabled: true,
                }}
              />
            </Col>
          </Col>
        </Row>
        <Row justify="end" style={{ marginBottom: '16px' }}>
          <Button onClick={() => openAddTrade()} type="primary">
            Thêm giao dịch
          </Button>
        </Row>
        <Row>
          <Table
            pagination={false}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} />,
            }}
            scroll={{ y: 'calc(100vh - 540px)' }}
            columns={summaryRequestColumns}
            dataSource={summaryRequestList}
            style={{ width: '100%' }}
          />
        </Row>
      </div>
      <Modal
        destroyOnClose={true}
        open={isAddTrade}
        onCancel={() => {
          setIsAddTrade(false);
          setTradeListSelected([]);
        }}
        title={`Thêm giao dịch`}
        footer={[
          <Button style={{ border: 'unset', background: '#ffffff' }} onClick={() => setIsAddTrade(false)} key={v4()}>
            Thoát
          </Button>,
          <Button
            style={{
              background: '#ed1b2f',
              borderColor: '#ed1b2f',
              width: '120px',
              color: '#fff',
            }}
            onClick={() => addTrade()}
            key={v4()}
          >
            Thêm giao dịch
          </Button>,
        ]}
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
        <Col style={{ padding: '16px 0px' }} span={24}>
          <Row gutter={[0, 8]}>
            <Col span={12}>
              <Row gutter={[0, 8]}>
                <Col span={24}>Mã kế hoạch</Col>
                <Col span={12}>
                  <Search placeholder="Nhập mã kế hoạch" onSearch={searchTrade} />
                </Col>
              </Row>
            </Col>
            <Col span={24}>
              <Table
                rowKey="id_type"
                pagination={false}
                locale={{
                  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} />,
                }}
                // rowKey={"id"}
                rowSelection={{
                  type: 'checkbox',
                  onChange: (_, record) => {
                    setTradeListSelected(record);
                  },
                }}
                scroll={{ y: 'calc(100vh - 300px)' }}
                columns={tradeColumns}
                dataSource={tradeList}
                style={{ width: '100%' }}
              />
            </Col>
          </Row>
        </Col>
      </Modal>
    </>
  );
});

export default Form;

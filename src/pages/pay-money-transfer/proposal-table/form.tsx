import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { FieldValues, useForm } from 'react-hook-form';
import { DeleteOutlined } from '@ant-design/icons';
import { Space, Button, Modal, Col, Row, Table, Empty, Input } from 'antd';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import formatNumber from '@utils/formatNumber';
import { MzFormInput } from '@components/forms/FormInput';
import getMessageError from '@utils/getMessageError';
import constant from '../../../constants/Constants';
import { detail, handleAddOrEditRequest, handleGetTradeRequest, handleResUpdateItem } from '../../../apis/proposal-table/proposal-table';

const { Search } = Input;
interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
  setBtnLoading?: (value) => void;
}
const Form = forwardRef((props: Props, ref) => {
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
  const summaryRequestColumns: any = [
    {
      title: 'STT',
      dataIndex: 'key',
      key: 'key',
      // dataType: "number",
      width: '5%',
    },
    {
      title: 'Tên đề nghị chuyển khoản',
      dataIndex: 'name',
      width: '15%',
      dataType: 'string',
      key: 'name',
    },
    {
      title: 'Mã nhân viên / Số CMND',
      dataIndex: 'username',
      width: '10%',
      dataType: 'string',
      key: 'username',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'full_name',
      width: '10%',
      dataType: 'string',
      key: 'full_name',
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
      dataIndex: 'amount',
      dataType: 'number',
      width: '10%',
      key: 'amount',
      render: (text: string) => formatNumber(text),
    },
    {
      title: 'Nội dung gửi SMS',
      dataIndex: 'content_sms',
      width: '10%',
      dataType: 'string',
      key: 'content_sms',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      width: '10%',
      dataType: 'string',
      key: 'content',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: '10%',
      key: 'status',
      render: (value) => {
        renderItemStatus(value);
      },
    },
    {
      title: 'Lý do lỗi',
      dataIndex: 'import_error',
      width: '10%',
      key: 'import_error',
    },
    {
      title: 'Hành động',
      dataIndex: 'id',
      align: 'center',
      width: '10%',
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
  const { idEdit, reloadTable, closeForm, setBtnLoading } = props;
  const { control, handleSubmit, watch, reset } = useForm();
  const [isActive, setIsActive] = useState(true);
  const [isAddTrade, setIsAddTrade] = useState<boolean>(false);
  const [tradeLoading, setTradeLoading] = useState<boolean>(false);
  const [tradeList, setTradeList] = useState<any>([]);
  const [tradeListSelected, setTradeListSelected] = useState<any>([]);
  const [summaryRequestList, setSummaryRequestList] = useState<any>([]);
  const [transferRequestItemOld, setTransferRequestItemOld] = useState<any>([]);
  const [transferRequestStatus, setTransferRequestStatus] = useState<number>(2);
  const [code, setCode] = useState<string>('');
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getTransferRequest = async () => {
    try {
      const res = (await detail(idEdit)) as any;
      setTransferRequestStatus(res?.status);
      const resetData = { ...res };
      resetData.created_time = dayjs(resetData.created_time);
      setCode(res.code);
      if (res.transfer_request_item.length > 0) {
        res.transfer_request_item.forEach((p, index) => {
          p.key = index + 1;
        });
      }
      setTransferRequestItemOld(res.transfer_request_item);
      setSummaryRequestList(res.transfer_request_item);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
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
  const renderStatus = (status: number) => {
    switch (status) {
      case constant.transferRequestStatus.CHO_PHE_DUYET:
        return 'Chờ phê duyệt';
      case constant.transferRequestStatus.CHUA_TRINH_KY:
        return 'Chưa trình ký';
      case constant.transferRequestStatus.DA_CAP_NHAT:
        return 'Đã cập nhật';
      case constant.transferRequestStatus.DA_PHE_DUYET:
        return 'Đã phê duyệt';
      case constant.transferRequestStatus.TU_CHOI:
        return 'Từ chối';
      default:
        return '--';
    }
  };

  const renderItemStatus = (status: number) => {
    switch (status) {
      case constant.summaryStatus.HOAN_THANH_CHI:
        return 'Chi thành công';
      case constant.summaryStatus.CHUYEN_KHOAN_LOI:
        return 'Chi thất bại';
      case constant.summaryStatus.DANG_XU_LY_CHI_TIEN:
        return 'Đang xử lý chi tiền';
      default:
        return '';
    }
  };
  const addTrade = () => {
    const listSelected: any = JSON.parse(JSON.stringify(tradeListSelected));
    if (listSelected.length > 0) {
      listSelected.forEach((p) => {
        p.amount = p.total_amount;
        p.entity_id = p.id;
      });
    }
    const record: any = [...summaryRequestList, ...listSelected];

    if (record.length > 0) {
      record.forEach((p, index) => {
        p.key = index + 1;
      });
    }
    setSummaryRequestList(record);
    setIsAddTrade(false);
  };
  const searchTrade = (value: string) => {
    const filter: any = {};

    filter['code.contains'] = value;
    filter['status.in'] = [constant.summaryStatus.DA_PHE_DUYET];
    getTrade(filter);
  };
  const getTrade = async (params?: any) => {
    setTradeLoading(true);
    try {
      const res = (await handleGetTradeRequest(idEdit, params)) as any;
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
  useEffect(() => {
    let total_amount = 0;
    summaryRequestList.map((p) => (total_amount += Number(p.amount)));
    const item = {
      name: watch('name'),
      bank_account_number: watch('bank_account_number'),
      bank_name: watch('bank_name'),
      created_time: watch('created_time'),
      amount: formatNumber(total_amount),
    };
    reset(item);
  }, [summaryRequestList]);
  useEffect(() => {
    if (idEdit) {
      getTransferRequest();
    } else {
      reset({ name: null });
    }
  }, [idEdit]);
  const addOrEditTransferRequest = async (value: FieldValues) => {
    if (summaryRequestList && summaryRequestList.length > 0) {
      try {
        const transfer_request_item: any = JSON.parse(JSON.stringify(summaryRequestList));
        if (transfer_request_item.length > 0) {
          transfer_request_item.forEach((p: any) => {
            p.status = constant.summaryStatus.TAO_BANG;
            p.name = p.transfer_request_name;
            p.entity_id = p.entity_id;
            delete p.id;
            delete p.key;
          });
        }
        const data: any = {
          name: value.name,
          id: idEdit,
          code: code ? code : '',
          amount: Number(value.amount.toString().replaceAll(',', '').replaceAll('.', '')),
          bank_account_number: value.bank_account_number,
          bank_name: value.bank_name,
          created_time: dayjs(value.created_time).toISOString(),
          request_amount: summaryRequestList.length,
          status: transferRequestStatus,
          is_active: true,
          transfer_request_item: transfer_request_item,
          // ins_date: value.ins_date,
          // ins_id: value.ins_id,
          // upd_date: value.upd_date,
          // upd_id: value.upd_id,
        };
        if (setBtnLoading) {
          setBtnLoading(true);
        }
        const res = (await handleAddOrEditRequest(idEdit, data)) as any;
        if (res.id) {
          if (transferRequestItemOld.length > 0) {
            const itemOld: any = [];
            transferRequestItemOld.map((p) => {
              itemOld.push({ key: `${p.entity_id}-${p.type}`, entity_id: p.entity_id, type: p.type });
            });
            const itemNew: any = [];
            transfer_request_item.map((p) => {
              itemNew.push(`${p.entity_id}-${p.type}`);
            });
            const itemChange: any = [];
            itemOld.map((p) => {
              if (!itemNew.includes(p.key)) {
                itemChange.push(p);
              }
              // itemNew.map((q) => {
              //   if (JSON.stringify(p) !== JSON.stringify(q)) {
              //     itemChange.push(p);
              //   }
              // });
            });
            const result = [...new Set(itemChange)];
            if (result.length > 0) {
              result.map(async (p: any) => {
                const payloadItem = {
                  id: p.entity_id,
                  reason: '',
                  status: constant.summaryStatus.DA_PHE_DUYET,
                };
                const resUpdateItem = (await handleResUpdateItem(p, payloadItem)) as any;
                if (resUpdateItem.error) {
                  toast(res.message, { type: 'error' });
                }
              });
            }
          }
        }
        if (setBtnLoading) {
          setBtnLoading(false);
        }
        if (closeForm) {
          closeForm();
        }
        if (reloadTable) {
          reloadTable();
        }

        toast(`${idEdit ? 'Sửa' : 'Thêm'} bảng đề nghị chuyển khoản thành công`, {
          type: 'success',
        });
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
  const openAddTrade = () => {
    setIsAddTrade(true);
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditTransferRequest)();
    },
  }));
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
                pagination={false}
                locale={{
                  emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} />,
                }}
                rowKey={'id_type'}
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

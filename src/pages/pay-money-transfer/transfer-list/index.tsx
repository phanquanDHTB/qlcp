import { Button, Space, Popconfirm, Row, Col, Modal, message, Input, Checkbox } from 'antd';
import { forwardRef, useImperativeHandle, useMemo } from 'react';
import { toast } from 'react-toastify';
import FileSaver from 'file-saver';
import { MinusCircleOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRef, useState, useEffect } from 'react';
import { v4 } from 'uuid';
import { useFieldArray } from 'react-hook-form';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import toSlug from '@utils/toSlug';
import getMessageError from '@utils/getMessageError';
import { MzFormSelect } from '@components/forms/FormSelect';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { MzFormPassword } from '@components/forms/FormPassword';
import { MzFormCheckbox } from '@components/forms/FormCheckbox';
import TableData from '@components/TableData';
import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import planTitle from '@columnTitles/summary-request';
import { MzFormInput } from '@components/forms/FormInput';
import Form from './form';
import { pdfSignPosition } from '../../../constants/enumConmon';
import constant from '../../../constants/Constants';
import { call } from '../../../apis/baseRequest';

const { TextArea } = Input;
const TransferListPage = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 150,
      dataIndex: 'code',
      // isCodeIndex: true,
      fixed: 'left',
    },
    {
      width: 250,
      dataIndex: 'payment_name',
    },
    {
      width: 250,
      dataIndex: 'transfer_request_name',
    },
    // {
    //   width: 250,
    //   dataIndex: "name",
    // },
    {
      width: 300,
      dataIndex: 'status',
      dataType: 'list',
      dataSource: [
        {
          value: 1,
          text: 'Đã phê duyệt',
        },
        {
          value: 2,
          text: 'Tạo bảng tổng hợp chuyển khoản',
        },
        {
          value: 3,
          text: 'Chờ duyệt bảng tổng hợp chuyển khoản',
        },
        {
          value: 4,
          text: 'Đã phê duyệt bảng tổng hợp chuyển khoản',
        },
        {
          value: 5,
          text: 'Từ chối bảng tổng hợp chuyển khoản',
        },
        {
          value: 6,
          text: 'Kế toán ngân hàng từ chối',
        },
        {
          value: 7,
          text: 'Chi thành công',
        },
        {
          value: 8,
          text: 'Chi thất bại',
        },
        {
          value: 9,
          text: 'Đang xử lý chi tiền',
        },
      ],
    },
    {
      width: 200,
      dataIndex: 'username',
    },
    {
      width: 200,
      dataIndex: 'full_name',
    },
    {
      width: 200,
      dataIndex: 'bank_name',
    },
    {
      width: 200,
      dataIndex: 'bank_account_number',
    },
    {
      width: 200,
      dataIndex: 'description',
    },
    {
      width: 200,
      dataIndex: 'content',
    },
    // {
    //   width: 200,
    //   dataIndex: "date_request",
    //   dataType:'date'
    // },
    {
      width: 200,
      dataIndex: 'total_amount',
      dataType: 'number',
    },
    {
      width: 200,
      dataIndex: 'reason',
    },
    {
      width: 120,
      dataIndex: 'id',
      align: 'center',
      render: (_, record) => (
        <Space>
          {record.status == constant.summaryStatus.DA_PHE_DUYET ? (
            <Button onClick={() => confirmCancelRequest(record)}>
              <MinusCircleOutlined />
            </Button>
          ) : null}
        </Space>
      ),
    },
  ];
  const columnsTablePayment = [
    {
      title: 'STT',
      dataIndex: '',
      key: 'name',
      width: 180,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên File',
      dataIndex: 'file_name',
      key: 'name',
      width: 350,
      render: (v, record) =>
        v && (
          <a
            onClick={async () => {
              try {
                const res = (await call({
                  uri: `files/${record.file_id}/download`,
                  method: 'GET',
                  hasToken: true,
                  configRequest: {
                    responseType: 'blob',
                  },
                })) as any;
                FileSaver.saveAs(new Blob([res]), record.file_name);
              } catch (err) {}
            }}
          >
            {v}
          </a>
        ),
    },
  ];

  const formRef = useRef<{
    submitForm: () => void;
    transferRequestId: number | null;
  }>();
  const [signBtnLoading, setSignBtnLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [recordSelected, setRecordSelected] = useState<[]>([]);
  const [isCreate, setIsCreate] = useState<boolean>(false);
  const base = useRef<{ reloadBasePage: () => void; selected: any }>();
  const { control, handleSubmit, watch, reset } = useForm();
  const [required, setRequired] = useState(0);
  const [listBill, setListBill] = useState<any>([]);
  const vOfficeForm = useForm();
  const [isVofficeDetail, setIsVofficeDetail] = useState(false);
  const [isVoffice, setIsVoffice] = useState(false);
  const [listDoc, setListDoc] = useState<any>([]);
  const [dataTablePayment, setDataTablePayment] = useState<any>([]);
  const [dataTableQuota, setDataTableQuota] = useState<any>([]);
  const [listDomain, setListDomain] = useState<any>([]);
  const [userInfor, setUserInfor] = useState<any>(null);
  const [isSignVoffice, setIsSignVoffice] = useState<any>(false);
  const [transferRequestId, setTransferRequestId] = useState<any>();
  const [transferRequestItem, setTransferRequestItem] = useState<Array<any>>();
  const [total, setTotal] = useState(0);
  const vOfficeDetailForm = useForm({
    defaultValues: {
      isAutoPromulgate: true,
      priorityId: 1,
      documentTypeId: listDoc[0]?.value,
    },
  }) as any;
  const vofficeData = useFieldArray({
    control: vOfficeDetailForm.control,
    name: 'usersSignDTOS',
  });
  const totalBill = useMemo(() => {
    return listBill.reduce((accumulator, currentValue) => accumulator + currentValue.total_final_amount, 0);
  }, [listBill]);
  const money = total + totalBill - required;
  const columnsTablePayment3 = [
    {
      title: 'STT',
      dataIndex: '',
      key: 'name',
      width: 180,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Số, Ký hiệu văn bản',
      dataIndex: 'file_name',
      key: 'name',
      width: 350,
      // render: (v) => v && <a href={''}>{v}</a>
    },
    {
      title: 'Trích yếu nội dung văn bản',
      dataIndex: 'file_name',
      key: 'name',
      width: 350,
      // render: (v) => v && <a href={''}>{v}</a>
    },
  ];
  const columnsVoffice = [
    {
      title: 'STT',
      dataIndex: 'code',
      key: 'name',
      width: 180,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nhân viên',
      dataIndex: 'display_name',
      key: 'name',
      width: 350,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'name',
      width: 250,
    },
    {
      title: () => (
        <Row style={{ fontSize: '16px' }}>
          <span style={{ color: 'red', marginRight: 10 }}>*</span> Đơn vị - Chức vụ
        </Row>
      ),
      dataIndex: 'plan_user',
      key: 'name',
      render: (_, record, index) => (
        <MzFormSelectV2
          controllerProps={{
            control: vOfficeDetailForm.control,
            name: `usersSignDTOS.${index}.departmentRole.org_id`,
            rules: { required: 'Vui lòng chọn đơn vị - chức vụ người ký' },
          }}
          uri={`voffice/users-role?keyword=${record.employee_id}&username=${vOfficeForm.getValues(
            'username'
          )}&password=${vOfficeForm.getValues('password')}`}
          uriSearch={'orgName.contains='}
          selectProps={{
            style: {
              width: '70%',
            },
            placeholder: 'Chọn đơn vị, chức vụ',
            allowClear: true,
            filterOption: (input, option) => {
              const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
              return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
            },
            onSelect: (_, record) => {
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
          labelObj={['position', 'org_name']}
          valueObj={'org_id'}
        />
      ),
    },
    {
      title: 'Hiển thị chữ ký',
      dataIndex: 'id',
      key: 'name',
      width: 200,
      render: (_, record) => <Checkbox checked={record?.is_display} onChange={() => changeDisplay(record)}></Checkbox>,
    },
    {
      title: 'Hành động',
      dataIndex: 'id',
      key: 'name',
      width: 200,
      render: (_, __, index) => <Button icon={<DeleteOutlined />} onClick={() => vofficeData.remove(index)}></Button>,
    },
  ];
  const changeDisplay = (record) => {
    const data: any = vofficeData.fields;
    if (data.length > 0) {
      data.forEach((p) => {
        if (p.id == record.id) {
          p.is_display = !p.is_display;
          if (p.is_display) {
            p.isDisplay = 1;
          } else {
            p.isDisplay = 0;
          }
        }
      });
      vOfficeDetailForm.setValue('usersSignDTOS', data);
    }
  };
  const saveForm = async (ref) => {
    await ref.submitForm();
  };
  const loginVoffice = async (data) => {
    try {
      const res = (await call({
        uri: 'voffice/login',
        method: 'POST',
        hasToken: true,
        bodyParameters: data,
      })) as any;
      if (res.data) {
        setIsVoffice(false);
        setIsVofficeDetail(true);
        toast('Đăng nhập thành công');
        vOfficeDetailForm.setValue('usersSignDTOS', []);
        getDoctype();
        getDomain();
        getFile(
          'export-pdf/mandate/' + transferRequestId,
          `files/upload-voffice?position=${pdfSignPosition.DE_NGHI_CHUYEN_TIEN}`,
          (data) => setDataTableQuota((pre) => [...pre, data]),
          'UNC.pdf'
        );
        getFile(
          'export-pdf/payment-request/plan/' + transferRequestId,
          `files/upload-voffice?position=${pdfSignPosition.UNC}`,
          (data) => setDataTablePayment((pre) => [...pre, data]),
          'DE_NGHI_CHUYEN_KHOAN.pdf'
        );
      } else {
        toast('Sai thông tin đăng nhập', { type: 'error' });
      }
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };
  const getDoctype = async () => {
    try {
      const res = (await call({
        uri: 'voffice/docTypes?docType=true',
        method: 'GET',
        hasToken: true,
      })) as any;
      const listDoc = res?.map((i: any) => ({ label: i.name, value: i.id }));
      setListDoc(listDoc);
    } catch (err) {
      console.log(err);
    }
  };
  const getDomain = async () => {
    try {
      const res = (await call({
        uri: 'voffice/domains?domain=true',
        method: 'GET',
        hasToken: true,
      })) as any;
      const listDomain = res?.map((i: any) => ({ label: i.name, value: i.id }));
      setListDomain(listDomain);
    } catch (err) {
      console.log(err);
    }
  };

  const getFile = async (urlGet: string, urlUpload: string, callback: any, name: string) => {
    try {
      const res = (await call({
        uri: urlGet,
        method: 'GET',
        hasToken: true,
        configRequest: {
          responseType: 'blob',
        },
      })) as any;
      const formData = new FormData();
      formData.append('file', res, name);
      const dataInfor = await call({
        uri: urlUpload,
        method: 'POST',
        hasToken: true,
        isFormUpload: true,
        bodyParameters: formData,
      });
      callback(dataInfor);
    } catch (err) {
      console.log(err);
    }
  };
  const handleCloseSign = () => {
    setIsVofficeDetail(false);
    setDataTablePayment([]);
    setDataTableQuota([]);
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
  useEffect(() => {
    if (transferRequestId) {
      setIsVoffice(true);
    }
  }, [transferRequestId]);
  const addSign = async (data: any) => {
    setSignBtnLoading(true);
    const arr = [...dataTablePayment, ...dataTableQuota];
    if (arr.length > 0) {
      data.files = arr?.map((i: any) => i.file_id);
    }
    data.username = vOfficeForm.getValues('username');
    data.password = vOfficeForm.getValues('password');
    data.planId = transferRequestId ? transferRequestId : null;
    //document type transfer request = 3
    data.type = 3;
    try {
      const payload: any = {
        id: transferRequestId,
        status: constant.transferRequestStatus.CHO_PHE_DUYET,
      };
      const transfer_request_item = transferRequestItem;
      const res = (await call({
        uri: 'voffice/send',
        method: 'POST',
        hasToken: true,
        bodyParameters: data,
      })) as any;
      if (res.error) {
        setSignBtnLoading(false);
        toast(res.message, { type: 'error' });
      } else {
        handleCloseSign();
        toast('Thành công', { type: 'success' });
        const resUpdate = (await call({
          uri: 'transfer-requests/update-status',
          method: 'PUT',
          hasToken: true,
          bodyParameters: payload,
        })) as any;
        if (resUpdate.error) {
          setSignBtnLoading(false);
          toast(res.message, { type: 'error' });
        }
        setIsCreate(false);
        setTransferRequestId(null);

        if (transfer_request_item) {
          transfer_request_item.map(async (p) => {
            const payloadItem = {
              id: p.entity_id,
              reason: '',
              status: constant.summaryStatus.CHO_DUYET_BANG,
            };
            const resUpdateItem = (await call({
              uri: `${
                p?.type == constant.summaryRequestType.DE_NGHI_CHI ? 'payment-requests' : 'plan-requireds'
              }/cancel`,
              method: 'PUT',
              hasToken: true,
              bodyParameters: payloadItem,
            })) as any;
            if (resUpdateItem.error) {
              setSignBtnLoading(false);
              toast(res.message, { type: 'error' });
            }
          });
        }
        reloadTable();
        setSignBtnLoading(false);
      }
    } catch (err) {
      setSignBtnLoading(false);
      toast(getMessageError(err), { type: 'error' });
    }
  };
  const confirmCancelRequest = (record) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn từ chối đề nghị ${record.code} ?`,
      content: (
        <MzFormInput
          inputType={'TextArea'}
          controllerProps={{
            control,
            name: 'reasonCancel',
          }}
          textAreaProps={{
            placeholder: 'Nhập lý do từ chối',
          }}
        />
      ),
      okText: 'Đồng ý',
      cancelText: 'Từ chối',
      onOk() {
        cancelSummaryRequest(record);
      },
      
    });
  };
  const cancelSummaryRequest = (record) => {
    const payload = {
      id: record.id,
      status: constant.summaryStatus.KE_TOAN_TU_CHOI,
      reason: watch('reasonCancel'),
    };
    call({
      uri: `${
        record.type == constant.summaryRequestType.DE_NGHI_CHI ? 'payment-requests/cancel' : 'plan-requireds/cancel'
      }`,
      method: 'PUT',
      bodyParameters: payload,
      hasToken: true,
    })
      .then(() => {
        message.success(`Từ chối thành công đề nghị chuyển khoản ${record.code}`);
        reloadTable();
      })
      .catch((error) => {
        console.log(error);
      });
  };
  const renderCreateTable = () => {
    return recordSelected.length ? (
      <div>
        <span style={{ marginRight: 10 }}>Đã chọn: {recordSelected.length}</span>
        <Button onClick={() => setIsCreate(true)} type="primary">
          Tạo bảng đề nghị
        </Button>
      </div>
    ) : null;
  };
  const reloadTable = () => {
    if (base.current) {
      base.current.reloadBasePage();
      setRecordSelected([]);
    }
  };
  const disabledRowCheck = (record) => {
    if (
      record.status == constant.summaryStatus.TAO_BANG ||
      record.status == constant.summaryStatus.CHO_DUYET_BANG ||
      record.status == constant.summaryStatus.DA_PHE_DUYET_BANG ||
      record.status == constant.summaryStatus.KE_TOAN_TU_CHOI ||
      record.status == constant.summaryStatus.HOAN_THANH_CHI ||
      record.status == constant.summaryStatus.TU_CHOI_BANG ||
      record.status == constant.summaryStatus.CHUYEN_KHOAN_LOI
    ) {
      return true;
    } else {
      return false;
    }
  };
  return (
    <>
      <BasePage
        ref={base}
        // rowKey={'id_type'}
        isDeleteButton={false}
        uriFetch="summary-requests"
        columnTiles={planTitle}
        columns={columns}
        headerTitle={'Danh sách đề nghị chuyển khoản'}
        setRecordSelected={(data: any) => setRecordSelected(data)}
        disabledRowCheck={(data: any) => disabledRowCheck(data)}
        buttonCustom={renderCreateTable}
        isMultipleDelete={false}
      ></BasePage>
      <Modal
        destroyOnClose={true}
        open={isCreate}
        onCancel={() => {
          setIsCreate(false);
        }}
        title={`Tạo bảng đề nghị`}
        footer={[
          <Button style={{ border: 'unset', background: '#ffffff' }} onClick={() => setIsCreate(false)} key={v4()}>
            Thoát
          </Button>,
          <Button
            loading={btnLoading}
            style={{
              background: '#ed1b2f',
              borderColor: '#ed1b2f',
              width: '120px',
              color: '#fff',
            }}
            onClick={async () => {
              if (formRef.current) {
                await setIsSignVoffice(true);
                saveForm(formRef.current);
              }
            }}
            key={v4()}
          >
            Lưu và trình ký
          </Button>,
          <Button
            loading={btnLoading}
            style={{
              background: '#ed1b2f',
              borderColor: '#ed1b2f',
              width: '120px',
              color: '#fff',
            }}
            onClick={() => {
              if (formRef.current) {
                saveForm(formRef.current);
              }
            }}
            key={v4()}
          >
            Lưu
          </Button>,
        ]}
        bodyStyle={{
          height: 'calc(100vh - 120px)',
          padding: '0px',
          overflowX: 'hidden',
        }}
        style={{
          top: 0,
          height: '100vh',
          maxWidth: '100vw',
        }}
        width={'100vw'}
      >
        <Form
          ref={formRef}
          reloadTable={() => reloadTable()}
          closeForm={() => setIsCreate(false)}
          setTransferRequestId={setTransferRequestId}
          setTransferRequestItem={setTransferRequestItem}
          setBtnLoading={(value) => setBtnLoading(value)}
          isSignVoffice={isSignVoffice}
          recordSelected={recordSelected}
        />
      </Modal>
      {/* trình ký */}
      <Modal
        destroyOnClose={true}
        title={'Thông tin trình ký'}
        open={isVofficeDetail}
        onCancel={() => handleCloseSign()}
        bodyStyle={{
          height: 'calc(100vh - 120px)',
          overflowY: 'scroll',
          overflowX: 'hidden',
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
            loading={signBtnLoading}
            key={1}
            type={'primary'}
            onClick={() =>
              vOfficeDetailForm.handleSubmit(
                (data) => addSign(data),
                (err) => {
                  if (err.usersSignDTOS) {
                    toast(err.usersSignDTOS[0]?.departmentRole?.org_id?.message, { type: 'error' });
                  }
                }
              )()
            }
          >
            Trình ký
          </Button>,
          <Button key={2} onClick={() => handleCloseSign()}>
            Đóng
          </Button>,
        ]}
      >
        <div className={'modal-scroll'}>
          <div style={{ borderBottom: '1px solid #d9d9d9', marginBottom: 20 }} />
          <Row gutter={[8, 0]}>
            <Col span={12}>
              <Col span={24} style={{ marginBottom: '8px' }}>
                <Row gutter={[8, 0]}>
                  <Col>
                    <span style={{ color: 'red', marginRight: 5 }}>*</span>
                  </Col>
                  <Col>Trích yếu nội dung văn bản:</Col>
                </Row>
              </Col>
              <Col span={24}>
                <MzFormInput
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'title',
                    rules: {
                      required: 'Vui lòng nhập trích yếu nội dung văn bản',
                    },
                  }}
                  inputProps={{
                    style: {
                      width: '100%',
                    },
                    placeholder: 'Trích yếu nội dung văn bản',
                  }}
                />
              </Col>
            </Col>
            <Col span={12}>
              <Col span={24} style={{ marginBottom: '8px' }}>
                <span style={{ color: 'red', marginRight: 5 }}>*</span>Hình thức văn bản:
              </Col>
              <Col span={24}>
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'documentTypeId',
                    rules: { required: true },
                  }}
                  selectProps={{
                    style: {
                      width: '80%',
                    },
                    placeholder: 'Hình thức văn bản',
                    options: listDoc,
                  }}
                />
              </Col>
            </Col>
          </Row>
          <Row gutter={[8, 0]}>
            <Col span={12}>
              <Col span={24} style={{ marginBottom: '8px' }}>
                <span style={{ color: 'red', marginRight: 5 }}>*</span>Nội dung:
              </Col>
              <Col span={24}>
                <MzFormInput
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'description',
                    rules: { required: 'Vui lòng nhập nội dung' },
                  }}
                  inputProps={{
                    style: {
                      width: '100%',
                    },
                    placeholder: 'Nội dung',
                  }}
                />
              </Col>
            </Col>
            <Col span={12}>
              <Col span={24} style={{ marginBottom: '8px' }}>
                <span style={{ color: 'red', marginRight: 5 }}>*</span>Độ khẩn:
              </Col>
              <Col span={24}>
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'priorityId',
                    rules: { required: true },
                  }}
                  selectProps={{
                    style: {
                      width: '100%',
                    },
                    options: [
                      { value: 1, label: 'Bình thường' },
                      { value: 2, label: 'Khẩn' },
                      { value: 3, label: 'Hỏa tốc' },
                      { value: 4, label: 'Thượng khẩn' },
                    ],
                  }}
                />
              </Col>
            </Col>
          </Row>
          <Row gutter={[8, 0]}>
            <Col span={12}>
              <Col span={24} style={{ marginBottom: '8px' }}>
                <span style={{ color: 'red', marginRight: 5 }}>*</span>Ngành:
              </Col>
              <Col span={24}>
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: 'domainId',
                    rules: { required: 'Vui lòng chọn ngành' },
                  }}
                  selectProps={{
                    style: {
                      width: '100%',
                    },
                    options: listDomain,
                    placeholder: 'Ngành',
                  }}
                />
              </Col>
            </Col>
          </Row>
          <Row>
            <h3>Danh sách người ký</h3>
          </Row>
          <div style={{ borderBottom: '1px solid #d9d9d9', marginBottom: 20 }} />
          <Row>
            <Col span={6}>
              <MzFormSelectV2
                controllerProps={{
                  control: vOfficeDetailForm.control,
                  name: '',
                }}
                selectProps={{
                  style: {
                    width: '100%',
                  },
                  placeholder: 'Nhập tên',
                  allowClear: true,
                  filterOption: (input, option) => {
                    const optionValue: string | undefined =
                      option?.label !== undefined ? option?.label?.toString() : '';
                    return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                  },
                  onSelect: (_, record) => {
                    const data: any = record;
                    data.is_display = true;
                    data.isDisplay = 1;
                    data.fullName = record?.display_name;
                    setUserInfor(data);
                  },
                }}
                labelObj={['display_name']}
                valueObj="employee_id"
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
                  const duplicate = vofficeData.fields?.find((i: any) => i.employee_id === userInfor.employee_id);
                  if (!duplicate) {
                    vofficeData.append(userInfor);
                  }
                }}
              >
                Thêm
              </Button>
            </Col>
          </Row>
          <Row style={{ marginTop: 20 }}>
            <TableData
              tableProps={{
                style: {
                  width: '96vw',
                },
                columns: columnsVoffice,
                dataSource: vofficeData.fields,
                rowKey: '_id',
              }}
            />
          </Row>
          <Row style={{ margin: '30px 0' }}>
            <MzFormCheckbox
              controllerProps={{
                control: vOfficeDetailForm.control,
                name: 'isAutoPromulgate',
              }}
              label={'Tự động ban hành'}
            />
          </Row>
          <Row style={{ margin: '20px 0' }}>
            <Col span={11}>
              <Row>
                <h3>Văn bản đính kèm</h3>
              </Row>
              <div style={{ borderBottom: '1px solid #d9d9d9', marginBottom: 20 }} />
              <Row>
                <Col span={24}>
                  <TableData
                    tableProps={{
                      dataSource: dataTablePayment,
                      columns: columnsTablePayment,
                      rowKey: 'id',
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
              <div style={{ borderBottom: '1px solid #d9d9d9', marginBottom: 20 }} />
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
          {/* <Row style={{ margin: '20px 0' }}>
                        <Col span={11}>
                            <Row><h3>Văn bản đính kèm</h3></Row>
                            <Row>
                                <Col span={24}>
                                    <TableData
                                        tableProps={{
                                            dataSource: [],
                                            columns: columnsTablePayment3,
                                            rowKey: 'id'
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Col>
                    </Row> */}
        </div>
      </Modal>
      <Modal
        destroyOnClose={true}
        title={'Thông tin đăng nhập'}
        open={isVoffice}
        onCancel={() => setIsVoffice(false)}
        footer={[
          <Button key={1} onClick={() => setIsVoffice(false)}>
            Đóng
          </Button>,
          <Button key={2} type={'primary'} onClick={() => vOfficeForm.handleSubmit(loginVoffice)()}>
            Đăng nhập
          </Button>,
        ]}
      >
        <Row align={'middle'}>
          <Col span={24} style={{ marginBottom: '8px' }}>
            <Row align={'middle'} gutter={[8, 0]}>
              <Col style={{ color: 'red' }}>*</Col>
              <Col>Tên đăng nhập Voffice</Col>
            </Row>
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control: vOfficeForm.control,
                name: 'username',
                rules: { required: 'Vui lòng nhập tên đăng nhập' },
              }}
              inputProps={{
                style: {
                  width: '100%',
                },
                placeholder: 'Tên đăng nhập Voffice',
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col span={24} style={{ marginBottom: '8px' }}>
            <Row gutter={[8, 0]} align={'middle'}>
              <Col style={{ color: 'red' }}>*</Col>
              <Col>Mật khẩu Voffice</Col>
            </Row>
          </Col>
          <Col span={24}>
            <MzFormPassword
              controllerProps={{
                control: vOfficeForm.control,
                name: 'password',
                rules: { required: 'Vui lòng nhập password' },
              }}
              inputProps={{
                style: {
                  width: '100%',
                  borderRadius: '0px',
                },
                placeholder: ' Mật khẩu Voffice',
                type: 'password',
              }}
            />
          </Col>
        </Row>
      </Modal>

      {/* <MzFormInput
        inputType={"TextArea"}
        controllerProps={{
          control,
          name: "reasonCancel",
        }}
        textAreaProps={{
          placeholder: "Nhập lý do từ chối",
          
        }}
      /> */}
    </>
  );
};

export default TransferListPage;

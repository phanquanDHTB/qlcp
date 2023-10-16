import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { useForm } from 'react-hook-form';
import { useMemo } from 'react';
import { useFieldArray } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Space, Button, Modal, Col, Row, message, Table, Empty, Checkbox, Tooltip, Spin } from 'antd';
import FileSaver from 'file-saver';
import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import { MzFormInput } from '@components/forms/FormInput';
import { requestCatchHook } from '@utils/hook/handleError';
import toSlug from '@utils/toSlug';
import getMessageError from '@utils/getMessageError';
import { MzFormSelect } from '@components/forms/FormSelect';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { MzFormPassword } from '@components/forms/FormPassword';
import { MzFormCheckbox } from '@components/forms/FormCheckbox';
import TableData from '@components/TableData';
import title from '@columnTitles/transfer_request';
import { formatDate } from '@utils/formatDate';
import formatNumber from '@utils/formatNumber';
import { EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import { pdfSignPosition } from '../../../constants/enumConmon';
import Form from './form';
import { deleteRecord, detail, getFile, handleDownloadFiles, handleGetDoctype, handleGetDomain, handleGetSign, handleLoginVoffice, handleResUpdate, handleResUpdateItem, handleSendVoffice } from '../../../apis/proposal-table/proposal-table';
import constant from '../../../constants/Constants';
import BaseImport from './BaseImport';
import BaseExport from './BaseExport';
import Constants from '../../../constants/Constants';
import { transferRequestAccountingStatus as AccountingEnum } from '../../../constants/enumConmon';
import { accountingTransferRequest } from '../../../apis/transfer-request/index';

const TransferRequest = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 200,
      dataIndex: 'code',
      // isCodeIndex: true,
      fixed: 'left',
      render: (value, record) => <a onClick={() => openDetail(record)}>{value}</a>,
    },
    {
      width: 200,
      dataIndex: 'name',
    },
    {
      width: 200,
      dataIndex: 'created_time',
      dataType: 'date',
    },
    {
      width: 200,
      dataIndex: 'request_amount',
      dataType: 'number',
    },
    {
      width: 200,
      dataIndex: 'amount',
      dataType: 'number',
    },
    {
      width: 250,
      dataIndex: 'status',
      dataType: 'list',
      dataSource: [
        {
          value: 1,
          text: 'Chưa trình ký',
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
          text: 'Đã cập nhật trạng thái chuyển khoản',
        },
      ],
    },
    {
      width: 200,
      dataIndex: 'accounting_status',
      dataType: 'list',
      dataSource: Constants.transferRequestAccountingStatus,
    },
    {
      width: 200,
      dataIndex: 'accounting_date',
      dataType: 'date',
    },
    {
      width: 120,
      dataIndex: 'id',
      align: 'center',
      render: (value, record) => (
        <Space>
          {record.status == constant.transferRequestStatus.DA_PHE_DUYET ||
          record.status == constant.transferRequestStatus.DA_CAP_NHAT ? (
            <BaseImport
              entity={'transfer-request-items'}
              onReload={() => {
                reloadTable();
              }}
            />
          ) : null}
          {record.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
          record.status == constant.transferRequestStatus.TU_CHOI ? (
            <Button
              onClick={() => {
                setIdEdit(value);
                setIsOpenModal(true);
              }}
            >
              <EditOutlined />
            </Button>
          ) : null}
          {record.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
          record.status == constant.transferRequestStatus.TU_CHOI ? (
            <Button onClick={() => showConfirmDelete(record)}>
              <DeleteOutlined />
            </Button>
          ) : null}
          {record.accounting_status == AccountingEnum.REJECT ? (
            <Tooltip placement="top" title={'Hạch toán đề nghị'}>
              <Button onClick={() => handleSendAccounting(record)}>
                <SendOutlined />
              </Button>
            </Tooltip>
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
                const res = (await handleDownloadFiles(record)) as any;
                FileSaver.saveAs(new Blob([res]), record.file_name);
              } catch (err) {}
            }}
          >
            {v}
          </a>
        ),
    },
  ];
  const renderStyleTitle = (value) => {
    if (value) {
      return '400';
    } else {
      return '600';
    }
  };
  const summaryRequestColumns = [
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
      dataIndex: 'code',
      width: '10%',
      dataType: 'string',
      key: 'code',
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
      render: (value) => renderItemStatus(Number(value)),
    },
    {
      title: 'Lý do lỗi',
      dataIndex: 'import_error',
      width: '10%',
      key: 'import_error',
    },
    {
      title: 'Ngày hạch toán',
      dataIndex: 'accounting_date',
      width: '10%',
      key: 'accounting_date',
      render: (value) => formatDate(value),
    },
  ];
  const [signBtnLoading, setSignBtnLoading] = useState<boolean>(false);
  const [btnLoading, setBtnLoading] = useState<boolean>(false);
  const [dataExport, setDataExport] = useState([]);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [recordDetail, setRecordDetail] = useState<any>({});
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [idEdit, setIdEdit] = useState<null | number>(null);
  const formRef = useRef<{ submitForm: () => void }>();
  const base = useRef<{ reloadBasePage: () => void }>();
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
  const [total, setTotal] = useState(0);
  const [inforSign, setInforSign] = useState<any>(null);
  const [basePageLoading, setBasePageLoading] = useState<boolean>(false);
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
      render: (v, record) =>
        recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
        recordDetail?.status == constant.transferRequestStatus.TU_CHOI
          ? v
          : record?.full_name,
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
          {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
          recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
            <span style={{ color: 'red', marginRight: 10 }}>*</span>
          ) : null}
          Đơn vị - Chức vụ
        </Row>
      ),
      dataIndex: 'plan_user',
      key: 'name',
      render: (_, record, index) =>
        recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
        recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
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
        ) : (
          record?.position
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
  const columnsVofficeNotAction = [
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
      render: (v, record) =>
        recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
        recordDetail?.status == constant.transferRequestStatus.TU_CHOI
          ? v
          : record?.full_name,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'name',
      width: 250,
    },
    {
      title: () => (
        <Row>
          {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
          recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
            <span style={{ color: 'red', marginRight: 10 }}>*</span>
          ) : null}
          Đơn vị - Chức vụ
        </Row>
      ),
      dataIndex: 'plan_user',
      key: 'name',
      render: (_, record, index) =>
        recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
        recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
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
        ) : (
          record?.position
        ),
    },
    {
      title: 'Hiển thị chữ ký',
      dataIndex: 'id',
      key: 'name',
      width: 200,
      render: (_, record) => <Checkbox disabled={true} checked={record?.is_display}></Checkbox>,
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
  const loginVoffice = async (data) => {
    try {
      const res = (await handleLoginVoffice(data)) as any;
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
      const res = (await handleGetDoctype()) as any;
      const listDoc = res?.map((i: any) => ({ label: i.name, value: i.id }));
      setListDoc(listDoc);
    } catch (err) {
      console.log(err);
    }
  };
  const getDomain = async () => {
    try {
      const res = (await handleGetDomain()) as any;
      const listDomain = res?.map((i: any) => ({ label: i.name, value: i.id }));
      setListDomain(listDomain);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSendAccounting = (record: any) => {
    accountingTransferRequest(record.id)
      .then(() => {return true})
      .catch((error) => {
        requestCatchHook({ e: error });
      });
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
      const transfer_request_item = recordDetail?.transfer_request_item;
      const res = (await handleSendVoffice(data)) as any;
      if (res.error) {
        setSignBtnLoading(false);
        toast(res.message, { type: 'error' });
      } else {
        handleCloseSign();
        toast('Thành công', { type: 'success' });
        const resUpdate = (await handleResUpdate(payload)) as any;
        if (resUpdate.error) {
          setSignBtnLoading(false);
          toast(res.message, { type: 'error' });
        }
        setIsOpenDetail(false);
        setTransferRequestId(null);
        if (transfer_request_item) {
          transfer_request_item.map(async (p) => {
            const payloadItem = {
              id: p.entity_id,
              reason: '',
              status: constant.summaryStatus.CHO_DUYET_BANG,
            };
            const resUpdateItem = (await handleResUpdateItem(p,payloadItem)) as any;
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
  const onCloseModal = () => {
    setIdEdit(null);
    setIsOpenModal(false);
  };
  const reloadTable = () => {
    if (base.current) {
      base.current.reloadBasePage();
    }
  };
  const saveForm = (ref) => {
    ref.submitForm();
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
  const showConfirmDelete = (record) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa bản ghi ${record.code} ?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        deleteRecord(record.id)
          .then(() => {
            message.success(`Xóa thành công bảng đề nghị ${record.code}`);
            reloadTable();
          })
          .catch((error) => {
            console.log(error);
          });
      },
      
    });
  };
  const renderModalDetail = (record) => {
    if (Object.keys(record).length > 0) {
      return (
        <div className={'infor-wrap'}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={12}>
              <Col style={{ fontWeight: '600' }} span={24}>
                Tên lệnh chi :
              </Col>
              <Col span={24}>
                <span>{record.name ? record.name : '--'}</span>
              </Col>
            </Col>
            <Col span={12}>
              <Col style={{ fontWeight: '600' }} span={24}>
                Ngày giao dịch:
              </Col>
              <Col span={24}>
                <span>{record.created_time ? dayjs(record.created_time).format('DD/MM/YYYY') : '--'}</span>
              </Col>
            </Col>
          </Row>

          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Trạng thái:
            </Col>
            <Col span={24}>
              <span>{record.status ? renderStatus(record.status) : '--'}</span>
            </Col>
          </Row>
          <Row
            style={{
              fontWeight: 'bold',
              marginBottom: '16px',
              fontSize: '12px',
            }}
          >
            Nguồn đi tiền
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={12}>
              <Col style={{ fontWeight: '600' }} span={24}>
                Ngân hàng:
              </Col>
              <Col span={24}>
                <span>{record.bank_name ? record.bank_name : '--'}</span>
              </Col>
            </Col>
            <Col span={12}>
              <Col style={{ fontWeight: '600' }} span={24}>
                {' '}
                Số tài khoản:
              </Col>
              <Col span={24}>
                <span>{record.bank_account_number ? record.bank_account_number : '--'}</span>
              </Col>
            </Col>
          </Row>
          <Row>
            <Table
              pagination={false}
              locale={{
                emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} />,
              }}
              scroll={{ y: 'calc(100vh - 500px)' }}
              columns={summaryRequestColumns}
              dataSource={record.transfer_request_item}
              style={{ width: '100%' }}
            />
          </Row>
        </div>
      );
    }
  };
  const disabledRowCheck = (record) => {
    if (
      record.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
      record.status == constant.transferRequestStatus.TU_CHOI
    ) {
      return false;
    } else {
      return true;
    }
  };
  const handlePriority = (v: any) => {
    switch (v) {
      case 1:
        return 'Bình thường';
      case 2:
        return 'Khẩn';
      case 3:
        return 'Hỏa tốc';
      case 4:
        return 'Thượng khẩn';
      default:
        return '';
    }
  };
  const getSign = async () => {
    try {
      const res = (await handleGetSign(transferRequestId)) as any;
      setInforSign(res.content[0]);
      const position4 = res.content[0]?.document_file_list.filter((i: any) => i.position === pdfSignPosition.UNC);
      const position5 = res.content[0]?.document_file_list.filter((i: any) => i.position === pdfSignPosition.DE_NGHI_CHUYEN_TIEN);

      setDataTableQuota([...position5]);
      setDataTablePayment([...position4]);
      vOfficeDetailForm.setValue('usersSignDTOS', res.content[0]?.document_user_list);
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };
  const openDetail = async (record) => {
    setTransferRequestId(record.id);
    setIsOpenDetail(true);
    const res: any = await detail(record.id);
    if (res.transfer_request_item.length > 0) {
      res.transfer_request_item.forEach((p, index) => {
        p.key = index + 1;
      });
    }
    const data: any = [];
    res.transfer_request_item.map((p) => data.push(p.id));
    setDataExport(data);
    setRecordDetail(res);
  };
  return (
    <>
      <Spin spinning={basePageLoading}>
        <BasePage
          ref={base}
          uriFetch="transfer-requests"
          columnTiles={title}
          columns={columns}
          isDeleteButton={true}
          isMultipleDelete={true}
          headerTitle={title.name}
          disabledRowCheck={(data: any) => disabledRowCheck(data)}
        />
      </Spin>
      <Modal
        destroyOnClose={true}
        open={isOpenModal}
        onCancel={() => {
          onCloseModal();
        }}
        title={`${idEdit ? 'Sửa' : 'Thêm'} bảng đề nghị`}
        footer={[
          <Button style={{ border: 'unset', background: '#ffffff' }} onClick={() => onCloseModal()} key={v4()}>
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
          setBtnLoading={(value) => setBtnLoading(value)}
          idEdit={idEdit}
          ref={formRef}
          reloadTable={() => reloadTable()}
          closeForm={() => onCloseModal()}
        />
      </Modal>
      <Modal
        open={isOpenDetail}
        onCancel={() => {
          setIsOpenDetail(false);
          setTransferRequestId(null);
        }}
        title={`Chi tiết bảng đề nghị`}
        footer={[
          <Button
            style={{ background: '#ffffff' }}
            onClick={() => {
              setIsOpenDetail(false);
              setTransferRequestId(null);
            }}
            key={v4()}
          >
            Thoát
          </Button>,
          <BaseExport entity={'transfer-request-items'} selected={dataExport}></BaseExport>,

          recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
          recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
            <Button
              style={{
                background: '#ed1b2f',
                borderColor: '#ed1b2f',
                width: '120px',
                color: '#fff',
              }}
              onClick={() => {
                if (transferRequestId) {
                  setIsVoffice(true);
                }
              }}
              key={v4()}
            >
              Trình ký
            </Button>
          ) : (
            <Button
              style={{
                background: '#ed1b2f',
                borderColor: '#ed1b2f',
                width: '120px',
                color: '#fff',
              }}
              onClick={() => {
                if (transferRequestId) {
                  getSign();
                  setIsVofficeDetail(true);
                }
              }}
              key={v4()}
            >
              Xem trình ký
            </Button>
          ),
        ]}
        bodyStyle={{
          height: 'calc(100vh - 120px)',
          padding: '0px',
          overflowY: 'scroll',
          overflowX: 'hidden',
        }}
        style={{
          top: 0,
          height: '100vh',
          maxWidth: '100vw',
        }}
        width={'100vw'}
      >
        {renderModalDetail(recordDetail)}
      </Modal>
      {/* trình ký */}
      <Modal
        destroyOnClose={true}
        title={<span style={{ paddingLeft: '12px' }}>Thông tin trình ký</span>}
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
          recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
          recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
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
            </Button>
          ) : null,
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
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <span style={{ color: 'red', marginRight: 5 }}>*</span>
                ) : null}
                Trích yếu nội dung văn bản:
              </Col>
              <Col span={24}>
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <MzFormInput
                    controllerProps={{
                      control: vOfficeDetailForm.control,
                      name: 'title',
                      rules: {
                        required: 'Vui lòng nhập trích yếu nội dung văn bản',
                      },
                    }}
                    inputProps={{
                      placeholder: 'Trích yếu nội dung văn bản',
                    }}
                  />
                ) : (
                  inforSign?.title
                )}
              </Col>
            </Col>

            <Col span={12}>
              <Col
                span={24}
                style={{
                  fontWeight: renderStyleTitle(
                    recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                      recordDetail?.status == constant.transferRequestStatus.TU_CHOI
                  ),
                  marginBottom: '8px',
                }}
              >
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <span style={{ color: 'red', marginRight: 5 }}>*</span>
                ) : null}
                Hình thức văn bản:
              </Col>
              <Col span={24}>
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <MzFormSelect
                    controllerProps={{
                      control: vOfficeDetailForm.control,
                      name: 'documentTypeId',
                      rules: { required: true },
                    }}
                    selectProps={{
                      options: listDoc,
                      placeholder: 'Hình thức văn bản',
                    }}
                  />
                ) : (
                  inforSign?.document_type?.name
                )}
              </Col>
            </Col>
          </Row>
          <Row gutter={[8, 0]}>
            <Col span={12}>
              <Col
                span={24}
                style={{
                  fontWeight: renderStyleTitle(
                    recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                      recordDetail?.status == constant.transferRequestStatus.TU_CHOI
                  ),
                  marginBottom: '8px',
                }}
              >
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <span style={{ color: 'red', marginRight: 5 }}>*</span>
                ) : null}
                Nội dung:
              </Col>
              <Col span={24}>
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <MzFormInput
                    controllerProps={{
                      control: vOfficeDetailForm.control,
                      name: 'description',
                      rules: { required: 'Vui lòng nhập nội dung' },
                    }}
                    inputProps={{
                      placeholder: 'Nội dung',
                    }}
                  />
                ) : (
                  inforSign?.description
                )}
              </Col>
            </Col>
            <Col span={12}>
              <Col
                span={24}
                style={{
                  fontWeight: renderStyleTitle(
                    recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                      recordDetail?.status == constant.transferRequestStatus.TU_CHOI
                  ),
                  marginBottom: '8px',
                }}
              >
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <span style={{ color: 'red', marginRight: 5 }}>*</span>
                ) : null}
                Độ khẩn:
              </Col>
              <Col span={24}>
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <MzFormSelect
                    controllerProps={{
                      control: vOfficeDetailForm.control,
                      name: 'priorityId',
                      rules: { required: true },
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
                    }}
                  />
                ) : (
                  handlePriority(inforSign?.priority_id)
                )}
              </Col>
            </Col>
          </Row>
          <Row gutter={[8, 0]}>
            <Col span={12}>
              <Col
                span={24}
                style={{
                  fontWeight: renderStyleTitle(
                    recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                      recordDetail?.status == constant.transferRequestStatus.TU_CHOI
                  ),
                  marginBottom: '8px',
                }}
              >
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
                  <span style={{ color: 'red', marginRight: 5 }}>*</span>
                ) : null}
                Ngành:
              </Col>
              <Col span={24}>
                {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
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
                ) : (
                  inforSign?.domain?.name
                )}
              </Col>
            </Col>
          </Row>
          {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
          recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? null : (
            <div style={{ marginBottom: 20 }} />
          )}
          <Row>
            <h3>Danh sách người ký</h3>
          </Row>
          <div style={{ borderBottom: '1px solid #d9d9d9', marginBottom: 20 }} />
          {/* <p>Danh sách người ký duyệt :</p> */}
          {recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
          recordDetail?.status == constant.transferRequestStatus.TU_CHOI ? (
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
          ) : null}

          <Row style={{ marginTop: 20 }}>
            <TableData
              tableProps={{
                style: {
                  width: '96vw',
                },
                columns:
                  recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                  recordDetail?.status == constant.transferRequestStatus.TU_CHOI
                    ? columnsVoffice
                    : columnsVofficeNotAction,
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
              checkboxProps={{
                disabled: !(
                  recordDetail?.status == constant.transferRequestStatus.CHUA_TRINH_KY ||
                  recordDetail?.status == constant.transferRequestStatus.TU_CHOI
                ),
              }}
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
    </>
  );
};

export default TransferRequest;

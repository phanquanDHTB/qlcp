import { Button, Col, Collapse, Modal, Radio, Row, Space, Table, Upload, message, Form, Spin } from 'antd';
import {
  DeleteOutlined,
  PlusOutlined,
  UploadOutlined,
  EyeOutlined,
  EditOutlined,
  PlusCircleOutlined,
} from '@ant-design/icons';
import { AlignType } from 'rc-table/lib/interface';
import { Controller, FieldValues, useForm, useFieldArray } from 'react-hook-form';
import getMessageError from '@utils/getMessageError';
import { MzFormInput } from '@components/forms/FormInput';
import { forwardRef, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import TableData from '@components/TableData';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import { MzFormInputNumber } from '@components/forms/FormNumber';
import dayjs from 'dayjs';
import toSlug from '@utils/toSlug';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { MzFormSelect } from '@components/forms/FormSelect';
import type { ColumnsType } from 'antd/es/table';
import './styles.scss';
const { Panel } = Collapse;
import { v4 } from 'uuid';
import formatNumber from '@utils/formatNumber';
import { formatDateTime } from '@utils/formatDate';
import XMLParser from 'react-xml-parser';
import FormAdd from './addInvoices';
import {
  getInvoices,
  getCode,
  getInvoicesDetall,
  uploadFile,
  uploadFileXML,
  dowloadFile,
  handleAddOrEditRequest,
  deleteRecord,
  getInforUserRequest,
  getPlan,
} from '../../../apis/page/business/plan/invoices';

interface InvoiceProps {
  idEdit?: number | null;
  idDetails: any;
  departmentProcess?: any;
}

interface contentData {
  content: Invoices[] | undefined;
}
interface deleteInvoices {
  id?: number;
  code?: string;
}
interface Invoices {
  idEdit?: number | null;
  departmentProcess?: string;
  address?: string;
  code?: string;
  provider?: string;
  symbol?: string;
  tax_code?: string;
  type?: string;
  invoice_date?: string;
  id?: number;
  payment_type?: number;
  total_amount?: number;
  total_fee?: number;
  total_final_amount?: number;
  total_vat_amount?: number;
  invoice_files?: any;
  invoice_items?: any;
  upd_date?: string;
  plan?: { id: number };
  totalAmount?: number;
  totalVatAmount?: number;
  totalFee?: number;
  Total_FinalAmout?: number;
  ins_id?: number;
}

const InvoiceInfor = forwardRef((props: InvoiceProps) => {
  const [ivisibleAdd, setIvisibleAdd] = useState<boolean>(false);
  const [isVisibleEdit, setIsViSibleEdit] = useState<boolean>(false);
  const [isVisibleDetall, setIsVisibleDetall] = useState<boolean>(false);
  const [isVisibleDelete, setIsVisibleDelete] = useState<boolean>(false);

  const [isLoadingScreen, setLoadingScreen] = useState<boolean>(false);
  const [isLoadingDelete, setLoadingDelete] = useState<boolean>(false);
  const [isLoadingUpdate, setLoadingUpdate] = useState<boolean>(false);

  const [recordInvoices, setRecordInvoices] = useState<Invoices>();
  const [dataSource, setDataSource] = useState<Invoices[] | undefined>([]);
  const [invoice_itemsDetall, setInvoice_itemsDetall] = useState<Invoices[] | undefined>([]);

  const [idEdit, setIdEdit] = useState<number>();
  const [idDeletem, setIdDelete] = useState<deleteInvoices>();

  const [fileList, setFileList] = useState<[]>([]);
  const [fileListInfo, setFileListInfo] = useState<any[]>([]);
  const [dataFileLink, setDataFileLink] = useState([]);
  const [dataDetallInvoices, setDataDetallInvoices] = useState<Invoices>();

  const [codeUser, setCodeUser] = useState<Invoices>();
  const [user, setUser] = useState<any>({});
  const [dataPlan, setDataPlan] = useState<any>({});

  const { idDetails, departmentProcess } = props;
  const { control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: { listStock: [] } as any,
  });

  const formatDate = dayjs(recordInvoices?.invoice_date).format('DD/MM/YYYY');

  const stockFields = useFieldArray({
    control,
    name: 'listStock',
  });

  const defaulTable = useFieldArray({
    control,
    name: 'defaulTable',
    keyName: '_id',
  });
  const vatType = [
    { value: 1, label: 'Không thu phí' },
    { value: 2, label: '0%' },
    { value: 3, label: '5%' },
    { value: 4, label: '8%' },
    { value: 5, label: '10%' },
  ];
  const statusLabel = (data) => {
    switch (data) {
      case undefined:
        return 0;
      case 1:
        return 0;
      case 2:
        return 0;
      case 3:
        return 5;
      case 4:
        return 8;
      case 5:
        return 10;
      default:
        break;
    }
  };

  const watchAll = watch('listStock');

  const totalAmount = watchAll?.reduce((accumulator, current) => accumulator + (current.amount || 0), 0);
  const totalVatAmount = watchAll?.reduce((accumulator, current) => accumulator + (current.vat_amount || 0), 0);
  const totalFee = watchAll?.reduce((accumulator, current) => accumulator + (current.fee || 0), 0);
  const Total_FinalAmout = totalAmount + totalVatAmount + totalFee;
  const formInvoiceAdd = useRef<{ resetFormAdd: () => void }>();

  const showFormAdd = async () => {
    await formInvoiceAdd.current?.resetFormAdd();
    setIvisibleAdd(true);
  };

  const cancelFormAdd = async () => {
    reset({});
    await formInvoiceAdd.current?.resetFormAdd();
    setIvisibleAdd(false);
  };

  const ShowModalPut = async (record) => {
    try {
      setIdEdit(record.id);
      const res = (await getInvoicesDetall(record.id)) as Invoices;

      const valueDataEdit = res;
      console.log(valueDataEdit, 'valueDataEdit');
      console.log(record, 'record');

      setValue('type', valueDataEdit.type);
      setValue('address', valueDataEdit.address);
      setValue('code', valueDataEdit.code);
      setValue('invoice_date', dayjs(valueDataEdit.invoice_date));
      setValue('payment_type', record.payment_type);
      setValue('provider', valueDataEdit.provider);
      setValue('symbol', valueDataEdit.symbol);
      setValue('tax_code', valueDataEdit.tax_code);

      const dataItemInvoices = valueDataEdit.invoice_items?.map((i) => ({
        amount: i.amount,
        fee: i.fee,
        name: i.name,
        vat: i.vat,
        vat_amount: i.vat_amount,
        cost: i.cost,
        code: i.code,
        entityId: i.entityId,
        ins_date: i.ins_date,
        ins_id: i.ins_id,
        invoice_id: i.invoice_id,
        is_active: i.is_active,
        upd_date: i.upd_date,
        upd_id: i.upd_id,
        label: i.cost?.name,
        value: i.cost?.id,
        id: i.cost?.id,
        credit_acc: i.cost?.credit_acc,
      }));
      setValue('defaulTable', dataItemInvoices);

      setValue('listStock', dataItemInvoices);

      const dataFileEdit = record.invoice_files.map((i) => ({
        uid: i.file_id,
        name: i.file_name,
      }));
      setFileList(dataFileEdit);
      const dataFileInvoices = valueDataEdit.invoice_files?.map((i) => ({
        code: i.code,
        description: i.description,
        file_id: i.file_id,
        file_name: i.file_name,
        ins_date: i.ins_date,
        ins_id: i.ins_id,
        invoice_id: i.invoice_id,
        is_active: i.is_active,
        upd_date: i.upd_date,
        upd_id: i.upd_id,
      }));
      for (let i = 0; i < dataFileInvoices.length; i++) {
        const dataFIle = dataFileInvoices[i];
        setDataFileLink(dataFIle);
      }
      setValue('invoice_files', valueDataEdit.invoice_files);
    } catch (error) {
      // console.log(error)
    }
    setIsViSibleEdit(true);
  };

  const handleCancelDetall = () => {
    setIsVisibleDetall(false);
  };
  const handleCancelEdit = () => {
    reset({});
    setValue('listStock', []);
    setFileList([]);
    setIsViSibleEdit(false);
  };
  const ShowModalDetall = async (record) => {
    try {
      const res = (await getInvoicesDetall(record.id)) as Invoices;
      const dataDetal = res;

      setDataDetallInvoices(dataDetal);
      const dataStockDetall = dataDetal.invoice_items?.map((i) => ({
        amount: i.amount,
        fee: i.fee,
        name: i.name,
        vat: i.vat,
        vat_amount: i.vat_amount,
        cost: i.cost.name,
      }));
      setInvoice_itemsDetall(dataStockDetall);
    } catch (error) {
      // console.log(error);
    }

    setRecordInvoices(record);
    setIsVisibleDetall(true);
  };
  const ShowModalDeleteIvoices = (record) => {
    setIdDelete(record);
    setIsVisibleDelete(true);
  };
  const hideModalDeleteIvoices = () => {
    setIsVisibleDelete(false);
  };
  const allowedFileExtensions = ['pdf', 'vpdf', 'xls', 'xlsx', 'doc', 'docx', 'xml'];
  const handleChangeInvoiceFile = (info) => {
    const status = info.file.status;
    if (status !== 'uploading') {
      // console.log("--");
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded thành công.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload thất bại.`);
    }
    const validFiles = info.fileList.filter((item) => {
      const fileExtension = item.name.split('.').pop().toLowerCase();
      return allowedFileExtensions.includes(fileExtension);
    });
    const fileSelected = info.fileList.filter((item) => item.size / 1024 / 1024 < 10) && validFiles;
    setFileList(fileSelected);
    setDataFileLink(fileSelected.map((item) => item.response));
  };

  async function toJson(xml: string) {
    if (xml) {
      const jsonParser = new XMLParser().parseFromString(xml);
      const FileXml = jsonParser;
      if (typeof FileXml == 'undefined' || FileXml == null) {
        message.error('file không đúng định dạng');
        setFileListInfo([]);
        return;
      }

      const NDHDon = jsonParser.getElementsByTagName('NDHDon');
      const TTChung = jsonParser.getElementsByTagName('TTChung');
      setValue('type', TTChung ? jsonParser.getElementsByTagName('KHMSHDon')[0].value : null);
      setValue('symbol', TTChung ? jsonParser.getElementsByTagName('KHHDon')[0].value : null);
      setValue('code', TTChung ? jsonParser.getElementsByTagName('SHDon')[0].value : null);
      setValue('invoice_date', TTChung ? dayjs(jsonParser.getElementsByTagName('NLap')[0].value) : null);
      setValue('tax_code', NDHDon ? jsonParser.getElementsByTagName('MST')[0].value : null);
      setValue('provider', NDHDon ? jsonParser.getElementsByTagName('Ten')[0].value : null);
      setValue('address', NDHDon ? jsonParser.getElementsByTagName('DChi')[0].value : null);

      const results = jsonParser.getElementsByTagName('HHDVu').map((item1, index) => {
        let vatLabel = '';
        const mergedObject = item1.children
          .map((item2) => {
            const { name, value } = item2;
            let newValue = value;
            let newKey;
            if (name === 'TSuat') {
              vatLabel = value;
              const matchedVatType = vatType.find((item) => item.label === vatLabel);
              newValue = matchedVatType ? matchedVatType.value : value;
              newKey = 'vat';
            } else {
              switch (name) {
                case 'THHDVu':
                  newKey = 'name';
                  break;
                case 'ThTien':
                  newKey = 'amount';
                  newValue = +value;
                  break;
                default:
                  newKey = name;
              }
            }
            return { [newKey]: newValue };
          })
          .reduce((acc, curr) => Object.assign(acc, curr), {
            index: index + 1,
          });

        const { amount } = mergedObject;
        mergedObject.vat_amount =
          vatLabel === 'Không thu phí' || vatLabel === '0%'
            ? 0
            : Math.round((amount * +vatLabel.replace('%', '')) / 100);

        return mergedObject;
      });

      setValue('listStock', results);
    }
  }

  const handleChangeFileAndSaveForm = async (info) => {
    if (info.file.type == 'text/xml' && info.fileList.length > 0) {
      const reader = new FileReader();
      let xml;
      reader.addEventListener('load', function () {
        xml = reader.result;
        toJson(xml);
      });
      await reader.readAsText(info.file.originFileObj);

      setFileListInfo([info.file]);
    } else {
      setFileListInfo([]);
    }
  };

  const customRequest = (options) => {
    const { onSuccess, onError, file } = options;
    const fmData = new FormData();

    fmData.append('file', file);
    uploadFile(fmData)
      .then(async (response) => {
        await onSuccess(response);
      })
      .catch((err) => {
        onError(err);
      });
  };
  const customRequestFileImport = (options) => {
    const { onSuccess, onError, file } = options;
    const fmData = new FormData();
    fmData.append('file', file);
    uploadFileXML(fmData)
      .then(async (response: any) => {
        onSuccess(response);
      })
      .catch((err) => {
        onError(err);
      });
  };

  const beforeUploadFileImport = (file) => {
    const isXml = file.type === 'text/xml';
    if (!isXml) {
      message.error('Loại tệp không hợp lệ. Chỉ chấp nhận tệp XML.');
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước tệp quá lớn. Kích thước tối đa là 5MB.');
    }
    return isXml && isLt5M;
  };

  const beforeUpload = (file) => {
    const isLt5M = file.size / 1024 / 1024 < 10;
    if (!isLt5M) {
      message.error('Kích thước tệp quá lớn. Kích thước tối đa là 10MB.');
    }

    const fileExtension = file.name.split('.').pop().toLowerCase();
    const isAllowedExtension = allowedFileExtensions.includes(fileExtension);

    if (!isAllowedExtension) {
      message.error('Chỉ cho phép tải lên các tệp có định dạng PDF, XLS, XLSX, DOC, DOCX, XML.');
    }

    return isLt5M && isAllowedExtension;
  };

  const downloadFile = (blob, fileName) => {
    const fileURL = window.URL.createObjectURL(new Blob([blob]));
    const fileLink = document.createElement('a');
    fileLink.href = fileURL;
    fileLink.download = fileName;
    fileLink.click();
  };

  const dowloadFileImg = async (file) => {
    const res = await dowloadFile(file.file_id);
    const fileName = file.file_name;
    downloadFile(res, fileName);
  };

  const callBackgetInvoices = async () => {
    setLoadingScreen(true);
    try {
      const res = (await getInvoices(idDetails)) as contentData;
      const data = res.content;
      const dataformat = data
        ? data.map((item) => ({
            ...item,
            address: item.address,
            code: item.code,
            id: item.id,
            invoice_date: item.invoice_date,
            payment_type: item.payment_type,
            provider: item.provider,
            symbol: item.symbol,
            tax_code: item.tax_code,
            total_amount: item.total_amount,
            total_fee: item.total_fee,
            total_final_amount: item.total_final_amount,
            total_vat_amount: item.total_vat_amount,
            type: item.type,
            invoice_files: item.invoice_files,
            invoice_items: item.invoice_items,
            invoice_item: item.invoice_items[0],
            ins_id: item.ins_id,
          }))
        : [];
      setDataSource(dataformat);
      const rescode = (await getCode(idDetails)) as any;
      const dataUser = rescode.content;
      const dataformatUser = dataUser?.map((i) => ({
        code: i.plan_required_user.code,
      }));
      setCodeUser(dataformatUser);
      setLoadingScreen(false);
    } catch (error) {
      console.log(error);
      setLoadingScreen(false);
    }
  };

  const dataTable = (res) => {
    setDataSource(res);
  };

  const getUserInfo = async () => {
    const res = (await getInforUserRequest()) as any;
    if (res.status == 'success') {
      setUser(res.data);
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);

  const getPlanId = async () => {
    const res = (await getPlan(idDetails)) as any;
    setDataPlan(res);
  };

  useEffect(() => {
    if (idDetails) {
      callBackgetInvoices();
      getPlanId();
    }
  }, [idDetails]);
  const submitInvoices = () => {
    handleSubmit(addOrEditInvoices)();
  };
  const addOrEditInvoices = async (value: FieldValues) => {
    setLoadingUpdate(true);
    try {
      const data: Invoices = {
        type: value.type,
        symbol: value.symbol,
        code: value.code,
        invoice_date: dayjs(value.invoice_date).toISOString(),
        tax_code: value.tax_code,
        provider: value.provider,
        address: value.address,
        payment_type: value.payment_type,
        plan: { id: idDetails },
      };
      data.total_amount = !totalAmount ? 0 : totalAmount;
      data.total_fee = !totalFee ? 0 : totalFee;
      data.total_vat_amount = !totalVatAmount ? 0 : totalVatAmount;
      data.total_final_amount = !Total_FinalAmout ? 0 : Total_FinalAmout;
      data.invoice_files = [dataFileLink];
      data.invoice_items = value.listStock;
      if (data.invoice_files.length === 0) {
        toast('Vui lòng chọn link chứng từ gốc', { type: 'error' });
        return;
      }
      const dataRequest = {
        ...data,
        id: idEdit,
      };

      await handleAddOrEditRequest(idEdit, dataRequest);

      const respone = (await getInvoices(idDetails)) as contentData;
      setDataSource(respone.content);
      setIsViSibleEdit(false);
      message.success('Sửa hóa đơn thành công!');
      setLoadingUpdate(false);
    } catch (error) {
      setLoadingUpdate(false);
      toast(getMessageError(error), { type: 'error' });
    }
  };

  const handleDeleteInvoices = async () => {
    setLoadingDelete(true);
    try {
      await deleteRecord(idDeletem?.id);
      const respone = (await getInvoices(idDetails)) as contentData;
      setDataSource(respone.content);
      setIsVisibleDelete(false);
      message.success('Xóa hóa đơn thành công!');
      setLoadingDelete(false);
    } catch (error) {
      setLoadingDelete(false);
      message.error('Xóa hóa đơn thất bại!');
    }
  };

  const columns: ColumnsType = [
    {
      title: 'Mẫu hóa đơn',
      dataIndex: 'type',
      width: 150,
      fixed: 'left',
    },
    {
      title: 'Kí hiệu',
      dataIndex: 'symbol',
      width: 130,
      key: 'symbol',
      fixed: 'left',
    },
    {
      title: 'Số hóa đơn',
      dataIndex: 'code',
      width: 150,
      key: 'code',
      align: 'right' as AlignType,
      fixed: 'left',
    },
    {
      title: 'Đơn vị',
      width: 250,
      key: 'm4',
      render: () => {
        return <p>{departmentProcess ? departmentProcess.name : '--'}</p>;
      },
    },
    {
      title: 'Ngày HĐ',
      dataIndex: 'invoice_date',
      width: 170,
      key: 'invoice_date',
      render: (v) => {
        return <p>{dayjs(v).format('DD/MM/YYYY')}</p>;
      },
    },
    {
      title: 'Mã số thuế',
      dataIndex: 'tax_code',
      width: 170,
      align: 'right' as AlignType,
      key: 'tax_code',
    },
    {
      title: 'Nhà cung cấp',
      dataIndex: 'provider',
      width: 180,
      key: 'provider',
    },
    {
      title: 'Loại thanh toán',
      dataIndex: 'payment_type',
      render: (value) => {
        return <span>{value === 1 ? 'Hoàn ứng' : 'Phải trả nhà cung cấp'}</span>;
      },
      width: 170,
    },
    {
      title: 'Tên HH,DV',
      dataIndex: 'invoice_items',
      width: 250,
      render: (value) => {
        return <span>{value[0]?.name}</span>;
      },
    },
    {
      title: 'Tiền HH,DV',
      dataIndex: 'total_amount',
      width: 170,
      align: 'right' as AlignType,
      render: (v) => {
        return <span>{!v ? '0' : formatNumber(v)}</span>;
      },
    },
    {
      title: 'Thuế GTGT',
      dataIndex: 'total_vat_amount',
      width: 170,
      align: 'right' as AlignType,
      render: (v) => {
        return <span>{!v ? '0' : formatNumber(v)}</span>;
      },
    },
    {
      title: 'Phụ phí',
      dataIndex: 'total_fee',
      width: 170,
      align: 'right' as AlignType,
      render: (v) => {
        return <span>{!v ? '0' : formatNumber(v)}</span>;
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'total_final_amount',
      width: 170,
      align: 'right' as AlignType,
      render: (v) => {
        return <span>{!v ? '0' : formatNumber(v)}</span>;
      },
    },
    {
      title: 'Ngày cập nhật',
      dataIndex: 'upd_date',
      width: 170,
      render: (v) => {
        return <span>{!v ? '--' : formatDateTime(v)}</span>;
      },
    },
    {
      title: 'Mã NV',
      width: 170,
      render: () => {
        return <span>{codeUser ? codeUser[0]?.code : '--'}</span>;
      },
    },
    {
      title: 'Link chứng từ gốc',
      dataIndex: 'invoice_files',
      render: (v) => {
        return (
          <a
            onClick={() => {
              dowloadFileImg(v[0]);
            }}
          >
            {v?.map((i) => {
              return i.file_name;
            })}
          </a>
        );
      },
      width: 300,
      ellipsis: true,
    },
    {
      title: 'Thao tác',
      key: 'action',
      fixed: 'right',
      width: 170,
      render: (_, record) => {
        return (
          <div className="btn_actionInvoices">
            <Space>
              <Button onClick={() => ShowModalDetall(record)}>
                <EyeOutlined />
              </Button>
              <Button
                onClick={() => {
                  ShowModalPut(record);
                }}
                disabled={user?.id === dataPlan?.ins_id || user?.id === dataPlan?.user_process?.id ? false : true}
              >
                <EditOutlined />
              </Button>
              <Button
                onClick={() => {
                  ShowModalDeleteIvoices(record);
                }}
                disabled={user?.id === dataPlan?.ins_id || user?.id === dataPlan?.user_process?.id ? false : true}
              >
                <DeleteOutlined />
              </Button>
            </Space>
          </div>
        );
      },
    },
  ];
  const columnsEmployee: ColumnsType = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'name',
      width: 70,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Hàng hóa, dịch vụ',
      key: 'name',
      width: 250,
      render: (_, __, index) => {
        return (
          <div style={{ width: '250px', marginTop: 23 }}>
            <MzFormInput
              controllerProps={{
                control,
                name: `listStock.${index}.name`,
                rules: {
                  required: 'Vui lòng nhập thông tin hàng hóa dịch vụ',
                  validate: (value) => {
                    if (value) {
                      if (value.length < 50) {
                        return true;
                      } else {
                        return 'Tên hàng hóa/dịch vụ quá dài';
                      }
                    } else {
                      return true;
                    }
                  },
                },
              }}
              inputProps={{
                placeholder: 'Hàng hóa, dịch vụ',
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Loại chi phí',
      key: 'cost',
      width: 350,
      render: (_, __, index) => {
        return (
          <div>
            <MzFormSelectV2
              isFormItem={true}
              labelObj={['name']}
              valueObj={'id'}
              controllerProps={{
                control,
                name: `listStock.${index}.cost.id`,
                rules: {
                  required: 'Vui lòng chọn loại chi phí',
                },
              }}
              selectProps={{
                placeholder: 'Loại chi phí',
                style: { width: 350, marginTop: 17 },
                // allowClear: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
              }}
              defaultOption={watch(`defaulTable.${index}`)}
              uri={
                index > 0
                  ? 'costs?isActive.in=1&' + 'creditAcc.contains=' + watch(`listStock.${0}.cost.creditz_acc`)
                  : 'costs?isActive.in=1'
              }
              uriSearch={'keyWord='}
              onChangeValue={(e) => {
                if (e === undefined) {
                  stockFields.update(index, {});
                }
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Tiền HH, DV',
      render: (_, __, index) => {
        return (
          <div style={{ width: 150, marginTop: 23 }}>
            <MzFormInputNumber
              controllerProps={{
                control,
                name: `listStock.${index}.amount`,
                rules: { required: 'Vui lòng nhập' },
              }}
              inputNumberProps={{
                placeholder: 'Tiền HH, DV',
                style: { width: 150, borderRadius: '0px' },
                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value?.replace(/\$\s?|(\.*)/g, ''),
                onChange: (v: any) => {
                  setValue(`listStock.${index}.amount`, v);
                  if (!statusLabel(watch(`listStock.${index}.vat`))) {
                    setValue(`listStock.${index}.vat_amount`, 0);
                  }
                  const vatValue = watch(`listStock.${index}.vat`);
                  setValue(
                    `listStock.${index}.vat_amount`,
                    vatValue === 3
                      ? Math.round((v * 5) / 100)
                      : vatValue === 4
                      ? Math.round((v * 8) / 100)
                      : vatValue === 5
                      ? Math.round((v * 10) / 100)
                      : 0
                  );
                },
              }}
            />
          </div>
        );
      },
      width: 150,
    },
    {
      title: 'Thuế suất',
      width: 130,
      render: (_, __, index) => {
        return (
          <div style={{ width: 130, marginTop: 23 }}>
            <MzFormSelect
              controllerProps={{
                control,
                name: `listStock.${index}.vat`,
                rules: { required: 'Vui lòng chọn' },
              }}
              selectProps={{
                placeholder: 'Thuế suất',
                allowClear: true,
                style: { width: 130 },
                options: vatType,
                onSelect: (e, record: any) => {
                  if (e === 1) {
                    setValue(`listStock.${index}.vat_amount`, 0);
                  } else {
                    setValue(
                      `listStock.${index}.vat_amount`,
                      Math.round((+watch(`listStock.${index}.amount`) * +record.label?.replace('%', '')) / 100)
                    );
                  }
                },
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Thuế GTGT',
      width: 150,
      render: (_, __, index) => {
        return (
          <div style={{ width: 150 }}>
            <MzFormInputNumber
              controllerProps={{
                control,
                name: `listStock.${index}.vat_amount`,
                rules: { required: 'Vui lòng nhập' },
              }}
              inputNumberProps={{
                placeholder: 'Thuế GTGT',
                style: { width: 150, marginTop: 17, borderRadius: '0px' },
                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value?.replace(/\$\s?|(\.*)/g, ''),
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Phụ phí',
      width: 150,
      render: (_, __, index) => {
        return (
          <div style={{ width: 150, marginTop: 23 }}>
            <MzFormInputNumber
              controllerProps={{
                control,
                name: `listStock.${index}.fee`,
              }}
              inputNumberProps={{
                placeholder: 'Phụ phí',
                style: { width: 150, borderRadius: '0px' },
                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value: any) => value?.replace(/\$\s?|(\.*)/g, ''),
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (v, _, index) => (
        <div style={{ textAlign: 'center' }}>
          <Button
            onClick={async () => {
              if (v) {
                try {
                  stockFields.remove(index);
                } catch (err) {
                  // console.log(err);
                }
              } else {
                stockFields.remove(index);
              }
            }}
            icon={<DeleteOutlined />}
          ></Button>
        </div>
      ),
    },
  ];

  const columnsDeltallStock = [
    {
      title: 'STT',
      dataIndex: 'index',
      key: 'name',
      width: 50,
      render: (_, __, index) => <b>{index + 1}</b>,
    },
    {
      title: 'Hàng hóa, dịch vụ',
      key: 'name',
      dataIndex: 'name',
      width: 200,
      render: (v) => <span>{!v ? '--' : v}</span>,
    },
    {
      title: 'Loại chi phí',
      dataIndex: 'cost',
      key: 'cost',
      width: 200,
      render: (v) => <span>{v}</span>,
    },
    {
      title: 'Tiền HH, DV',
      dataIndex: 'amount',
      width: 200,
      align: 'right' as AlignType,
      render: (v) => <span>{formatNumber(v)}</span>,
    },
    {
      title: 'Thuế suất',
      dataIndex: 'vat',
      width: 200,
      align: 'right' as AlignType,
      render: (v) => (
        <span>
          {' '}
          {v === 1 ? 'Không thu phí' : v === 2 ? '0%' : v === 3 ? '5%' : v === 4 ? '8%' : v === 5 ? '10%' : '--'}
        </span>
      ),
    },
    {
      title: 'Thuế GTGT',
      dataIndex: 'vat_amount',
      width: 200,
      align: 'right' as AlignType,
      render: (v) => <span>{formatNumber(v)}</span>,
    },
    {
      title: 'Phụ phí',
      dataIndex: 'fee',
      width: 200,
      align: 'right' as AlignType,
      render: (v) => <span>{formatNumber(v)}</span>,
    },
  ];

  const Form_invoicesStockDetall = (
    <div>
      <TableData
        tableProps={{
          rowKey: 'id',
          columns: columnsDeltallStock,
          dataSource: invoice_itemsDetall,
          summary: () => (
            <Table.Summary>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0}>
                  <strong>Tổng</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}></Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
                <Table.Summary.Cell index={3} align="right">
                  <strong>{formatNumber(dataDetallInvoices?.total_amount)}</strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={4}></Table.Summary.Cell>
                <Table.Summary.Cell index={5} align="right">
                  <strong>
                    {dataDetallInvoices?.total_vat_amount
                      ? formatNumber(Math.round(dataDetallInvoices?.total_vat_amount))
                      : 0}
                  </strong>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={6} align="right">
                  <strong>{formatNumber(dataDetallInvoices?.total_fee)}</strong>
                </Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          ),
        }}
      />
    </div>
  );
  const Form_detallInvoices = (
    <div>
      <Modal
        title="Chi tiết Hóa Đơn"
        open={isVisibleDetall}
        onCancel={handleCancelDetall}
        footer={[
          <Button key="back" onClick={handleCancelDetall}>
            Trở lại
          </Button>,
        ]}
        style={{
          top: 0,
          height: '100vh',
        }}
        width={'100vw'}
      >
        <div className={'infor-wrap'}>
          <Row>
            <Col span={4}>Mẫu hóa đơn:</Col>
            <Col span={20}>
              <span>{dataDetallInvoices?.type}</span>
            </Col>
          </Row>
          <Col
            span={24}
            style={{
              marginTop: '2%',
            }}
          ></Col>
          <Row>
            <Col span={4}>Kí hiệu:</Col>
            <Col span={20}>
              <span>{dataDetallInvoices?.symbol}</span>
            </Col>
          </Row>
          <Col
            span={24}
            style={{
              marginTop: '2%',
            }}
          ></Col>
          <Row>
            <Col span={4}>Số hóa đơn:</Col>
            <Col span={20}>
              <span>{dataDetallInvoices?.code}</span>
            </Col>
          </Row>
          <Col
            span={24}
            style={{
              marginTop: '2%',
            }}
          ></Col>
          <Row>
            <Col span={4}>Ngày hóa đơn:</Col>
            <Col span={20}>
              <span>{formatDate}</span>
            </Col>
          </Row>
          <Col
            span={24}
            style={{
              marginTop: '2%',
            }}
          ></Col>
          <Row>
            <Col span={4}>Mã số thuế:</Col>
            <Col span={20}>
              <span>{dataDetallInvoices?.tax_code}</span>
            </Col>
          </Row>
          <Col
            span={24}
            style={{
              marginTop: '2%',
            }}
          ></Col>
          <Row>
            <Col span={4}>Tên nhà cung cấp:</Col>
            <Col span={20}>
              <span>{dataDetallInvoices?.provider}</span>
            </Col>
          </Row>
          <Col
            span={24}
            style={{
              marginTop: '2%',
            }}
          ></Col>
          <Row>
            <Col span={4}>Địa chỉ:</Col>
            <Col span={20}>
              <span>{dataDetallInvoices?.address}</span>
            </Col>
          </Row>
          <Col
            span={24}
            style={{
              marginTop: '2%',
            }}
          ></Col>
          <Row>
            <Col span={12}>
              <Row>
                <Col span={8}>Loại thanh toán:</Col>
                <Col span={16}>
                  <span>{dataDetallInvoices?.payment_type === 1 ? 'Hoàn ứng' : 'Phải trả nhà cung cấp'}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Col
            span={24}
            style={{
              marginTop: '2%',
            }}
          ></Col>
          <Row>
            <Col span={12}>
              <Row>
                <Col span={8}>Link chứng từ gốc:</Col>
                <Col span={16} style={{ display: 'flex', flexDirection: 'column' }}>
                  {dataDetallInvoices?.invoice_files
                    ? dataDetallInvoices?.invoice_files.map((item) => (
                        <a
                          onClick={() => {
                            dowloadFileImg(item);
                          }}
                        >
                          {item.file_name}
                        </a>
                      ))
                    : ''}
                </Col>
              </Row>
            </Col>
          </Row>

          <div style={{ marginTop: 30 }}>
            <Collapse defaultActiveKey={['1']}>
              <Panel header={<h3>Danh sách hàng hóa</h3>} key={1}>
                {Form_invoicesStockDetall}
              </Panel>
            </Collapse>

            <Col
              span={24}
              style={{
                borderBottom: '1px solid rgb(227, 227, 227)',
                marginTop: '2%',
              }}
            ></Col>

            <Row style={{ marginTop: 30 }}>
              <Col span={12}>
                <Row>
                  <Col span={8}>Tổng giá trị của hóa đơn:</Col>
                  <Col span={16}>
                    <Controller
                      name={'total_final_amount'}
                      control={control}
                      render={({ field }) => (
                        <strong {...field}>
                          {dataDetallInvoices?.total_final_amount
                            ? formatNumber(Math.round(dataDetallInvoices?.total_final_amount))
                            : 0}{' '}
                          VND
                        </strong>
                      )}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
    </div>
  );

  const Form_modalDeleteInvoices = (
    <Modal open={isVisibleDelete} onCancel={hideModalDeleteIvoices} footer={null}>
      <h2>Bạn chắc chắn muốn xoá bản ghi {idDeletem?.code}?</h2>
      <div className="form-btnDeleteInvoices">
        <Button onClick={hideModalDeleteIvoices}>Hủy</Button>
        <div style={{ width: 20 }}></div>
        <Button loading={isLoadingDelete} type="primary" onClick={() => handleDeleteInvoices()}>
          Xác nhận
        </Button>
      </div>
    </Modal>
  );
  const Form_EditInvoices = (
    <Modal
      title="Sửa hóa đơn"
      open={isVisibleEdit}
      okText="Lưu"
      cancelText="Đóng"
      onCancel={handleCancelEdit}
      style={{
        top: 0,
        height: '100vh',
      }}
      footer={[
        <Button key="back" onClick={handleCancelEdit}>
          Đóng
        </Button>,
        <Button type="primary" loading={isLoadingUpdate} onClick={submitInvoices}>
          Lưu
        </Button>,
      ]}
      width={'100vw'}
    >
      <div className={'infor-wrap'}>
        <Form>
          <div className="btn-uploadXML">
            <Controller
              name={'invoice_files'}
              control={control}
              render={({ field }) => (
                <Upload
                  {...field}
                  beforeUpload={beforeUploadFileImport}
                  customRequest={customRequestFileImport}
                  onChange={handleChangeFileAndSaveForm}
                  fileList={fileListInfo}
                >
                  <Button type="primary" danger icon={<UploadOutlined />}>
                    Tải lên file XML
                  </Button>
                </Upload>
              )}
            />
          </div>
          <Row>
            <Col span={4}>
              <span style={{ color: 'red' }}></span>Mẫu hóa đơn:
            </Col>
            <Col span={20}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'type',
                }}
                inputProps={{
                  placeholder: 'Mẫu hóa đơn',
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={4}>
              <span style={{ color: 'red' }}>*</span> Kí hiệu:
            </Col>
            <Col span={20}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'symbol',
                  rules: {
                    required: 'Vui lòng nhập ký hiệu',
                    maxLength: { value: 256, message: 'Ký hiệu quá dài' },
                  },
                }}
                inputProps={{
                  placeholder: 'Ký hiệu',
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={4}>
              <span style={{ color: 'red' }}>*</span> Số hóa đơn:
            </Col>
            <Col span={20}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'code',
                  rules: {
                    required: 'Vui lòng nhập số hóa đơn',
                    maxLength: { value: 256, message: 'Số hóa đơn quá dài' },
                  },
                }}
                inputProps={{
                  placeholder: 'Số hóa đơn',
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={4}>
              <span style={{ color: 'red' }}>*</span> Ngày hóa đơn:
            </Col>
            <Col span={20}>
              <MzFormDatePicker
                controllerProps={{
                  control,
                  name: 'invoice_date',
                  rules: { required: 'Vui lòng nhập ngày hóa đơn' },
                }}
                datePickerProps={{
                  placeholder: 'Ngày hóa đơn',
                  format: 'DD/MM/YYYY',
                }}
              />
            </Col>
          </Row>

          <Row>
            <Col span={4}>
              <span style={{ color: 'red' }}>*</span> Mã số thuế:
            </Col>
            <Col span={20}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'tax_code',
                  rules: {
                    required: 'Vui lòng nhập mã số thuế',
                    maxLength: { value: 256, message: 'Mã số thuế quá dài' },
                  },
                }}
                inputProps={{
                  placeholder: 'Mã số thuế',
                }}
              />
            </Col>
          </Row>

          <Row>
            <Col span={4}>
              <span style={{ color: 'red' }}>*</span> Tên nhà cung cấp:
            </Col>
            <Col span={20}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'provider',
                  rules: {
                    required: 'Vui lòng nhập tên nhà cung cấp',
                    maxLength: {
                      value: 256,
                      message: 'Tên nhà cung cấp quá dài',
                    },
                  },
                }}
                inputProps={{
                  placeholder: 'Tên nhà cung cấp',
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={4}>
              <span style={{ color: 'red' }}></span> Địa chỉ:
            </Col>
            <Col span={20}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'address',
                }}
                inputProps={{
                  placeholder: 'Địa chỉ',
                }}
              />
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Row>
                <Col span={8}>Loại thanh toán:</Col>
                <Col span={16}>
                  <Controller
                    name={'payment_type'}
                    control={control}
                    render={({ field }) => (
                      <Radio.Group {...field}>
                        <Radio value={1}>Hoàn ứng</Radio>
                        <Radio value={2}>Phải trả nhà cung cấp</Radio>
                      </Radio.Group>
                    )}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ marginTop: 30 }}></Row>

          <Row>
            <Col span={12}>
              <Row>
                <Col span={8}>
                  <span style={{ color: 'red' }}>*</span> Link chứng từ gốc:
                </Col>
                <Col span={16}>
                  <Controller
                    name={'invoice_files'}
                    control={control}
                    render={() => (
                      <Upload
                        beforeUpload={beforeUpload}
                        customRequest={customRequest}
                        onChange={handleChangeInvoiceFile}
                        fileList={fileList}
                      >
                        <Button type="primary" danger icon={<UploadOutlined />}>
                          Tải lên chứng từ
                        </Button>
                      </Upload>
                    )}
                  />
                </Col>
              </Row>
            </Col>
          </Row>

          <div style={{ marginTop: 30 }}>
            <Collapse defaultActiveKey={['1']}>
              <Panel header={<h3>Danh sách hàng hóa</h3>} key={1}>
                <TableData
                  tableProps={{
                    columns: columnsEmployee,
                    dataSource: stockFields.fields,
                    scroll: { x: 1500 },
                    rowKey: '_id',
                    summary: () => (
                      <Table.Summary>
                        <Table.Summary.Row>
                          <Table.Summary.Cell index={0}>
                            <strong>Tổng</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={1}></Table.Summary.Cell>
                          <Table.Summary.Cell index={2}></Table.Summary.Cell>
                          <Table.Summary.Cell index={3} align="right">
                            <strong>{totalAmount ? formatNumber(totalAmount) : '0'}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={4}></Table.Summary.Cell>
                          <Table.Summary.Cell index={5} align="right">
                            <strong>{totalVatAmount ? formatNumber(Math.round(totalVatAmount)) : '0'}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={6} align="right">
                            <strong>{totalFee ? formatNumber(totalFee) : '0'}</strong>
                          </Table.Summary.Cell>
                          <Table.Summary.Cell index={7} align="right"></Table.Summary.Cell>
                        </Table.Summary.Row>
                      </Table.Summary>
                    ),
                  }}
                />
                <Row>
                  <Col span={24}>
                    <Button
                      style={{
                        width: '100%',
                        marginTop: '15px',
                        borderRadius: 0,
                      }}
                      type="dashed"
                      icon={<PlusCircleOutlined />}
                      onClick={() => stockFields.append({ _id: v4() })}
                    >
                      Thêm hàng hóa
                    </Button>
                  </Col>
                </Row>
              </Panel>
            </Collapse>

            <Col
              span={24}
              style={{
                borderBottom: '1px solid rgb(227, 227, 227)',
                marginTop: '2%',
              }}
            ></Col>

            <Row style={{ marginTop: 30 }}>
              <Col span={24}>
                <Row>
                  <Col span={8}>Tổng giá trị của hóa đơn:</Col>
                  <Col span={16}>
                    <strong>{Total_FinalAmout ? formatNumber(Math.round(Total_FinalAmout)) : '0'} VND</strong>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Form>
      </div>
    </Modal>
  );

  return (
    <div className="form-invoices">
      {isLoadingScreen ? 
        <div style={{ textAlign: 'center' }}>
          <Spin size="large" />
        </div> : 
      <div>
      {Form_detallInvoices}
      {Form_modalDeleteInvoices}
      {Form_EditInvoices}
      <div className="btn-invoices">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={showFormAdd}
          disabled={user?.id === dataPlan?.ins_id || user?.id === dataPlan?.user_process?.id ? false : true}
        >
          Thêm mới
        </Button>
      </div>
      <TableData
        tableProps={{
          columns: columns,
          dataSource: dataSource,
          rowKey: '_id',
          scroll: { x: 1500, y: 1000 },
        }}
      />
      <FormAdd
        ivisibleAdd={ivisibleAdd}
        cancelFormAdd={cancelFormAdd}
        idDetails={idDetails}
        dataTable={dataTable}
        ref={formInvoiceAdd}
      />
      </div>}
    </div>
  );
});

export default InvoiceInfor;

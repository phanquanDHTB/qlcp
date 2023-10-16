import { Button, Col, Collapse, Modal, Radio, Row, Table, Upload, message, Form } from 'antd';
import { DeleteOutlined, UploadOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Controller, FieldValues, useForm, useFieldArray } from 'react-hook-form';
import { MzFormInput } from '@components/forms/FormInput';
import getMessageError from '@utils/getMessageError';
import { forwardRef, useEffect, useState, useImperativeHandle } from 'react';
import { toast } from 'react-toastify';
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
import XMLParser from 'react-xml-parser';
import type { RadioChangeEvent } from 'antd';
import TableData from '@components/TableData';
import {
  getFillInfoProvider,
  getInvoices,
  uploadFile,
  uploadFileXML,
  handleAddOrRequest,
} from '../../../apis/page/business/plan/invoices';
import { requestCatchHook } from '@utils/hook/handleError';
import type { RangePickerProps } from 'antd/es/date-picker';
interface Props {
  idDetails: number;
  closeForm?: () => void;
  ivisibleAdd?: boolean;
  setIvisibleAdd?: boolean;
  cancelFormAdd: () => void;
  dataTable: (res: any) => void;
}
interface Invoices {
  idEdit?: number | null;
  address?: string;
  code?: string;
  provider?: string;
  symbol?: string;
  tax_code?: string;
  type?: string;
  invoice_date?: string;
  id?: number;
  plan?: { id: number | undefined };
  payment_type?: number;
  total_amount?: number;
  total_fee?: number;
  total_final_amount?: number;
  total_vat_amount?: number;
  invoice_files?: any;
  invoice_items?: any;
}
const AddInvoices = forwardRef((props: Props, ref) => {
  const { idDetails, ivisibleAdd, cancelFormAdd, dataTable } = props;

  const [fileList, setFileList] = useState<[]>([]);
  const [dataFileLink, setDataFileLink] = useState([]);
  const [fileListInfo, setFileListInfo] = useState<any[]>([]);
  const [radioPayment, setRadioPayment] = useState<number>(1);
  const [dataCost, setDataCost] = useState();

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current >= dayjs().endOf('day');
  };
  const [isLoading, setLoading] = useState<boolean>(false);

  const { control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: { payment_type: 1, listStock: [] } as any,
  });

  const stockFields = useFieldArray({
    control,
    name: 'listStock',
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

  useImperativeHandle(ref, () => ({
    resetFormAdd: async () => {
      await reset({});
      await reset({ listStock: [] });
      await setFileListInfo([]);
    },
  }));
  const resetData = async () => {
    await reset({});
    await reset({ listStock: [] });
  };
  const paymentRadio = ({ target: { value } }: RadioChangeEvent) => {
    setRadioPayment(value);
  };
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
              const matchedVatType = formatVatLov(vatLabel); // vatType.find((item) => item.label === vatLabel);
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
  const formatVatLov = (vatLabel: string) => {
    let value = 1;
    switch (vatLabel) {
      case '0%':
        value = 2;
        break;
      case '5%':
        value = 3;
        break;
      case '8%':
        value = 4;
        break;
      case '10%':
        value = 5;
        break;
      default:
        value = 1;
        break;
    }
    const vat = vatType.find((i) => i.value == value);
    return vat;
  };

  const [queryTaxtCode, setQueryTaxCode] = useState<string>();
  useEffect(() => {
    const timeOutId = setTimeout(() => {
      searchFillter(queryTaxtCode);
    }, 2000);
    return () => clearTimeout(timeOutId);
  }, [queryTaxtCode]);

  const searchFillter = async (textSearch: string | undefined) => {
    if (typeof textSearch !== undefined) {
      // const res = (await getFillInfoProvider(textSearch)) as any;
      getFillInfoProvider(textSearch)
        .then((res: any) => {
          const arr = res?.BP_LISTS;
          if (Array.isArray(arr) && arr.length > 0) {
            const rs = arr[0];
            if (rs?.ADDRESS == null && rs?.VENDOR_ROLE == null) {
              message.warning('Không tìm thấy dữ liệu nhà cung cấp');
              setValue('provider', null);
              setValue('address', null);
            } else {
              setValue('provider', rs?.VENDOR_ROLE);
              setValue('address', rs?.ADDRESS);
            }
          }
        })
        .catch((error) => {
          requestCatchHook({ e: error });
        });
    }
  };

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
      .then(async (response) => {
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
  const allowedFileExtensions = ['pdf', 'vpdf', 'xls', 'xlsx', 'doc', 'docx', 'xml'];
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

  const submitInvoices = () => {
    handleSubmit(addInvoices)();
  };

  const addInvoices = async (value: FieldValues) => {
    setLoading(true);
    try {
      const data: Invoices = {
        type: value.type,
        symbol: value.symbol,
        code: value.code,
        invoice_date: dayjs(value.invoice_date).toISOString(),
        tax_code: value.tax_code,
        provider: value.provider,
        address: value.address,
        plan: { id: idDetails },
      };

      data.total_amount = !totalAmount ? 0 : totalAmount;
      data.total_fee = !totalFee ? 0 : totalFee;
      data.total_vat_amount = !totalVatAmount ? 0 : totalVatAmount;
      data.total_final_amount = !Total_FinalAmout ? 0 : Total_FinalAmout;
      data.invoice_files = dataFileLink;
      data.invoice_items = value.listStock;
      data.payment_type = radioPayment;

      if (data.invoice_files.length === 0) {
        toast('Vui lòng chọn link chứng từ gốc', { type: 'error' });
        setLoading(false);
        return;
      }
      const dataRequest = {
        ...data,
      };
      const rs = (await handleAddOrRequest(dataRequest)) as any;
      if (rs) {
        cancelFormAdd();
        reset({});
        setFileList([]);
        setDataFileLink([]);
        setFileListInfo([]);
        message.success('Thêm hóa đơn thành công!');
        setLoading(false);
      }

      const res = (await getInvoices(idDetails)) as any;
      dataTable(res.content);
      setLoading(false);
    } catch (error) {
      toast(getMessageError(error), { type: 'error' });
      setLoading(false);
    }
  };
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
      width: 200,
      render: (_, __, index) => {
        return (
          <div style={{ width: '200px', marginTop: 23 }}>
            <MzFormInput
              controllerProps={{
                control,
                name: `listStock.${index}.name`,
                rules: {
                  required: 'Vui lòng nhập thông tin hàng hóa dịch vụ',
                  validate: (value) => {
                    if (value) {
                      if (value.length < 90) {
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
          <div style={{ marginTop: 23 }}>
            <MzFormSelectV2
              isFormItem={true}
              labelObj={['name']}
              valueObj={'id'}
              controllerProps={{
                control,
                name: `listStock.${index}.cost.id`,
                rules: { required: 'Vui lòng chọn loại chi phí' },
              }}
              selectProps={{
                placeholder: 'Loại chi phí',
                style: { width: 350 },
                allowClear: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  const isSlugMatch = toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                  return isSlugMatch;
                },
                onSelect: (_, v) => {
                  index === 0 && setDataCost(v.credit_acc);
                },
              }}
              uri={index > 0 ? 'costs?isActive.in=1&' + 'creditAcc.contains=' + dataCost : 'costs?isActive.in=1'}
              uriSearch={'keyWord='}
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
                style: { width: 150, marginTop: 16, borderRadius: '0px' },
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

  const Form_invoices = (
    <div className={'infor-wrap'}>
      <Form>
        <div className="btn-uploadXML">
          <Controller
            name={'invoice_files'}
            control={control}
            render={() => (
              <Upload
                beforeUpload={beforeUploadFileImport}
                customRequest={customRequestFileImport}
                onChange={handleChangeFileAndSaveForm}
                fileList={fileListInfo}
                onRemove={() => {
                  resetData();
                }}
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
                disabledDate: disabledDate,
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
              inputType={'Search'}
              controllerProps={{
                control,
                name: 'tax_code',
                rules: {
                  required: 'Vui lòng nhập mã số thuế',
                  maxLength: { value: 256, message: 'Mã số thuế quá dài' },
                },
              }}
              searchProps={{
                placeholder: 'Mã số thuế',
                onSearch: (value) => {
                  searchFillter(value);
                },
                onChange: (e) => {
                  setValue('tax_code', e.target.value);
                  setQueryTaxCode(e.target.value);
                },
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
                <Radio.Group defaultValue={1} onChange={paymentRadio} value={radioPayment}>
                  <Radio value={1}>Hoàn ứng</Radio>
                  <Radio value={2}>Phải trả nhà cung cấp</Radio>
                </Radio.Group>
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
                      multiple
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
                        <Table.Summary.Cell index={7} align="right">
                          </Table.Summary.Cell>
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
                  <strong>{Total_FinalAmout ? formatNumber(Total_FinalAmout) : '0'} VND</strong>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Form>
    </div>
  );
  return (
    <Modal
      title="Thêm Mới Hóa Đơn"
      destroyOnClose={true}
      open={ivisibleAdd}
      onCancel={cancelFormAdd}
      style={{
        top: 0
      }}
      width={'100vw'}
      footer={[
        <Button style={{ border: 'unset', background: '#ffffff' }} onClick={cancelFormAdd} key={v4()}>
          Đóng
        </Button>,
        <Button
          loading={isLoading}
          style={{
            background: '#ed1b2f',
            borderColor: '#ed1b2f',
            width: '120px',
            color: '#fff',
          }}
          onClick={submitInvoices}
          key={v4()}
        >
          Lưu
        </Button>,
      ]}
    >
      <div className="scrollbarInvoices">
        <div className="scrollbar-content">{Form_invoices}</div>
      </div>
    </Modal>
  );
});
export default AddInvoices;

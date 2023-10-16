import {
  Button,
  Empty,
  Table,
  Tag,
  Pagination,
  Popconfirm,
  Modal,
  Steps,
  Row,
  Col,
  Radio,
  UploadProps,
  Upload,
  Space,
  message,
} from 'antd';
import { useState, type PropsWithChildren, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { CloudUploadOutlined, EditOutlined, CheckCircleFilled, CheckOutlined, SelectOutlined } from '@ant-design/icons';
import camelCase from 'lodash/camelCase';
import FileSaver from 'file-saver';
import { v4 } from 'uuid';
import { call } from '../../../apis/baseRequest';
import Title from '../../../config/columns/entitiesTitle/excel';
import './importStyles.scss';

export type BaseExportProps = PropsWithChildren<{
  entity?: string;
  selected?: any;
  onReload?: () => void;
}>;

const { Dragger } = Upload;
const enum upLoadTypeEnum {
  THEM_MOI = 1,
  CAP_NHAT = 2,
}
const BaseExport = forwardRef(({ entity, onReload }: BaseExportProps, ref) => {
  const { handleSubmit, control, unregister } = useForm();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [current, setCurrent] = useState<number>(0);
  const [importTotal, setImportTotal] = useState<number>(0);
  const [validImportTotal, setValidImportTotal] = useState<number>(0);
  const [invalidImportTotal, setInvalidImportTotal] = useState<number>(0);
  const [importObject, setImportObject] = useState<any>({
    header: [],
    data: null,
  });
  const [uploadType, setUploadType] = useState(2);
  const [uploadLoading, setUploadLoading] = useState<boolean>(false);
  const [importExcelLoading, setImportExcelLoading] = useState<boolean>(false);
  const [fileList, setFileList] = useState<any[]>([]);
  useImperativeHandle(ref, () => ({
    reloadBasePage: () => {
      console.log('reload');
    },
  }));
  const onChangeStep = (value) => {
    setCurrent(value);
  };

  const props: UploadProps = {
    name: 'file',
    beforeUpload: (file) => beforeUpload(file),
    onRemove: (file) => handleRemove(file),
    fileList: fileList,
  };
  const handleRemove = (file) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
  };
  const beforeUpload = (file) => {
    setFileList([...fileList, file].slice(-1));
    return false;
  };

  function exportSample(payload: any) {
    call({
      method: 'GET',
      uri: entity + `/sample`,
      hasToken: true,
      configRequest: {
        params: payload,
        responseType: 'blob',
      },
    })
      .then((response: any) => {
        const t = Title.title[camelCase(entity)];
        const fileName = `Danh_sach_${t}.xlsx`;
        FileSaver.saveAs(new Blob([response]), fileName);
      })
      .catch((error) => {
        console.log(error);
      });
  }

  const handleExportTemplateFile = () => {
    let payload;
    exportSample(payload);
  };

  function wrapClass(data_type: any) {
    let wrapClass = 'text-left';
    switch (data_type) {
      case 'number':
        wrapClass = 'text-right';
        break;
      case 'date':
      case 'datetime':
      case 'time':
        wrapClass = 'text-center';
        break;
      default:
        wrapClass = 'text-left';
        break;
    }
    return wrapClass;
  }

  const handlePrev = () => {
    setCurrent(current - 1);
  };
  function validateImport(payload) {
    const fmData = new FormData();
    fmData.append('file', payload.file);
    fmData.append('type', payload.type);
    return call({
      method: 'POST',
      uri: `${entity}` + '/validate',
      hasToken: true,
      isFormUpload: true,
      bodyParameters: fmData,
    });
  }
  function importFile(payload) {
    return call({
      method: 'POST',
      uri: `${entity}` + '/import',
      hasToken: true,
      bodyParameters: payload,
    });
  }

  const handleUpload = () => {
    setUploadLoading(true);
    const payload = {
      file: fileList[0],
      type: uploadType,
    };
    validateImport(payload)
      .then((response) => {
        setImportObject(response);
        setCurrent(current + 1);
        setUploadLoading(false);
      })
      .catch(() => {
        message.error('Có lỗi trong quá trình tải file');
        setUploadLoading(false);
      });
  };
  const handleComplete = () => {
    setCurrent(0);
    setFileList([]);
    setImportObject({
      header: [],
      data: null,
    });
    setIsModalOpen(false);
    if (onReload) onReload();
  };
  const handleImport = () => {
    setImportExcelLoading(true);
    const data = importObject.data.filter((p) => p.is_valid);
    const payload = {
      file_id: importObject.file_id,
      header: importObject.header,
      type: uploadType,
      is_success: true,
      total: validImportTotal,
      data,
    };
    importFile(payload)
      .then(() => {
        setCurrent(current + 1);
        setImportExcelLoading(false);
      })
      .catch(() => {
        setImportExcelLoading(false);
        message.error('Có lỗi trong quá trình nhập file');
      });
  };
  const handleCloseModal = () => {
    setFileList([]);
    setImportObject({
      header: [],
      data: null,
    });
    setIsModalOpen(false);
    setCurrent(0);
  };

  useEffect(() => {
    if (Array.isArray(importObject?.data)) {
      setImportTotal(importObject.data.length);
      setValidImportTotal(importObject.data.filter((i) => i.is_valid == true).length);
      setInvalidImportTotal(importObject.data.filter((i) => i.is_valid == false).length);
    } else {
      setImportTotal(0);
      setValidImportTotal(0);
      setInvalidImportTotal(0);
    }
  }, [importObject]);

  return (
    <div className={'base_import'}>
      <Button onClick={() => setIsModalOpen(true)} style={{ backgroundColor: '#ffffff', borderColor: '#d9d9d9' }}>
        <SelectOutlined style={{ color: 'rgba(0, 0, 0, 0.88)' }} />
      </Button>
      <Modal
        destroyOnClose={true}
        title="Nhập dữ liệu từ file excel"
        open={isModalOpen}
        // onOk={handleExportExcel}
        onCancel={() => handleCloseModal()}
        className="base_import"
        width={'60%'}
        footer={
          current == 0
            ? [
                <Button onClick={() => handleCloseModal()} key={v4()}>
                  {'Đóng'}
                </Button>,
                <Button
                  onClick={() => handleUpload()}
                  key={v4()}
                  type={'primary'}
                  loading={uploadLoading}
                  disabled={fileList.length == 0}
                >
                  {'Kế tiếp'}
                </Button>,
              ]
            : current == 1
            ? [
                <Button onClick={() => handlePrev()} key={v4()}>
                  {'Trở về'}
                </Button>,
                <Button
                  onClick={() => handleImport()}
                  key={v4()}
                  type={'primary'}
                  disabled={validImportTotal === 0}
                  loading={importExcelLoading}
                >
                  {'Nhập Excel'}
                </Button>,
              ]
            : [
                <Button onClick={() => handleComplete()} key={v4()} type={'primary'}>
                  {'Hoàn thành'}
                </Button>,
              ]
        }
      >
        <Steps
          current={current}
          onChange={onChangeStep}
          size="default"
          className="customs-step"
          items={[
            {
              subTitle: 'Tải tệp lên',
              icon: <CloudUploadOutlined />,
              disabled: current !== 0,
            },
            {
              subTitle: 'Kiểm tra dữ liệu',
              icon: <EditOutlined />,
              disabled: current !== 1,
            },
            {
              subTitle: 'Hoàn thành',
              icon: <CheckOutlined />,
              disabled: current !== 2,
            },
          ]}
        />
        {current == 0 ? (
          <div>
            <Row>
              <Col span={24}>
                <Controller
                  name={'type'}
                  control={control}
                  render={({ field }) => (
                    <Radio.Group {...field} defaultValue={upLoadTypeEnum.CAP_NHAT}>
                      {/* <Radio
                          value={upLoadTypeEnum.THEM_MOI}
                          onClick={() => setUploadType(upLoadTypeEnum.THEM_MOI)}
                        >
                          {"Thêm mới"}
                        </Radio> */}
                      <Radio value={upLoadTypeEnum.CAP_NHAT} onClick={() => setUploadType(upLoadTypeEnum.CAP_NHAT)}>
                        {'Cập nhật'}
                      </Radio>
                    </Radio.Group>
                  )}
                />
              </Col>
            </Row>
            <Row>
              <div className="upload-content">
                <Dragger {...props}>
                  <p className="ant-upload-drag-icon">
                    <CloudUploadOutlined />
                  </p>
                  <p className="ant-upload-text">
                    <span style={{ color: 'red' }}>{'Chọn tệp '}</span>
                    <span>{'hoặc kéo thả vào vùng này'}</span>
                  </p>
                </Dragger>
              </div>
            </Row>
            {/* <Row>
                <p>
                  {"Tải xuống file mẫu kèm dữ liệu "}{" "}
                  <a
                    style={{ color: "red" }}
                    onClick={() => handleExportTemplateFile()}
                  >
                    {"tại đây"}
                  </a>
                </p>
              </Row> */}
          </div>
        ) : null}
        {/* step kiểm tra dữ liệu */}
        {current == 1 ? (
          <div>
            <p className="overview">
              <Space style={{ tabSize: 16 }}>
                <span className="pd_left">
                  {'Tổng số bản ghi'}:<strong> {importTotal}</strong>
                </span>
                <span className="pd_left">
                  {'Tổng số bản ghi hợp lệ'}:<strong style={{ color: '#ed1b2f' }}>{validImportTotal}</strong>
                </span>
                <span className="pd_left">
                  {'Số bản ghi không hợp lệ'}:<strong style={{ color: '#ed1b2f' }}>{invalidImportTotal}</strong>
                </span>
              </Space>
            </p>
            <div className="excel_table">
              <Row>
                <div className="table_title">
                  <p className="error_title">{'Dòng số'}</p>
                  {importObject.header ? Object.values(importObject.header).map((item: any) => <p>{item}</p>) : 'null'}
                </div>
                <div>
                  {Array.isArray(importObject.data)
                    ? importObject.data.map((item) => {
                        return (
                          <div className="table_content">
                            <div className="column_detail error_column">
                              <div className={`${!item.is_valid ? 'row_error' : ''}`}>
                                {item.row}
                                <br />
                                {item.error_message}
                              </div>
                            </div>
                            {importObject.header
                              ? Object.keys(importObject.header).map((key: any, index) => {
                                  console.log(key, index, '//checked');
                                  return <div className={`${wrapClass(key.data_type)} column_detail`}>{item[key]}</div>;
                                })
                              : null}
                          </div>
                        );
                      })
                    : null}
                </div>
              </Row>
            </div>
          </div>
        ) : null}
        {/* step hoàn thành */}
        {current == 2 ? (
          <div>
            <div className="complete">
              <CheckCircleFilled />
              <p>{'Nhập dữ liệu thành công'}</p>
              <p>
                {'Đã nhập thành công'} {validImportTotal}/{importTotal}
                {' bản ghi'}
              </p>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
});

export default BaseExport;

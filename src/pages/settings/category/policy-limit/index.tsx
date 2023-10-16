import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import { Space, Button, Modal, Col, Row, Switch, Radio, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import title from '@columnTitles/policy-limit';
import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { deleteRecord } from '../../../../apis/policy-limit/policy-limit';
import formatNumber from '@utils/formatNumber';
import Form from './form';

const PolicyLimit = () => {
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
      dataIndex: 'type',
      dataType: 'list',
      dataSource: [
        {
          value: 1, 
          text: 'Trong nước',
        },
        {
          value: 2,
          text: 'Nước ngoài',
        },
      ],
    },
    { 
      width: 200,
      dataIndex: 'name_of_position_group_id',
    },
    {
      width: 200,
      dataIndex: 'name_of_service_group_id',
    },
    {
      width: 200,
      dataIndex: 'name_of_service_id',
    },
    {
      width: 200,
      dataIndex: 'limit_amount',
      dataType: 'currency',
    },
    {
      width: 150,
      dataIndex: 'start_time',
      dataType: 'date',
    },
    {
      width: 150,
      dataIndex: 'end_time',
      dataType: 'date',
    },
    {
      width: 150,
      dataIndex: 'is_active',
      dataType: 'list', 
      dataSource: [
        {
          value: true,
          text: 'Hoạt động',
        },
        {
          value: false,
          text: 'Ngừng hoạt động',
        },
      ],
    },
    {
      width: 120,
      dataIndex: 'id',
      align: 'center',
      render: (value, record) => (
        <Space>
          <Button
            onClick={() => {
              setIdEdit(value);
              setIsOpenModal(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Button onClick={() => showConfirmDelete(record)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [recordDetail, setRecordDetail] = useState({});
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [idEdit, setIdEdit] = useState<null | number>(null);
  const formRef = useRef<{ submitForm: () => void }>();
  const base = useRef<{ reloadBasePage: () => void }>();
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
  const showConfirmDelete = (record) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa bản ghi ${record.code} ?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() {
        deleteRecord(record.id)
          .then(() => {
            message.success(`Xóa thành công chính sách hạn mức ${record.code}`);
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
            <Col style={{ fontWeight: '600' }} span={24}>
            Mã chính sách hạn mức: 
            </Col>
            <Col span={24}>
              <span>{record ? record.code : '--'}</span>
            </Col>
          </Row> 
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Nhóm chức vụ:
            </Col>
            <Col span={24}>
              <span>{record.position_group ? record.position_group.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Nhóm dịch vụ: 
            </Col>
            <Col span={24}>
              <span>{record.service_group ? record.service_group.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Loại dịch vụ:
            </Col>
            <Col span={24}>
              <span>{record.service ? record.service.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Hạn mức đơn giá:
            </Col>
            <Col span={24}>
              <span>{record.limit_amount ? formatNumber(record.limit_amount) : '--'}</span>
            </Col>
          </Row>

          <Row style={{ marginBottom: '12px' }} gutter={[8, 0]}>
            <Col span={12}>
              <Row gutter={[0, 8]}>
                <Col style={{ fontWeight: '600' }} span={24}>
                  Ngày bắt đầu:
                </Col>
                <Col span={24}>
                  <span>{record.start_time ? dayjs(record.start_time).format('DD/MM/YYYY') : '--'} </span>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row gutter={[0, 8]}>
                <Col style={{ fontWeight: '600' }} span={24}>
                  Ngày kết thúc:
                </Col>
                <Col span={24}>
                  <span>{record.end_time ? dayjs(record.end_time).format('DD/MM/YYYY') : '--'}</span>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Mô tả:
            </Col>
            <Col span={24}>
              <span>{record.description ? record.description : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[8, 8]}>
            <Col span={12}>
              <Col style={{ fontWeight: '600' }} span={24}>
                Hình thức công tác :
              </Col>
              <Col span={24}>
                <Radio.Group disabled={true} value={record.type}>
                  <Radio value={1}>Công tác trong nước</Radio>
                  <Radio value={2}>Công tác nước ngoài</Radio>
                </Radio.Group>
              </Col>
            </Col>
            <Col span={12}>
              <Col style={{ fontWeight: '600' }} span={24}>
                {' '}
                Trạng thái:
              </Col>
              <Col span={24}>
                <Switch checked={record.is_active} disabled={true} />
              </Col>
            </Col>
          </Row>
        </div>
      );
    }
  };
  const openDetail = (record) => {
    setIsOpenDetail(true);
    setRecordDetail(record);
  };
  return (
    <>
      <BasePage
        ref={base}
        uriFetch="policy-limits"
        columnTiles={title}
        columns={columns}
        onAddClick={() => {
          setIsOpenModal(true);
          setIdEdit(null);
        }}
        headerTitle={title.name}
        isAddButton
        isMultipleDelete
        isDeleteButton
      />
      <Modal
        open={isOpenModal}
        onCancel={() => {
          onCloseModal();
        }}
        title={`${idEdit ? 'Sửa' : 'Thêm mới'} chính sách hạn mức`}
        footer={[
          <Button style={{ border: 'unset', background: '#ffffff' }} onClick={() => onCloseModal()} key={v4()}>
            Thoát
          </Button>,
          <Button
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
      >
        <Form idEdit={idEdit} ref={formRef} reloadTable={() => reloadTable()} closeForm={() => onCloseModal()} />
      </Modal>
      <Modal
        open={isOpenDetail}
        onCancel={() => {
          setIsOpenDetail(false);
        }}
        title={`Chi tiết chính sách hạn mức`}
        footer={[
          <Button style={{ background: '#ffffff' }} onClick={() => setIsOpenDetail(false)} key={v4()}>
            Thoát
          </Button>,
        ]}
      >
        {renderModalDetail(recordDetail)}
      </Modal>
    </>
  );
};

export default PolicyLimit;

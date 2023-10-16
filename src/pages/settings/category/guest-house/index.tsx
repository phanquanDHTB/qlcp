import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { Space, Button, Modal, Col, Row, Switch, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import title from '@columnTitles/guestHouse';
import { deleteRecord } from '../../../../apis/guest-house/guest-house';
import { requestCatchHook } from '@utils/hook/handleError';
import Form from './form';

const GuestHouse = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      dataIndex: 'code',
      width: 250,
      fixed: 'left',
      render: (value, record) => <a onClick={() => openDetail(record)}>{value}</a>,
    },
    {
      dataIndex: 'name',
      width: 200,
    },
    {
      dataIndex: 'phone_number',
      width: 200,
    },
    {
      width: 200,
      dataIndex: 'staff_name',
    },
    {
      width: 200,
      dataIndex: 'name_of_province_id',
    },
    {
      width: 200,
      dataIndex: 'name_of_district_id',
    },
    {
      width: 200,
      dataIndex: 'name_of_ward_id',
    },
    {
      width: 450,
      dataIndex: 'address',
    },
    {
      width: 250,
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
      onOk: () => {
        deleteRecord(record.id)
          .then(() => {
            message.success(`Xóa thành công phương tiện ${record.code}`);
            reloadTable();
          })
          .catch((error) => {
            requestCatchHook({ e: error });
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
              Mã Nhà khách:
            </Col>
            <Col span={24}>
              <span>{record.code}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tên Nhà khách:
            </Col>
            <Col span={24}>
              <span>{record.name}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Điện thoại liên hệ:
            </Col>
            <Col span={24}>
              <span>{record.phone_number ? record.phone_number : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tên nhân viên phụ trách:
            </Col>
            <Col span={24}>
              <span>{record.staff_name ? record.staff_name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tỉnh:
            </Col>
            <Col span={24}>
              <span>{record.province?.name ? record.province?.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Quận/Huyện:
            </Col>
            <Col span={24}>
              <span>{record.district?.name ? record.district?.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Xã/Phường:
            </Col>
            <Col span={24}>
              <span>{record.ward?.name ? record.ward?.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Địa chỉ:
            </Col>
            <Col span={24}>
              <span>{record.address ? record.address : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={12}>
              Trạng thái:
            </Col>
            <Col span={12}>
              <Switch checked={record.is_active} disabled={true} />
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
        uriFetch="hotels"
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
        title={`${idEdit ? 'Sửa' : 'Thêm'} Nhà khách`}
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
        title={`Chi tiết Nhà khách`}
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

export default GuestHouse;

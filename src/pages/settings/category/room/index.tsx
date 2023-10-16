import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import { Space, Button, Modal, Col, Row, Switch, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import title from '@columnTitles/room';
import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { deleteRecord } from '../../../../apis/room/room';
import { requestCatchHook } from '@utils/hook/handleError';
import Form from './form';

const Room = () => {
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
      dataIndex: 'is_active',
      width: 200,
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
    console.log(record);
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa bản ghi ${record.code} ?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk: () => {
        deleteRecord(record.id)
          .then(() => {
            message.success(`Xóa thành công bản ghi ${record.code}`);
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
              Mã phòng nghỉ:
            </Col>
            <Col span={24}>
              <span>{record.code}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tên phòng nghỉ:
            </Col>
            <Col span={24}>
              <span>{record.name}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Trạng thái:
            </Col>
            <Col span={24}>
              <Switch checked={record.is_active} disabled={true} />
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
        uriFetch="rooms"
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
        title={`${idEdit ? 'Sửa' : 'Thêm'} phòng nghỉ`}
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
        title={`Chi tiết phòng nghỉ`}
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

export default Room;

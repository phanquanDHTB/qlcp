import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import { Space, Button, Modal, Col, Row, Switch, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import title from '@columnTitles/district';
import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { save, deleteRecord } from '@apis/district/district';
import Form from './form';

const District = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 150,
      dataIndex: 'code',
      // isCodeIndex: true,
      fixed: 'left',
      render: (value, record) => <a onClick={() => openDetail(record)}>{value}</a>,
    },
    {
      width: 250,
      dataIndex: 'name',
    },
    {
      width: 250,
      dataIndex: 'name_of_province_id',
    },
    {
      width: 250,
      dataIndex: 'name_of_country_id',
    },
    // {
    //   width: 200,
    //   dataIndex: "ins_id",
    // },
    // {
    //   width: 200,
    //   dataIndex: "upd_id",
    // },
    // {
    //   width: 200,
    //   dataIndex: "ins_date",
    //   dataType: "date",
    // },
    // {
    //   width: 200,
    //   dataIndex: "upd_date",
    //   dataType: "date",
    // },
    {
      width: 200,
      dataIndex: 'is_active',
      dataType: 'list',
      dataSource: [
        {
          value: false,
          text: 'Ngừng hoạt động',
        },
        {
          value: true,
          text: 'Hoạt động',
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
            message.success(`Xóa thành công huyện ${record.code}`);
            reloadTable();
          })
          .catch((error) => {
            console.log(error);
          });
      },
    });
  };

  const handleType = (type) => {
    switch (type) {
      case 1:
        return 'Quận';
      case 2:
        return 'Huyện';
      case 3:
        return 'Thành phố';
      case 4:
        return 'Thị xã';
      default:
        return '--';
    }
  };
  const renderModalDetail = (record) => {
    if (Object.keys(record).length > 0) {
      return (
        <div className={'infor-wrap'}>
          <Row>
            <Col span={12}>
              <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
                <Col style={{ fontWeight: '600' }} span={24}>
                  Mã huyện:
                </Col>
                <Col span={24}>
                  <span>{record.code}</span>
                </Col>
              </Row>
              <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
                <Col style={{ fontWeight: '600' }} span={24}>
                  Tên huyện:
                </Col>
                <Col span={24}>
                  <span>{record.name}</span>
                </Col>
              </Row>
              <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
                <Col style={{ fontWeight: '600' }} span={24}>
                  Tên tỉnh:
                </Col>
                <Col span={24}>
                  <span>{record.province ? record.province.name : '--'}</span>
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
                <Col style={{ fontWeight: '600' }} span={24}>
                  Tên quốc gia:
                </Col>
                <Col span={24}>
                  <span>{record.country ? record.country.name : '--'}</span>
                </Col>
              </Row>
              <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
                <Col style={{ fontWeight: '600' }} span={24}>
                  Trạng thái:
                </Col>
                <Col span={24}>
                  <Switch checked={record.is_active} disabled />
                </Col>
              </Row>
              <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
                <Col style={{ fontWeight: '600' }} span={24}>
                  Kiểu:
                </Col>
                <Col span={24}>
                  <span>{handleType(record.type)}</span>
                </Col>
              </Row>
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
        uriFetch="districts"
        columnTiles={title}
        columns={columns}
        onAddClick={() => {
          setIsOpenModal(true);
          setIdEdit(null);
        }}
        isAddButton
        isMultipleDelete
        isDeleteButton
        headerTitle={title.name}
      />
      <Modal
        open={isOpenModal}
        onCancel={() => {
          onCloseModal();
        }}
        title={`${idEdit ? 'Sửa' : 'Thêm'} huyện`}
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
        title={`Chi tiết huyện`}
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

export default District;

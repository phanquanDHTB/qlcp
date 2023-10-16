import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import { Space, Button, Modal, Col, Row, message, Tag } from 'antd';
import title from '@columnTitles/user';
import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { deleteRecord } from '../../../../apis/user/user';
import Form from './form';

const User = () => {
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
      dataIndex: 'username',
    },
    {
      width: 300,
      dataIndex: 'full_name',
    },
    // {
    //     width: 300,
    //     dataIndex: "departments",
    //     dataType:'array'
    // },
    {
      width: 300,
      dataIndex: 'phone_number',
      dataType: 'phone',
    },
    {
      width: 300,
      dataIndex: 'email',
      dataType: 'email',
      ellipsis: true,
    },
    {
      width: 300,
      dataIndex: 'position',
      ellipsis: true,
      dataType: 'object',
    },
    // {
    //   width: 120,
    //   dataIndex: "id",
    //   align: "center",
    //   render: (value, record) => (
    //     <Space>
    //       <Button
    //         onClick={() => {
    //           setIdEdit(value);
    //           setIsOpenModal(true);
    //         }}
    //       >
    //         <EditOutlined />
    //       </Button>
    //       <Button onClick={() => showConfirmDelete(record)}>
    //         <DeleteOutlined />
    //       </Button>
    //     </Space>
    //   ),
    // },
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
  const renderSex = (sex) => {
    switch (sex) {
      case 'M':
        return 'Nam';
      case 'G':
        return 'Nữ';
      default:
        return 'Chưa rõ';
    }
  };
  const renderDepartment = (array) => {
    const result: any = [];
    array.map((p) => {
      result.push(p?.department?.name);
    });
    return result;
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
            message.success(`Xóa thành công nhân viên ${record.code}`);
            reloadTable();
          })
          .catch((error) => {
            console.log(error);
          });
      },
      onCancel() {
        console.log('xxx')
      },
    });
  };
  const renderModalDetail = (record) => {
    if (Object.keys(record).length > 0) {
      return (
        <div className={'infor-wrap'}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tài khoản:
            </Col>
            <Col span={24}>
              <span>{record.username ? record.username : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Họ và tên:
            </Col>
            <Col span={24}>
              <span>{record.full_name ? record.full_name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Email:
            </Col>
            <Col span={24}>
              <span>{record.email ? record.email : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Số điện thoại:
            </Col>
            <Col span={24}>
              <span>{record.phone_number ? record.phone_number : '--'}</span>
            </Col>
          </Row>

          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Trạng thái:
            </Col>
            <Col span={24}>
              <span>{record.is_active ? (record.is_active == true ? 'Hoạt động' : 'Ngừng hoạt động') : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Ngân hàng:
            </Col>
            <Col span={24}>
              <span>{record.bank_name ? record.bank_name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Số tài khoản:
            </Col>
            <Col span={24}>
              <span>{record.bank_account_number ? record.bank_account_number : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Chi nhánh:
            </Col>
            <Col span={24}>
              <span>{record.bank_location ? record.bank_location : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Giới tính:
            </Col>
            <Col span={24}>
              <span>{record.gender ? renderSex(record.gender) : renderSex('O')}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Chức vụ:
            </Col>
            <Col span={24}>
              <span>{record.position ? record.position : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Đơn vị:
            </Col>
            <Col span={24}>
            <Space size={[0, 8]} wrap>
                {record.departments
                  ? renderDepartment(record.departments).map((item: string) => <Tag>{item}</Tag>)
                  : '--'}
              </Space>
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
        uriFetch="users"
        columnTiles={title}
        columns={columns}
        hiddenGroupAction={true}
        onAddClick={() => {
          setIsOpenModal(true);
          setIdEdit(null);
        }}
        headerTitle={title.name}
      />
      <Modal
        open={isOpenModal}
        onCancel={() => {
          onCloseModal();
        }}
        title={`${idEdit ? 'Sửa' : 'Thêm'} nhân viên`}
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
        width={1000}
        style={{ top: 20 }}
      >
        <Form idEdit={idEdit} ref={formRef} reloadTable={() => reloadTable()} closeForm={() => onCloseModal()} />
      </Modal>
      <Modal
        open={isOpenDetail}
        onCancel={() => {
          setIsOpenDetail(false);
        }}
        title={`Chi tiết nhân viên`}
        bodyStyle={{
          maxHeight: 'calc(100vh - 240px)',
          overflowX: 'scroll',
        }}
        centered={true}
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

export default User;

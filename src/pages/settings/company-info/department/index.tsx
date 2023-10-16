import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { Button, Modal, Col, Row, message } from 'antd';
import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import title from '@columnTitles/department';
import { deleteRecord } from '../../../../apis/department/department';
import Form from './form';

const Department = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 200,
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
      dataIndex: 'branch',
    },
    // {
    //   width: 250,
    //   dataIndex: "address",
    // },
    // {
    //   width: 250,
    //   dataIndex: "phone",
    //   dataType: "phone",
    // },
    // {
    //   width: 250,
    //   dataIndex: "parent_id",
    // },
    // {
    //   width: 250,
    //   dataIndex: "partner_department_id",
    // },
    {
      width: 250,
      dataIndex: 'name_of_country_id',
    },
    {
      width: 250,
      dataIndex: 'name_of_province_id',
    },
    {
      width: 250,
      dataIndex: 'name_of_district_id',
    },
    {
      width: 250,
      dataIndex: 'name_of_ward_id',
    },
    // {
    //   width: 120,
    //   dataIndex: "id",
    //   align: "center",
    //   fixed: "right",
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
      onOk:() => {
        deleteRecord(record.id).then(() => {
          message.success(`Xóa thành công đơn vị ${record.code}`);
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
              Mã đơn vị:
            </Col>
            <Col span={24}>
              <span>{record.code}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tên đơn vị:
            </Col>
            <Col span={24}>
              <span>{record.name}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tên xã:
            </Col>
            <Col span={24}>
              <span>{record.ward ? record.ward.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tên huyện:
            </Col>
            <Col span={24}>
              <span>{record.district ? record.district.name : '--'}</span>
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
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tên quốc gia:
            </Col>
            <Col span={24}>
              <span>{record.country ? record.country.name : '--'}</span>
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
        uriFetch="departments"
        columnTiles={title}
        columns={columns}
        hiddenGroupAction={true}
        onAddClick={() => {
          setIsOpenModal(true);
          setIdEdit(null);
        }}
        isDeleteButton
        headerTitle={title.name}  
      />
      <Modal
        open={isOpenModal}
        onCancel={() => {
          onCloseModal();
        }}
        title={`${idEdit ? 'Sửa' : 'Thêm'} đơn vị`}
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
        title={`Chi tiết đơn vị`}
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

export default Department;

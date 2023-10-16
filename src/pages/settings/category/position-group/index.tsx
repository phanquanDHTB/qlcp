import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import { Space, Button, Modal, Col, Row, Switch, Radio, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import title from '@columnTitles/position-group';
import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { requestCatchHook } from '@utils/hook/handleError';
import Form from './form';
import { deleteRecord, handleGetDetailsForEditRequest } from '../../../../apis/position-group/position-group';

const PositionGroup = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 200,
      dataIndex: 'code',
      // isCodeIndex: true,
      fixed: 'left',
      render: (value, record) => <a onClick={() => openDetail(record)}>{value}</a>,
    },
    {
      dataIndex: 'name',
      width: 300,
    },
    {
      dataIndex: 'is_cost_prediction',
      width: 300,
      dataType: 'list',
      dataSource: [
        {
          value: true,
          text: 'Dự toán chi phí',
        },
        {
          value: false,
          text: 'Không dự toán chi phí',
        },
      ],
    },
    // {
    //   width: 300,
    //   dataIndex: "name_of_department_id",
    // },
    {
      width: 300,
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
            message.success(`Xóa thành công nhóm chức vụ ${record.code}`);
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
              Mã nhóm chức vụ:
            </Col>
            <Col span={24}>
              <span>{record.code}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tên nhóm chức vụ:
            </Col>
            <Col span={24}>
              <span>{record.name}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={24}>
              <Radio.Group disabled={true} value={record.is_cost_prediction}>
                <Radio value={true}>Dự toán chi phí</Radio>
                <Radio value={false}>Không dự toán chi phí</Radio>
              </Radio.Group>
            </Col>
          </Row>
          {/* <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col style={{ fontWeight: "600" }} span={24}>
              Đơn vị:
            </Col>
            <Col span={24}>
              <span>{record.department ? record.department.name : "--"}</span>
            </Col>
          </Row> */}
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Chức vụ:
            </Col>
            <Col span={24}>
              <span>{record.position && record.position.length > 0 ? record.position.toString() : '--'}</span>
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
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              {' '}
              Trạng thái:
            </Col>
            <Col span={24}>
              <Switch checked={record.is_active} disabled={true} />
            </Col>
          </Row>
        </div>
      );
    }
  };
  const openDetail = async (record) => {
    setIsOpenDetail(true);
    try {
      const res = (await handleGetDetailsForEditRequest(record.id)) as any;
      const position: any = [];
      if (res.positions && res.positions.length > 0) {
        res.positions.map((p) => {
          const item = p?.code + ' - ' + p?.name;
          position.push(item);
        });
      }
      const payload: any = { ...res, ...{ position } };
      setRecordDetail(payload);
    } catch (error) {
      toast(getMessageError(error), { type: 'error' });
    }
  };
  return (
    <>
      <BasePage
        ref={base}
        uriFetch="position-groups"
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
        title={`${idEdit ? 'Sửa' : 'Thêm'} nhóm chức vụ`}
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
        title={`Chi tiết nhóm chức vụ`}
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

export default PositionGroup;

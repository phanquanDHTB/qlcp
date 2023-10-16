import { Space, Button, Modal, Col, Row, Switch, Radio, message } from 'antd';
import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import title from '@columnTitles/distance_quota';
import formatNumber from '@utils/formatNumber';
import { deleteRecord } from '../../../../apis/distance-quota/distance-quota';
import { requestCatchHook } from '@utils/hook/handleError';
import Form from './form';

const DistanceQuota = () => {
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
          text: 'Trong tỉnh',
        },
        {
          value: 2,
          text: 'Ngoài tỉnh',
        },
      ],
    },
    {
      width: 200,
      dataIndex: 'name_of_from_province_id',
    },
    {
      width: 200,
      dataIndex: 'name_of_to_province_id',
    },
    {
      width: 200,
      dataIndex: 'name_of_from_district_id',
    },
    {
      width: 200,
      dataIndex: 'name_of_to_district_id',
    },
    // {
    //   width: 120,
    //   dataIndex: "from_distance",
    // },
    // {
    //   width: 120,
    //   dataIndex: "to_distance",
    // },
    {
      width: 200,
      dataIndex: 'distance',
      dataType: 'number',
    },
    {
      width: 200,
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
            message.success(`Xóa thành công khoảng cách ${record.code}`);
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
              Tỉnh đi:
            </Col>
            <Col span={24}>
              <span>{record.from_province ? record.from_province.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Quận/huyện đi:
            </Col>
            <Col span={24}>
              <span>{record.from_district ? record.from_district.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Tỉnh đến:
            </Col>
            <Col span={24}>
              <span>{record.to_province ? record.to_province.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Quận/huyện đến:
            </Col>
            <Col span={24}>
              <span>{record.to_district ? record.to_district.name : '--'}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col style={{ fontWeight: '600' }} span={24}>
              Khoảng cách:
            </Col>
            <Col span={24}>
              <span>{formatNumber(record.distance ? record.distance : '--')}</span>
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
                Loại :
              </Col>
              <Col span={24}>
                <Radio.Group disabled={true} value={record.type}>
                  <Radio value={1}>Trong tỉnh</Radio>
                  <Radio value={2}>Ngoài tỉnh</Radio>
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
        uriFetch="distance-quotas"
        columnTiles={title}
        columns={columns}
        onAddClick={() => {
          setIsOpenModal(true);
          setIdEdit(null);
        }}
        entity="distance-quotas"
        headerTitle={title.name}
        isAddButton
        isMultipleDelete
        isDeleteButton
        isImport={true}
        isExport={true}
      />
      <Modal
        destroyOnClose={true}
        open={isOpenModal}
        onCancel={() => {
          onCloseModal();
        }}
        title={`${idEdit ? 'Sửa' : 'Thêm'} khoảng cách`}
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
        title={`Chi tiết khoảng cách`}
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

export default DistanceQuota;

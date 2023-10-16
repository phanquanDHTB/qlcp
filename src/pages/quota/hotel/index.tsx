import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import { Button, Modal, Space, message } from 'antd';
import title from '@columnTitles/hotel_quota';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import { v4 } from 'uuid';
import { requestCatchHook } from '@utils/hook/handleError';
import FormModal from './form';
import { deleteRecord } from '../../../apis/hotel-quota/index';
import DetailModal from './detail';

const Hotel = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 210, 
      dataIndex: 'code',
      // isCodeIndex: true,  
      fixed: 'left',
      render: (value, recordValue) => (
        <Button type="link" onClick={() => openDetailModal(recordValue.id)}>
          {value}
        </Button>
      ),
    },
    {
      width: 170,
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
      width: 250,
      dataIndex: 'name_of_position_group_id',
    },
    {
      width: 250,
      dataIndex: 'name_of_service_id',
    },
    {
      width: 150,
      dataIndex: 'amount',
      dataType: 'currency',
    },
    {
      width: 200,
      dataIndex: 'amount_month',
      dataType: 'currency',
    },
    {
      width: 280,
      dataIndex: 'single_room_amount',
      dataType: 'currency',
    },
    {
      width: 200,
      dataIndex: 'name_of_country_id',
    },
    {
      width: 150,
      dataIndex: 'name_of_province_id',
    },
    {
      width: 200,
      dataIndex: 'name_of_district_id',
    },
    {
      width: 200,
      dataIndex: 'start_date',
      dataType: 'date',
    },
    {
      width: 200,
      dataIndex: 'end_date',
      dataType: 'date',
    },
    {
      width: 120, 
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
      render: (_, recordValue) => (
        <Space>
          <Button
            onClick={() => {
              setIdEdit(recordValue.id);
              setIsOpenFormModal(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Button onClick={() => showConfirmDelete(recordValue)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  const [idEdit, setIdEdit] = useState<null | number>(null);
  const [isOpenFormModal, setIsOpenFormModal] = useState(false);
  const [isOpenDetailModal, setIsOpenDetailModal] = useState(false);

  const onCloseModal = () => {
    setIdEdit(null);
    setIsOpenFormModal(false);
  };
  const onCloseDetailModal = () => {
    setIdEdit(null);
    setIsOpenDetailModal(false);
  };
  const formRef = useRef<{ submitForm: () => void }>();
  const formRefBasePage = useRef<{ reloadBasePage: () => void }>();

  const showConfirmDelete = (record) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa bản ghi ${record.code} ?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      async onOk() {
        deleteRecord(record.id)
          .then(() => {
            message.success(`Xóa thành công định mức ${record.code}`);
            formRefBasePage.current?.reloadBasePage();
          })
          .catch((error) => {
            requestCatchHook({ e: error });
          });
      },
      
    });
  };

  const openDetailModal = async (id: number) => {
    setIdEdit(id);
    setIsOpenDetailModal(true);
  };
  return (
    <>
      <BasePage
        uriFetch="hotel-quotas"
        columnTiles={title}
        columns={columns}
        isAddButton
        isDeleteButton
        isExport
        isImport
        entity="hotel-quotas"
        headerTitle={title.name}
        onAddClick={() => {
          setIsOpenFormModal(true);
          setIdEdit(null);
        }}
        ref={formRefBasePage}
      />
      <Modal
        title={`${idEdit ? 'Sửa' : 'Thêm'} định mức phòng nghỉ`}
        destroyOnClose={true}
        style={{
          top: 20,
          height: '60vh',
          maxWidth: '100vw',
        }}
        width={'60vw'}
        open={isOpenFormModal}
        onCancel={() => {
          onCloseModal();
        }}
        footer={[
          <Button onClick={onCloseModal} key={v4()}>
            Thoát
          </Button>,
          <Button
            onClick={async () => {
              await formRef.current?.submitForm();
            }}
            key={v4()}
            type={'primary'}
          >
            {'Lưu'}
          </Button>,
        ]}
      >
        <FormModal
          idEdit={idEdit}
          ref={formRef}
          funcReload={() => {
            setIsOpenFormModal(false);
            formRefBasePage.current?.reloadBasePage();
          }}
        ></FormModal>
      </Modal>
      <Modal
        title={`Chi tiết định mức phòng nghỉ`}
        destroyOnClose={true}
        style={{
          top: 20,
          height: '70vh',
          maxWidth: '100vw',
        }}
        width={'50vw'}
        open={isOpenDetailModal}
        onCancel={() => {
          onCloseDetailModal();
        }}
        onOk={() => onCloseDetailModal()}
        okButtonProps={{ hidden: true }}
        cancelText="Đóng"
      >
        <DetailModal idEdit={idEdit} ref={formRef}></DetailModal>
      </Modal>
    </>
  );
};

export default Hotel;

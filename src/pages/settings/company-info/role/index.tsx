import BasePage, { ColumnTypeCustom } from "@components/BasePage";
import { Space, Button, Modal, Col, Row, Switch, message } from "antd";
import title from "@columnTitles/role";
import { useRef, useState } from "react";
import { v4 } from "uuid";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import Form from "./form";
import { toast } from "react-toastify";
import getMessageError from "@utils/getMessageError";
import { call } from "@apis/baseRequest";
import { deleteRecord } from '@apis/role/role';
import { requestCatchHook } from '@utils/hook/handleError';
const RolePage = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [recordDetail, setRecordDetail] = useState({});
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [idEdit, setIdEdit] = useState<number | null>(null)
  const onCloseModal = () => {
    setIdEdit(null);
    setIsOpenModal(false);
  };

  const formRef = useRef<{ submitForm: () => void }>()

  const base = useRef<{ reloadBasePage: () => void }>();
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 150,
      dataIndex: "code",
      // isCodeIndex: true,
      fixed: "left",
      render: (value, record) => (
        <a onClick={() => openDetail(record)}>{value}</a>
      ),
    },
    {
      dataIndex: "name",
      fixed: "left",
      width: 200,
    },
    {
      dataIndex: "description",
      width: 200,
    },
    {
      width: 200,
      dataIndex: "is_active",
      dataType: "list",
      dataSource: [
        {
          value: true,
          text: "Hoạt động",
        },
        {
          value: false,
          text: "Ngừng hoạt động",
        },
      ],
    },
    {
      width: 120,
      dataIndex: "id",
      align: "center",
      render: (v,record) => (
        <Space>
          <Button onClick={() => {
            setIdEdit(v)
            setIsOpenModal(true)
          }}>
            <EditOutlined />
          </Button>
          <Button onClick={() => showConfirmDelete(record)}>
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];
  const reloadTable = () => {
    if (base.current) {
      base.current.reloadBasePage();
    }
  };

  const renderModalDetail = (record) => {
    if (Object.keys(record).length > 0) {
      return (
        <div className={"infor-wrap"}>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col style={{ fontWeight: "600" }} span={24}>
              Mã vai trò:
            </Col>
            <Col span={24}>
              <span>{record.code}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col style={{ fontWeight: "600" }} span={24}>
              Tên vai trò:
            </Col>
            <Col span={24}>
              <span>{record.name}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col style={{ fontWeight: "600" }} span={24}>
              Mô tả:
            </Col>
            <Col span={24}>
              <span>{record.description ? record.description : "--"}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col style={{ fontWeight: "600" }} span={24}>
              {" "}
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
  const showConfirmDelete = (record) => {
    Modal.confirm({
      title: `Bạn có chắc chắn muốn xóa bản ghi ${record.code} ?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      onOk() { 
        deleteRecord(record.id) 
          .then(() => {
            message.success(`Xóa thành công vai trò ${record.code}`);
            reloadTable();
          })
          .catch((error) => {
            requestCatchHook({ e: error });
          });
      },
      
    });
  };

  const openDetail = (record) => {
    setIsOpenDetail(true);
    setRecordDetail(record);
  };
  return (
    <>
      <BasePage
        ref={base}
        uriFetch="roles"
        columnTiles={title}
        columns={columns}
        isAddButton
        isDeleteButton
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
        title={`${idEdit ? "Sửa" : "Thêm"} vai trò`}
        footer={[
          <Button
            style={{ border: "unset", background: "#ffffff" }}
            onClick={() => onCloseModal()}
            key={v4()}
          >
            Thoát
          </Button>,
          <Button
            style={{
              background: "#ed1b2f",
              borderColor: "#ed1b2f",
              width: "120px",
              color: "#fff",
            }}
            onClick={() => {
              if (formRef.current) {
                formRef.current?.submitForm()
              }
            }}
            key={v4()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form idEdit={idEdit} ref={formRef} reloadTable={base.current?.reloadBasePage} closeForm={() => onCloseModal()} />
      </Modal>
      <Modal
        open={isOpenDetail}
        onCancel={() => {
          setIsOpenDetail(false);
        }}
        title={`Chi tiết vai trò`}
        footer={[
          <Button
            style={{ background: "#ffffff" }}
            onClick={() => setIsOpenDetail(false)}
            key={v4()}
          >
            Thoát
          </Button>,
        ]}
      >
        {renderModalDetail(recordDetail)}
      </Modal>
    </>
  );
};

export default RolePage;

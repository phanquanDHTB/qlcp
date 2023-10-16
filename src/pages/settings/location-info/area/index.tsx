import BasePage, { ColumnTypeCustom } from "@components/BasePage";
import { Space, Button, Modal, Col, Row, Switch, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import title from "@columnTitles/area";
import { useRef, useState } from "react";
import { v4 } from "uuid";
import Form from "./form";
import dayjs from "dayjs";
import { save, deleteRecord } from "@apis/area/area";

const Area = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 200,
      dataIndex: "code",
      // isCodeIndex: true,
      fixed: "left",
      render: (value, record) => (
        <a onClick={() => openDetail(record)}>{value}</a>
      ),
    },
    {
      width: 1000,
      dataIndex: "name",
    },
    {
      width: 120,
      dataIndex: "id",
      align: "center",
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
            message.success(`Xóa thành công khu vực ${record.code}`);
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
        <div className={"infor-wrap"}>
          <Row style={{ fontWeight: "bold", marginBottom: "12px" }}>Thông tin chi tiết</Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col span={12}>
              <Col style={{ fontWeight: "600" }} span={24}>
                Mã khu vực:
              </Col>
              <Col span={24}>
                <span>{record.code}</span>
              </Col>
            </Col>
            <Col span={12}>
              <Col style={{ fontWeight: "600" }} span={24}>
                Tên khu vực:
              </Col>
              <Col span={24}>
                <span>{record.name}</span>
              </Col>
            </Col>
          </Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col span={12}>
              <Col style={{ fontWeight: "600" }} span={24}>
                Mô tả:
              </Col>
              <Col span={24}>
                <span>{record.description ? record.description : "--"}</span>
              </Col>
            </Col>
            <Col span={12}>
              <Col style={{ fontWeight: "600" }} span={24}>
                {" "}
                Trạng thái:
              </Col>
              <Col span={24}>
                <Switch checked={record.is_active} disabled={true} />
              </Col>
            </Col>
          </Row>
          <Row style={{ fontWeight: "bold", marginBottom: "12px" }}>
            Thông tin bổ sung
          </Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col span={12}>
              <Col style={{ fontWeight: "600" }} span={24}>
                Người tạo:
              </Col>
              <Col span={24}>
                <span>{record.ins_id ? record.ins_id : '--'}</span>
              </Col>
            </Col>
            <Col span={12}>
              <Col style={{ fontWeight: "600" }} span={24}>
                Ngày tạo:
              </Col>
              <Col span={24}>
                <span>{record.ins_date ? dayjs(record.ins_date).format('DD/MM/YYYY') : '--'}</span>
              </Col>
            </Col>
          </Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col span={12}>
              <Col style={{ fontWeight: "600" }} span={24}>
                Người sửa:
              </Col>
              <Col span={24}>
                <span>{record.upd_id ? record.upd_id : '--'}</span>
              </Col>
            </Col>
            <Col span={12}>
              <Col style={{ fontWeight: "600" }} span={24}>
                Ngày sửa:
              </Col>
              <Col span={24}>
                <span>{record.upd_date ? dayjs(record.upd_date).format('DD/MM/YYYY') : '--'}</span>
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
        uriFetch="areas"
        columnTiles={title}
        columns={columns}
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
        title={`${idEdit ? "Sửa" : "Thêm"} khu vực`}
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
                saveForm(formRef.current);
              }
            }}
            key={v4()}
          >
            Lưu
          </Button>,
        ]}
      >
        <Form
          idEdit={idEdit}
          ref={formRef}
          reloadTable={() => reloadTable()}
          closeForm={() => onCloseModal()}
        />
      </Modal>
      <Modal
        open={isOpenDetail}
        onCancel={() => {
          setIsOpenDetail(false);
        }}
        title={`Chi tiết khu vực`}
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

export default Area;

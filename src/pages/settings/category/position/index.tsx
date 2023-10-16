import BasePage, { ColumnTypeCustom } from "@components/BasePage";
import { Button, Modal, Col, Row} from "antd";
import title from "@columnTitles/position";
import { useRef, useState } from "react";
import { v4 } from "uuid";


const Position = () => {
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
      dataIndex: "name",
      width: 450,
    },
    {
      dataIndex: "name_of_position_group_id",
      width: 450,
    }
  ];
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [recordDetail, setRecordDetail] = useState({});
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [idEdit, setIdEdit] = useState<null | number>(null);
  const formRef = useRef<{ submitForm: () => void }>();
  const onCloseModal = () => {
    setIdEdit(null);
    setIsOpenModal(false);
  };
  const saveForm = (ref) => {
    ref.submitForm();
  };
  const renderModalDetail = (record) => {
    if (Object.keys(record).length > 0) {
      return (
        <div className={"infor-wrap"}>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col style={{ fontWeight: "600" }} span={24}>
              Mã chức vụ:
            </Col>
            <Col span={24}>
              <span>{record.code}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col style={{ fontWeight: "600" }} span={24}>
              Tên chức vụ:
            </Col>
            <Col span={24}>
              <span>{record.name}</span>
            </Col>
          </Row>
          <Row style={{ marginBottom: "12px" }} gutter={[0, 8]}>
            <Col style={{ fontWeight: "600" }} span={24}>
              Nhóm chức vụ:
            </Col>
            <Col span={24}>
              <span>{record.position_group.name}</span>
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
        uriFetch="positions"
        columnTiles={title}
        columns={columns}
        onAddClick={() => {
          setIsOpenModal(true);
          setIdEdit(null);
        }}
        headerTitle={title.name}
        hiddenGroupAction={true}
        hiddenRowSelection={true}
      />
      <Modal
        open={isOpenDetail}
        onCancel={() => {
          onCloseModal();
        }}
        title={`Chi tiết chức vụ`}
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

export default Position;

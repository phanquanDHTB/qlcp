import { Button, Modal, Space, message } from "antd";
import BasePage, { ColumnTypeCustom } from "@components/BasePage";
import airTicketTitle from "@columnTitles/air-ticket";
import { EditOutlined } from "@ant-design/icons";
import { useState } from "react";
import OrderTicketModal from "../book/modal/order-ticket-modal";

export const enum planStatus {
  init = 1, // Khởi tạo
  approve_wait = 2, // Chờ phê duyệt
  approve_done = 3, // Đã phê duyệt
  approve_refuse = 4, // Từ chối phê duyệt
  waiting_confirm_result_work = 5, // Chờ phê duyệt xác nhận công tác
  confirm_result_work = 6, // Xác nhận công tác
  waiting_approve_end_work = 7, // Chờ phê duyệt kết thúc công tác
  approve_end_work = 8, // Kết thúc công tác
  refuse_end_work = 9, // Từ chối kết thúc công tác
  destroy = 10, // Hủy
}

const AirTicketPage = () => {
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 150,
      dataIndex: "code",
      // isCodeIndex: true,
      fixed: "left",
      render: (value, recordValue) => (
        <Button type="link" onClick={() => showOrderTicketModal(recordValue)}>
          {value}
        </Button>
      ),
    },
    {
      width: 250,
      dataIndex: "name",
    },
    {
      width: 200,
      dataIndex: "status",
      dataType: "list",
      dataSource: [
        {
          value: 1,
          text: "Khởi tạo",
        },
        {
          value: 2,
          text: "Chờ phê duyệt",
        },
        {
          value: 3,
          text: "Đã phê duyệt",
        },
        {
          value: 4,
          text: "Từ chối phê duyệt",
        },
        {
          value: 5,
          text: "Chờ xác nhận kết quả công tác",
        },
        {
          value: 6,
          text: "Xác nhận kết quả công tác",
        },
        {
          value: 7,
          text: "Chờ phê duyệt kết thúc công tác",
        },
        {
          value: 8,
          text: "Kết thúc công tác",
        },
        {
          value: 9,
          text: "Từ chối kết thúc công tác",
        },
        {
          value: 10,
          text: "Hủy",
        },
      ],
    },
    {
      width: 250,
      dataIndex: "start_time",
      // nameOfRender: "fullName",
      dataType: "date",
    },
    {
      width: 250,
      dataIndex: "end_time",
      dataType: "date",
    },
    {
      width: 150,
      dataIndex: "total_air_ticket",
    },
    // {
    //   width: 120,
    //   dataIndex: "id",
    //   align: "center",
    //   render: () => (
    //     <Space>
    //       <Button>
    //         <EditOutlined />
    //       </Button>
    //     </Space>
    //   ),
    // },
  ];
  const [isOrderTicketModal, setIsOrderTicketModalOpen] = useState(false);
  const [planSelect, setPlanSelect] = useState({});
  const [wrapClassName, setWrapClassName] = useState("full-form");
  const showOrderTicketModal = (record: any) => {
    if (
      [
        planStatus.init,
        planStatus.approve_wait,
        planStatus.approve_refuse,
      ].includes(record?.status)
    ) {
      message.error("Kế hoạch chưa được phê duyệt, không được đặt vé");
      return;
    }
    setPlanSelect(record);
    setIsOrderTicketModalOpen(true);
  };
  const handleOk = () => {
    setIsOrderTicketModalOpen(false);
  };

  const handleCancel = () => {
    setIsOrderTicketModalOpen(false);
  };

  return (
    <>
      <BasePage
        uriFetch="plans/air-tickets"
        columnTiles={airTicketTitle}
        columns={columns}
        headerTitle={"Quản lý vé máy bay"}
        hiddenGroupAction
        isDeleteButton
        hiddenRowSelection
        fetchParams={{ isAirTicket: true }}
      ></BasePage>
      <div className="modal_full_form">
        <Modal
          destroyOnClose={true}
          title="Đặt vé máy bay"
          open={isOrderTicketModal}
          onOk={handleOk}
          onCancel={handleCancel}
          cancelButtonProps={{
            hidden: true,
          }}
          okText="Đóng"
          cancelText="Đóng"
          bodyStyle={{
            height: "calc(100vh - 120px)",
            overflowY: "scroll",
          }}
          style={{
            top: 0,
            height: "100vh",
            maxWidth: "100vw",
          }}
          width={"100vw"}
        >
          <OrderTicketModal
            plan={planSelect}
            // bodyStyle={{ height: "calc(100vh - 120px)", overflowY: "scroll" }}
          ></OrderTicketModal>
        </Modal>
      </div>
    </>
  );
};

export default AirTicketPage;

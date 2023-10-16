const Plan = [
  {
    width: 150,
    dataIndex: "code",
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 300,
    dataIndex: "name",
  },
  {
    width: 200,
    dataIndex: "status",
    dataType: "list",
    dataSource: [
      {
        value: 1,
        text: 'Khởi tạo',
      },
      {
        value: 2,
        text: 'Chờ phê duyệt',
      },
      {
        value: 3,
        text: 'Đã phê duyệt',
      },
      {
        value: 4,
        text: 'Từ chối phê duyệt',
      },
      {
        value: 5,
        text: 'Chờ xác nhận kết quả công tác',
      },
      {
        value: 6,
        text: 'Xác nhận kết quả công tác',
      },
      {
        value: 7,
        text: 'Chờ phê duyệt kết thúc công tác',
      },
      {
        value: 8,
        text: 'Kết thúc công tác',
      },
      {
        value: 9,
        text: 'Từ chối kết thúc công tác',
      },
      {
        value: 10,
        text: 'Hủy',
      },
    ],
  },
  {
    width: 180,
    dataIndex: "start_time",
    dataType: "date",
  },
  {
    width: 180,
    dataIndex: "end_time",
    dataType: "date",
  },
  {
    width: 180,
    dataIndex: "is_add",
    dataType: "list",
    dataSource: [
      {
        value: true,
        text: "Kế hoạch bổ sung",
      },
      {
        value: false,
        text: "Kế hoạch gốc",
      },
    ],
  },
  {
    width: 300,
    dataIndex: "name_of_parent_id",
  },
  {
    width: 200,
    dataIndex: "name_of_purpose_id",
  },
  {
    width: 200,
    dataIndex: "type",
    dataType: "list",
    dataSource: [
      {
        value: 1,
        text: 'Nội địa',
      },
      {
        value: 2,
        text: 'Nước ngoài',
      },
    ],
  },
  {
    width: 250,
    dataIndex: "name_of_department_require_id",
  },
  {
    width: 200,
    dataIndex: "name_of_user_require_id",
  },
  {
    width: 250,
    dataIndex: "name_of_department_process_id",
  },
  {
    width: 200,
    dataIndex: "name_of_user_process_id",
  },
  
];
export default Plan;

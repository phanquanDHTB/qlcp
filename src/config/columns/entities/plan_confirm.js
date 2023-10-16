import i18n from "@/lang";
const { t } = i18n.global;
const planConfirm = [
  {
    width: 200,
    dataIndex: "code",
    fixed: "left",
  },
  {
    width: 200,
    dataIndex: "status",
    dataType: "list",
    dataSource: [
      {
        value: 1,
        text: t("planConfirm.status.1"),
      },
      {
        value: 2,
        text: t("planConfirm.status.2"),
      },
      {
        value: 3,
        text: t("planConfirm.status.3"),
      },
    ],
  },
  {
    width: 250,
    dataIndex: "name_of_department_require_id",
  },
  {
    width: 220,
    dataIndex: "name_of_user_require_id",
  },
  {
    width: 300,
    dataIndex: "name_of_plan_route_id",
  },
  {
    width: 200,
    dataIndex: "start_time",
    dataType: "date",
  },
  {
    width: 200,
    dataIndex: "end_time",
    dataType: "date",
  },
];
export default planConfirm;

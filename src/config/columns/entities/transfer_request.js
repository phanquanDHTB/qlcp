import i18n from "@/lang";
const { t } = i18n.global;
const Plan = [
  {
    width: 200,
    dataIndex: "code",
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 200,
    dataIndex: "name",
  },
  {
    width: 200,
    dataIndex: "status",
    dataType: "list",
    dataSource: [
      {
        value: 1,
        text: t("plan.status.1"),
      },
      {
        value: 2,
        text: t("plan.status.2"),
      },
      {
        value: 3,
        text: t("plan.status.3"),
      },
      {
        value: 4,
        text: t("plan.status.4"),
      },
    ],
  },
  {
    width: 200,
    dataIndex: "start_time",
    dataType: "date",
  },
  {
    width: 300,
    dataIndex: "end_time",
    dataType: "date",
  },
];
export default Plan;

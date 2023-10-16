import i18n from "@/lang";
const { t } = i18n.global;
const PlanRoute = [
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
    dataType:'list',
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
  // {
  //   width: 200,
  //   dataIndex: "user_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "project_type",
  // },
  // {
  //   width: 200,
  //   dataIndex: "contact_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "amount",
  // },
  {
    width: 200,
    dataIndex: "start_time",
  },
  {
    width: 200,
    dataIndex: "end_time",
  },
  // {
  //   width: 200,
  //   dataIndex: "start_country_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "start_province_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "start_district_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "end_country_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "end_province_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "end_district_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "quantity",
  // },
  // {
  //   width: 200,
  //   dataIndex: "description",
  // },
  // {
  //   width: 200,
  //   dataIndex: "approved_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "approved_note",
  // },

];
export default PlanRoute;
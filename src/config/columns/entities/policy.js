import i18n from "@/lang";
const { t } = i18n.global;

const PolicyLimit = [
  {
    width: 200,
    dataIndex: "code",
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 250,
    dataIndex: "name",
  },
  {
    width: 250,
    dataIndex: "publish_time",
    dataType: "date",
  },
  {
    width: 250,
    dataIndex: "expire_time",
    dataType: "date",
  },
  {
    width: 250,
    dataIndex: "sort_order",
    dataType: "number",
  },
  {
    width: 250,
    dataIndex: "description",
  },
  {
    width: 250,
    dataIndex: "is_active",
    dataType: "bool",
    dataSource: [
      {
        value: true,
        text: t("common.active"),
      },
      {
        value: false,
        text: t("common.inactive"),
      },
    ],
  },
];
export default PolicyLimit;

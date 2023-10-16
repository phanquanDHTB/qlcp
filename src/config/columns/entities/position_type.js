import i18n from "@/lang";
const { t } = i18n.global;

const PositionType = [
  {
    dataIndex: "code",
    width: 200,
    isCodeIndex: true,
    fixed: "left",
  },
  {
    dataIndex: "name",
    width: 300,
  },
  {
    width: 200,
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
export default PositionType;

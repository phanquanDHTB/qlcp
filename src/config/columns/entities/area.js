import i18n from "@/lang";
const { t } = i18n.global;

const Area = [
  {
    width: 200,
    dataIndex: "code",
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 450,
    dataIndex: "name",
  },
  {
    width: 450,
    dataIndex: "description",
  },
  {
    width: 450,
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
export default Area;

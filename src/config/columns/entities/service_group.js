import i18n from "@/lang";
const { t } = i18n.global;

const Service = [
  {
    dataIndex: "code",
    width: 200,
    isCodeIndex: true,
    fixed: "left",
  },
  {
    dataIndex: "name",
    width: 650,
  },
  {
    width: 650,
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
export default Service;

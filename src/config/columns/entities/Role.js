import i18n from "@/lang";
const { t } = i18n.global;
const Role = [
  {
    dataIndex: "code",
    fixed: "left",
    width: 200,
    isCodeIndex: true,
    fixed: "left",
  },
  {
    dataIndex: "name",
    fixed: "left",
    width: 450,
  },
  {
    dataIndex: "description",
    width: 450,
  },
  {
    width: 450,
    dataIndex: "is_active",
    dataType: "bool",
    dataSource: [
      {
        value: 1,
        text: t("common.active"),
      },
      {
        value: 0,
        text: t("common.inactive"),
      },
    ],
  },
];
export default Role;

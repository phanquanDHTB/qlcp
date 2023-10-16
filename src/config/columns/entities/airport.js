import i18n from "@/lang";
const { t } = i18n.global;

const Airport = [
  {
    width: 200,
    dataIndex: "code",
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 350,
    dataIndex: "name",
  },
  {
    width: 350,
    dataIndex: "name_of_country_id",
  },
  {
    width: 350,
    dataIndex: "name_of_province_id",
  },
  {
    width: 350,
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
export default Airport;

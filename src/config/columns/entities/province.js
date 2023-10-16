import i18n from "@/lang";
const { t } = i18n.global;

const Province = [
  {
    width: 200,
    dataIndex: "code",
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 650,
    dataIndex: "name",
  },
  {
    width: 650,
    dataIndex: "name_of_country_id",
  },
  // {
  //   width: 200,
  //   dataIndex: "name_of_area_id",
  // },
  // {
  //   width: 200,
  //   dataIndex: "is_active",
  //   dataType: "bool",
  //   dataSource: [
  //     {
  //       value: true,
  //       text: t("common.active"),
  //     },
  //     {
  //       value: false,
  //       text: t("common.inactive"),
  //     },
  //   ],
  // },
  // {
  //   width: 200,
  //   dataIndex: "type",
  //   dataType: "bool",
  //   dataSource: [
  //     {
  //       value: 1,
  //       text: t("common.is_city"),
  //     },
  //     {
  //       value: 2,
  //       text: t("common.is_province"),
  //     },
  //   ],
  // },

  // {
  //   width: 200,
  //   dataIndex: "is_city",
  //   dataType: "bool",
  //   dataSource: [
  //     {
  //       value: true,
  //       text: t("common.is_city"),
  //     },
  //     {
  //       value: false,
  //       text: t("common.is_province"),
  //     },
  //   ],
  // },
];
export default Province;

import i18n from "@/lang";
const { t } = i18n.global;

const District = [
  {
    width: 200,
    dataIndex: "code",
    fixed: "left",
    isCodeIndex: true,
  },
  {
    width: 450,
    dataIndex: "name",
  },
  {
    width: 450,
    dataIndex: "name_of_province_id",
  },
  {
    width: 450,
    dataIndex: "name_of_country_id",
  },
  // {
  //   width: 450,
  //   dataIndex: "type",
  //   dataType: "bool",
  //   dataSource: [
  //     {
  //       value: 1,
  //       text: t("common.district"),
  //     },
  //     {
  //       value: 2,
  //       text: t("common.district1"),
  //     },
  //     {
  //       value: 3,
  //       text: t("common.is_city"),
  //     },
  //     {
  //       value: 4,
  //       text: t("common.town"),
  //     },
  //   ],
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
];
export default District;

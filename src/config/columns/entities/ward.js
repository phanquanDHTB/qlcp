import i18n from "@/lang";

const { t } = i18n.global;

const Ward = [
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
    dataIndex: "name_of_district_id",
  },
  {
    width: 350,
    dataIndex: "name_of_province_id",
  },
  {
    width: 350,
    dataIndex: "name_of_country_id",
  },
  // {
  //   width: 100,
  //   dataIndex: "location",
  // },
  // {
  //   width: 100,
  //   dataIndex: "type",
  //   dataType: "bool",
  //   dataSource: [
  //     {
  //       value: 1,
  //       text: t("common.village"),
  //     },
  //     {
  //       value: 2,
  //       text: t("common.sub_district"),
  //     },
  //     {
  //       value: 3,
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
export default Ward;

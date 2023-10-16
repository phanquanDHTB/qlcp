import i18n from "@/lang";
const { t } = i18n.global;

const Country = [
  {
    width: 500,
    dataIndex: "code",
    // isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 1000,
    dataIndex: "name",
  },
  // {
  //   width: 300,
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
export default Country;

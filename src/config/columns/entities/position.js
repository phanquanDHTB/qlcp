import i18n from "@/lang";
const { t } = i18n.global;

const Position = [
  {
    dataIndex: "code",
    width: 200,
    isCodeIndex: true,
    fixed: "left",
  },
  {
    dataIndex: "name",
    width: 1300,
  },
  // {
  //   dataIndex: "name_of_position_group_id",
  //   width: 300,
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
export default Position;

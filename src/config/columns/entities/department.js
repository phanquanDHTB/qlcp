import i18n from "@/lang";
const { t } = i18n.global;

const Department = [
  {
    width: 200,
    dataIndex: "code",
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 250,
    dataIndex: "name",
  },
  {
    width: 250,
    dataIndex: "branch",
  },
  // {
  //   width: 250,
  //   dataIndex: "address",
  // },
  // {
  //   width: 250,
  //   dataIndex: "phone",
  //   dataType: "phone",
  // },
  // {
  //   width: 250,
  //   dataIndex: "parent_id",
  // },
  // {
  //   width: 250,
  //   dataIndex: "partner_department_id",
  // },
  {
    width: 250,
    dataIndex: "name_of_country_id",
  },
  {
    width: 250,
    dataIndex: "name_of_province_id",
  },
  {
    width: 250,
    dataIndex: "name_of_district_id",
  },
  {
    width: 250,
    dataIndex: "name_of_ward_id",
  },

  // {
  //   width: 250,
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
  //   width: 250,
  //   dataIndex: "description",
  // },
];
export default Department;

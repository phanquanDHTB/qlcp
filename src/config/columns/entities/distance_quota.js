import i18n from "@/lang";
const { t } = i18n.global;

const DistanceQuota = [
  {
    width: 200,
    dataIndex: "code",
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 200,
    dataIndex: "type",
    dataType: "list",
    dataSource: [
      {
        value: 1,
        text: t("distanceQuota.type.1"),
      },
      {
        value: 2,
        text: t("distanceQuota.type.2"),
      },
    ],
  },
  {
    width: 200,
    dataIndex: "name_of_from_province_id",
  },
  {
    width: 200,
    dataIndex: "name_of_to_province_id",
  },
  {
    width: 200,
    dataIndex: "name_of_from_district_id",
  },
  {
    width: 200,
    dataIndex: "name_of_to_district_id",
  },
  // {
  //   width: 120,
  //   dataIndex: "from_distance",
  // },
  // {
  //   width: 120,
  //   dataIndex: "to_distance",
  // },
  {
    width: 200,
    dataIndex: "distance",
    dataType: 'number'
  },
  {
    width: 200,
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
export default DistanceQuota;

import i18n from "@/lang";
const { t } = i18n.global;

const HotelQuota = [
  {
    dataIndex: "code",
    width: 250,
    isCodeIndex: true,
    fixed: "left",
  },
  {
    width: 300,
    dataIndex: "type",
    dataType: "bool",
    dataSource: [
      {
        value: 1,
        text: t("hotelQuota.type.1"),
      },
      {
        value: 2,
        text: t("hotelQuota.type.2"),
      },
    ],
  },
  {
    width: 300,
    dataIndex: "name_of_position_group_id",
  },
  // {
  //   width: 200,
  //   dataIndex: "name_of_service_group_id",
  // },
  {
    width: 300,
    dataIndex: "name_of_service_id",
  },

  // {
  //   width: 120,
  //   dataIndex: "amount",
  // },
  // {
  //   width: 120,
  //   dataIndex: "amount",
  // },
  {
    width: 300,
    dataIndex: "amount",
  },
  {
    width: 300,
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
export default HotelQuota;

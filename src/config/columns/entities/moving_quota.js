import i18n from "@/lang";
const { t } = i18n.global;

const LivingQuota = [
  {
    dataIndex: "code",
    width: 200,
    isCodeIndex: true,
    fixed: "left",
  },
  // {
  //   dataIndex: "name",
  //   width: 200,
  // },
  {
    width: 300,
    dataIndex: "type",
    dataType: "bool",
    dataSource: [
      {
        value: 1,
        text: t("livingQuota.type.1"),
      },
      {
        value: 2,
        text: t("livingQuota.type.2"),
      },
    ],
  },
  {
    width: 300,
    dataIndex: "name_of_country_id",
  },
  {
    width: 300,
    dataIndex: "amount",
  },
  {
    width: 300,
    dataIndex: "from_distance",
  },
  {
    width: 300,
    dataIndex: "to_distance",
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
  //   {
  //     width: 120,
  //     dataIndex: "name_of_service_group_id",
  //   },
  //   {
  //     width: 120,
  //     dataIndex: "name_of_service_id",
  //   },
  //
  //
  //   {
  //     width: 200,
  //     dataIndex: "description",
  //   },
  //   {
  //     width: 150,
  //     dataIndex: "is_active",
  //     dataType: "bool",
  //     dataSource: [
  //       {
  //         value: true,
  //         text: t("common.active"),
  //       },
  //       {
  //         value: false,
  //         text: t("common.inactive"),
  //       },
  //     ],
  //   },
];
export default LivingQuota;

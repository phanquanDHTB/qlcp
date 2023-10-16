import BasePage, { ColumnTypeCustom } from "@components/BasePage"
import { Space } from "antd"
import title from '@columnTitles/hotel'

const Hotel = () => {
    const columns: ColumnTypeCustom<any>[] = [
        // {
        //     width: 200,
        //     dataIndex: "code",
        //     // isCodeIndex: true,
        //     fixed: "left",
        // },
        {
            width: 160,
            dataIndex: "name",
        },
        {
            width: 120,
            dataIndex: "name_of_country_id",
        },
        {
            width: 120,
            dataIndex: "name_of_province_id",
        },
        {
            width: 120,
            dataIndex: "name_of_district_id",
        },
        {
            width: 120,
            dataIndex: "name_of_ward_id",
        },
        {
            width: 120,
            dataIndex: "id",
            align: 'center',
            render: () =>
                <Space>
                    {/* <Button>
						<EditOutlined />
					</Button> */}
                </Space>,
        }
    ]
    return (
        <>
            <BasePage
                uriFetch="airports"
                columnTiles={title}
                columns={columns}
                isAddButton
                headerTitle={title.name}
            />
        </>
    )
}

export default Hotel
import BasePage, { ColumnTypeCustom } from "@components/BasePage"
import { Space } from "antd" 
import title from '@columnTitles/policy'

const Policy = () => {
    const columns: ColumnTypeCustom<any>[] = [
        {
            width: 200,
            dataIndex: "code",
            // isCodeIndex: true,
            fixed: "left",
        },
        {
            width: 250,
            dataIndex: "name",
        },
        {
            width: 250,
            dataIndex: "publish_time",
            dataType: "date",
        },
        {
            width: 250,
            dataIndex: "expire_time",
            dataType: "date",
        },
        {
            width: 250,
            dataIndex: "sort_order",
            dataType: "number",
        },
        {
            width: 250,
            dataIndex: "description",
        },
        {
            width: 250,
            dataIndex: "is_active",
            dataType: "bool",
            dataSource: [
                {
                    value: true,
                    text: "Hoạt động",
                },
                {
                    value: false,
                    text: "Ngừng hoạt động",
                },
            ],
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
                uriFetch="policies"
                columnTiles={title}
                columns={columns}
                isAddButton
                headerTitle={title.name}
            />
        </>
    )
}

export default Policy
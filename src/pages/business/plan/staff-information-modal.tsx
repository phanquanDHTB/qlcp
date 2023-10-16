import { useEffect, useState } from 'react';
import type { CollapseProps } from 'antd';
import { Collapse, Spin, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { IStaff, IStaffContent } from 'type/advance-request-sign-details';
import TableData from '@components/TableData';
import { getStaffApi } from '../../../apis/page/business/plan/plan-details-modal';

const { Text } = Typography;

const columnsStaff: ColumnsType = [
  {
    title: 'STT',
    key: 'STT',
    render: (_, __, rowIndex) => rowIndex + 1,
  },
  {
    title: 'Đơn vị',
    dataIndex: 'department',
    key: 'department',
    render: (value) => {
      return <div> {value?.name} </div>;
    },
  },
  {
    title: 'Mã nhân viên',
    dataIndex: 'code',
    key: 'address',
  },
  {
    title: 'Họ tên',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Chức danh',
    dataIndex: 'user',
    key: 'user',
    render: (value) => {
      return <div> {value?.position.name} </div>;
    },
  },
  {
    title: 'Giới tính',
    dataIndex: 'gender',
    key: 'age',
    render: (value) => genderLabel(value),
  },
  {
    title: 'Ngân hàng',
    dataIndex: 'bank',
    key: 'bank',
    render: (value) => {
      return <div style={value ? {} : { textAlign: 'center' }}>{value ? value : '--'}</div>;
    },
  },
  {
    title: 'Tài khoản',
    dataIndex: 'user',
    key: 'age',
    render: (value) => {
      return (
        <div style={value.bank_account_number ? {} : { textAlign: 'center' }}>
          {value.bank_account_number ? value?.bank_account_number : '--'}
        </div>
      );
    },
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'user',
    key: 'user',
    render: (value) => {
      return <a href={`tel:${value.phone_number}`}> {value.phone_number ? value?.phone_number : ''} </a>;
    },
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    render: (value) => {
      return <a href={`mailto:${value}`}> {value ? value : ''} </a>;
    },
  },
];

const genderLabel = (gender: string) => {
  switch (gender) {
    case 'M':
      return 'Nam';
    case 'G':
      return 'Nữ';
    case 'O':
      return 'Chưa rõ';
    default:
      return gender;
  }
};

const columnsPartner: ColumnsType = [
  {
    title: 'STT',
    key: 'STT',
    width: 50,
    render: (_, __, rowIndex) => rowIndex + 1,
  },
  {
    title: 'Họ tên',
    dataIndex: 'name',
    key: 'age',
  },
  {
    title: 'Cơ quan đơn vị',
    dataIndex: 'department_name',
    key: 'department_name',
  },
  {
    title: 'Nhóm chức vụ',
    dataIndex: 'position_group',
    key: 'name',
    render: (text) => text?.name,
  },
  {
    title: 'Số điện thoại',
    dataIndex: 'phone_number',
    key: 'phone_number',
    width: 180,
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 400,
  },
];

interface IProps {
  idDetails: number | null;
}

const StaffInformationModal = (props: IProps) => {
  const { idDetails } = props;

  const [tableStaffData, setTableStaffData] = useState<IStaff[]>([]);
  const [tablePartnerData, setTablePartnerData] = useState<IStaff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const label1 = <Text strong>Danh sách cán bộ đi công tác</Text>;
  const label2 = <Text strong>Danh sách đối tác</Text>;

  const items: CollapseProps['items'] = [
    {
      key: '1',
      label: label1,
      children: isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <TableData
          tableProps={{
            scroll: { x: 1500 },
            columns: columnsStaff,
            dataSource: tableStaffData ? tableStaffData : [],
            rowKey: 'id',
          }}
        />
      ),
    },
    {
      key: '2',
      label: label2,
      children: isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <TableData
          tableProps={{
            scroll: { x: 1500 },
            columns: columnsPartner,
            dataSource: tablePartnerData ? tablePartnerData : [],
            rowKey: 'id',
          }}
        />
      ),
    },
  ];

  const getStaff = async () => {
    try {
      const res = (await getStaffApi(idDetails)) as IStaffContent;
      setTableStaffData(res.content.filter((item) => item.type === 1));
      setTablePartnerData(res.content.filter((item) => item.type === 2));
      setIsLoading(false);
    } catch (error) {
      alert(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (idDetails) {
      getStaff();
    }
  }, [idDetails]);

  return (
    <div style={{ marginTop: '20px' }}>
      <Collapse defaultActiveKey={['1', '2']}>
        <Collapse.Panel header={label1} key="1">
          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: '10vh' }}>
              <Spin size="large" />
            </div>
          ) : (
            <TableData
              tableProps={{
                scroll: { x: 1500 },
                columns: columnsStaff,
                dataSource: tableStaffData ? tableStaffData : [],
                rowKey: 'id',
              }}
            />
          )}
        </Collapse.Panel>
        <Collapse.Panel header={label2} key="2">
          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: '10vh' }}>
              <Spin size="large" />
            </div>
          ) : (
            <TableData
              tableProps={{
                scroll: { x: 1500 },
                columns: columnsPartner,
                dataSource: tablePartnerData ? tablePartnerData : [],
                rowKey: 'id',
              }}
            />
          )}
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

export default StaffInformationModal;

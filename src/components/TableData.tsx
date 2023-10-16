import { Empty, Table } from 'antd';
import { CSSProperties, ReactNode, PropsWithChildren } from 'react';
import type { TableProps } from 'antd/es/table';
import './styles.scss';

type TableDataProps = PropsWithChildren<{
  footerComponent?: ReactNode;
  styleFooter?: CSSProperties;
  tableProps?: TableProps<any>;
}>;

const TableData = ({ footerComponent, styleFooter, children, tableProps }: TableDataProps) => {
  return (
    <div className={'wrap-table-data'}>
      <Table
        pagination={false}
        {...tableProps}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} /> }}
      >
        {children}
      </Table>
      {footerComponent && (
        <div className={'wrap-table-data__footer'} style={styleFooter}>
          {footerComponent}
        </div>
      )}
    </div>
  );
};

export default TableData;

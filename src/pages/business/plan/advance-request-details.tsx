import { Col, Collapse, Row, Spin, Typography } from 'antd';
import { ColumnsType } from 'antd/es/table';

import { useEffect, useState } from 'react';
import formatNumber from '@utils/formatNumber';
import { formatDate } from '@utils/formatDate';
import { IDepartment, IplanRequired, IplanRequiredUser } from 'type';
import { IPlanRequiredContent } from 'type/advance-request-sign-details';
import TableData from '@components/TableData';
import { getCostRequestApi, getPlanRequiredApi } from '../../../apis/page/business/plan/plan-details-modal';
import { handleGetUserInfo } from '../../../apis/page/business/plan/advance-request-sign-details';
import { AlignType } from "rc-table/lib/interface";

const { Text } = Typography;

interface Props {
  idDetails: number | null;
}

interface ColumnConfig {
  title: string;
  dataIndex: string;
  key: string;
  render?: (value: any) => JSX.Element;
}

export const AdvanceRequest = (props: Props) => {
  const { idDetails } = props;

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<IplanRequired>();
  const [userlist, setUserList] = useState<IplanRequiredUser>();
  const [departmentProcess, seDepartmentProcess] = useState<IDepartment>();
  const [maxAmount, setMaxAmount] = useState<number>();
  const [user, setUser] = useState<any>();

  const label1 = <Text strong>Thông tin chung</Text>;
  const label2 = <Text strong>Thông tin chuyển khoản tạm ứng</Text>;

  const typeLabel = (type) => {
    switch (type) {
      case 1:
        return 'Nội địa';
      case 2:
        return 'Nước ngoài';
      default:
        return type;
    }
  };

  useEffect(() => {
    getUserInfo();
  }, []);
  const getUserInfo = async () => {
    const res = (await handleGetUserInfo()) as any;
    if (res.status == 'success') {
      setUser(res.data);
    }
  };

  const statusLabel = (status: number) => {
    switch (status) {
      case 0:
        return 'Chờ phê duyệt';
      case 1:
        return 'Đã phê duyệt';
      case 2:
        return 'Tạo bảng tổng hợp chuyển khoản';
      case 3:
        return 'Chờ duyệt bảng tổng hợp chuyển khoản';
      case 4:
        return 'Đã phê duyệt bảng tổng hợp chuyển khoản';
      case 5:
        return 'Từ chối bảng tổng hợp chuyển khoản';
      case 6:
        return 'Kế toán ngân hàng từ chối';
      case 7:
        return 'Đã hoàn thành chi';
      case 8:
        return 'Chuyển khoản lỗi';
      default:
        return status;
    }
  };

  const column: ColumnsType<ColumnConfig> = [
    {
      title: 'Mã nhân viên',
      dataIndex: 'code',
      key: 'code',
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'age',
    },
    {
      title: 'Email',
      dataIndex: 'plan_user_id',
      key: 'department_name',
      render: (value) => {
        return <a href={`mailto: ${value?.email}`}>{value?.email}</a>;
      },
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'plan_user_id',
      key: 'name',
      render: (value) => {
        return <a href={`tel:${value?.phone_number}`}>{value?.phone_number}</a>;
      },
    },
    {
      title: 'Số TK',
      dataIndex: 'plan_user_id',
      key: 'phone_number',
      render: (value) => {
        return value?.account_number;
      },
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'plan_user_id',
      key: 'email',
      render: (value) => {
        return value?.bank;
      },
    },
    {
      title: 'Tổng số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right' as AlignType,
      render: (value) => {
        return value != null ? formatNumber(value) + ' VNĐ' : 0 + ' VNĐ';
      },
    },
  ];

  const callBackGetPlanRequired = async () => {
    try {
      const res = (await getPlanRequiredApi(idDetails)) as IPlanRequiredContent;
      setData(res.content[0]);
      setUserList(res.content[0]?.plan_required_user);
      seDepartmentProcess(res.content[0]?.plan?.department_process);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const callBackGetCost = async () => {
    try {
      const res = (await getCostRequestApi(idDetails)) as any;
      setMaxAmount(res.reduce((accumulator, currentValue) => accumulator + currentValue.total_amount, 0));
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (idDetails) {
      callBackGetCost();
      callBackGetPlanRequired();
    }
  }, [idDetails]);

  return (
    <div>
      <Collapse defaultActiveKey={['1', '2']}>
        <Collapse.Panel header={label1} key="1">
          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: '10vh' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              <Row>
                <Col span={12}>
                  <Row>
                    <Col span={8} className="advance-col">
                      <b>Người đề nghị:</b>
                    </Col>
                    <Col span={16} className="advance-col">
                      <p>{user ? user.full_name : '--'}</p>
                    </Col>
                  </Row>
                  <Row align="middle">
                    <Col span={8} className="advance-col">
                      <b>Tên đề nghị:</b>
                    </Col>
                    <Col span={15} className="advance-col">
                      <p>{data?.name || '--'}</p>
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <Row>
                    <Col span={8} className="advance-col">
                      <b>Trạng thái đề nghị tạm ứng:</b>
                    </Col>
                    <Col span={16} className="advance-col">
                      <p>{data?.status ? statusLabel(data?.status) : statusLabel(0)}</p>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8} className="advance-col">
                      <b>Lý do KTNH từ chối:</b>
                    </Col>
                    <Col span={16} className="advance-col">
                      <p>{data?.reason || '--'}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={4} className="advance-col">
                  <b>Đơn vị đề nghị:</b>
                </Col>
                <Col span={20} className="advance-col">
                  <p>{departmentProcess?.name || '--'}</p>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Row>
                    <Col span={8} className="advance-col">
                      <b>Căn cứ kế hoạch số:</b>
                    </Col>
                    <Col span={16} className="advance-col">
                      <p>{data?.code || '--'}</p>
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <Row>
                    <Col span={8} className="advance-col">
                      <b>Ngày:</b>
                    </Col>
                    <Col span={16} className="advance-col">
                      <p>{formatDate(data?.start_time) || '--'}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={4} className="advance-col">
                  <b>Hình thức công tác:</b>
                </Col>
                <Col span={20} className="advance-col">
                  <p>{typeLabel(data?.type) || '--'}</p>
                </Col>
              </Row>
              <Row>
                <Col span={12}>
                  <Row>
                    <Col span={8} className="advance-col">
                      <b>Số tiền yêu cầu:</b>
                    </Col>
                    <Col span={16} className="advance-col">
                      <p>{userlist?.amount ? formatNumber(userlist?.amount) + ' VNĐ' : '0 VNĐ'}</p>
                    </Col>
                  </Row>
                </Col>
                <Col span={12}>
                  <Row>
                    <Col span={8} className="advance-col">
                      <b>Số tiền tạm ứng tối đa:</b>
                    </Col>
                    <Col span={16} className="advance-col">
                      <p>{maxAmount ? formatNumber(Math.round(maxAmount)) + ' VNĐ' : '0 VNĐ'}</p>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={4} className="advance-col">
                  <b>Thời hạn thanh toán:</b>
                </Col>
                <Col span={20} className="advance-col">
                  <p>{data?.expired_time ? formatDate(data?.expired_time) : '--'}</p>
                </Col>
              </Row>
              <Row>
                <Col span={4} className="advance-col">
                  <b>Diễn giải chi tiết:</b>
                </Col>
                <Col span={20} className="advance-col">
                  <p>{data?.description}</p>
                </Col>
              </Row>
            </>
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
                columns: column,
                dataSource: userlist ? [userlist] : [],
                rowKey: '_id',
              }}
            />
          )}
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};

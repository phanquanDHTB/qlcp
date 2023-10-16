import {
  AimOutlined,
  ApartmentOutlined,
  AreaChartOutlined,
  CarOutlined,
  ClusterOutlined,
  ContainerOutlined,
  DingdingOutlined,
  ExpandOutlined,
  FileDoneOutlined,
  GroupOutlined,
  InsertRowBelowOutlined,
  LayoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PrinterOutlined,
  SolutionOutlined,
  TeamOutlined,
  UserOutlined,
  HomeOutlined,
  CoffeeOutlined,
} from '@ant-design/icons';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { Button, Col, Layout, Row } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import './element.css';

const settingElement = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();

  const layouts = [
    {
      title_type: 'Quyền Người dùng',
      items: [
        {
          icon: <ClusterOutlined />,
          type: 'role',
          path: 'role',
          title: 'Quyền',
          sub: 'Phân quyền người dùng',
        },
        {
          icon: <TeamOutlined />,
          type: 'Nhân viên',
          path: 'user',
          title: 'Nhân viên',
          sub: 'Quản lý nhân viên',
        },
        {
          icon: <InsertRowBelowOutlined />,
          type: 'department',
          path: 'department',
          title: 'Đơn vị',
          sub: 'Quản lý đơn vị',
        },
      ],
    },
    {
      title_type: 'Thông tin địa điểm',
      items: [
        {
          icon: <InsertRowBelowOutlined />,
          type: 'country',
          path: 'country',
          title: 'Quốc gia',
          sub: 'Quản lý danh mục Quốc gia',
        },
        {
          icon: <AimOutlined />,
          type: 'province',
          path: 'province',
          title: 'Tỉnh/ thành',
          sub: 'Quản lý Tỉnh/ thành',
        },
        {
          icon: <FileDoneOutlined />,
          type: 'district',
          path: 'district',
          title: 'Quận/ huyện',
          sub: 'Quản lý Quận/ huyện',
        },
        {
          icon: <PrinterOutlined />,
          type: 'ward',
          path: 'ward',
          title: 'Xã/ phường',
          sub: 'Quản lý Xã/ phường',
        },
        // {
        //   icon: <AreaChartOutlined />,
        //   type: "area",
        //   path: "area",
        //   title: "khu vực",
        //   sub: "Quản lý khu vực",
        // },
        {
          icon: <DingdingOutlined />,
          type: 'airport',
          path: 'airport',
          title: 'Sân bay',
          sub: 'Quản lý sân bay',
        },
      ],
    },
    {
      title_type: 'Danh mục',
      items: [
        {
          icon: <CarOutlined />,
          type: 'vehicle',
          path: 'vehicle',
          title: 'Phương tiện',
          sub: 'Quản lý phương tiện',
        },
        {
          icon: <GroupOutlined />,
          type: 'vehicle_group',
          path: 'vehicle-group',
          title: 'Nhóm phương tiện',
          sub: 'Nhóm phương tiện',
        },
        {
          icon: <UserOutlined />,
          type: 'service',
          path: 'service',
          title: 'Dịch vụ',
          sub: 'Quản lý dịch vụ',
        },
        {
          icon: <TeamOutlined />,
          type: 'service_group',
          path: 'service-group',
          title: 'Nhóm dịch vụ',
          sub: 'Quản lý nhóm dịch vụ',
        },

        {
          icon: <ContainerOutlined />,
          type: 'position',
          path: 'position',
          title: 'Chức vụ',
          sub: 'Quản lý chức vụ',
        },
        {
          icon: <SolutionOutlined />,
          type: 'position_group',
          path: 'position-group',
          title: 'Nhóm chức vụ',
          sub: 'Quản lý nhóm chức vụ',
        },
        // {
        //   icon: <PrinterOutlined />,
        //   type: "policy",
        //   path: "policy",
        //   title: "Chính sách",
        //   sub: "Quản lý chính sách",
        // },
        {
          icon: <InsertRowBelowOutlined />,
          type: 'policy_limit',
          path: 'policy-limit',
          title: 'Chính sách hạn mức',
          sub: 'Quản lý chính sách hạn mức',
        },
        {
          icon: <ExpandOutlined />,
          type: 'purpose',
          path: 'purpose',
          title: 'Mục đích',
          sub: 'Quản lý mục đích',
        },
        {
          icon: <ApartmentOutlined />,
          type: 'distance_quota',
          path: 'distance-quota',
          title: 'Khoảng cách',
          sub: 'Quản lý khoảng cách',
        },
        {
          icon: <HomeOutlined />,
          type: 'guest-house',
          path: 'guest-house',
          title: 'Nhà khách',
          sub: 'Quản lý nhà khách',
        },
        {
          icon: <CoffeeOutlined />,
          type: 'room',
          path: 'room',
          title: 'Phòng nghỉ',
          sub: 'Quản lý phòng nghỉ',
        },
      ],
    },
  ];
  return (
    <>
      <div className="container">
        <Layout>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              minHeight: 280,
              background: 'white',
            }}
          >
            {layouts.map((item) => {
              return (
                <>
                  <div className="category-wrap">
                    <p className="list-row_header">
                      <strong style={{ color: 'gray', fontSize: '18px' }}>{item.title_type}</strong>
                    </p>
                    <Row>
                      {Array.isArray(item.items) && item.items.length > 0
                        ? item.items.map((i: any) => {
                            return (
                              <>
                                <Col span={6} className="list-row__col" onClick={() => navigate(i.path)}>
                                  <Row align={'middle'}>
                                    <Col span={4} className="list-row__col-icon">
                                      {i.icon ? i.icon : null}
                                    </Col>
                                    <Col span={20}>
                                      <Col span={24} className="list-row__coll-title" style={{ color: 'red' }}>
                                        {i.title ? i.title : null}
                                      </Col>
                                      <Col span={24} className="list-row__coll-subtitle">
                                        {i.sub ? i.sub : null}{' '}
                                      </Col>
                                    </Col>
                                  </Row>
                                </Col>
                              </>
                            );
                          })
                        : null}
                    </Row>
                  </div>
                </>
              );
            })}
          </Content>
        </Layout>
      </div>
    </>
  );
};
export default settingElement;

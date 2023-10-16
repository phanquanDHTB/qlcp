import { Button, Col, Layout, Row } from 'antd';
import { Content, Footer, Header } from 'antd/es/layout/layout';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { DingdingOutlined, HomeOutlined, ProfileOutlined, ShopOutlined, TeamOutlined } from '@ant-design/icons';
import './element.css';

const settingElement = () => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const navigate = useNavigate();

  const layouts = [
    {
      title_type: 'Định mức',
      items: [
        {
          path: 'airport',
          label: 'Định mức taxi sân bay',
          icon: <DingdingOutlined />,
          title: 'Định mức taxi sân bay',
          sub: 'Quản lý định mức taxi sân bay',
        },
        {
          path: 'hotel',
          label: 'Định mức phòng nghỉ',
          icon: <HomeOutlined />,
          title: 'Định mức phòng nghỉ',
          sub: 'Quản lý định mức phòng nghỉ',
        },
        {
          path: 'living',
          label: 'Định mức phụ cấp lưu trú',
          icon: <ShopOutlined />,
          title: 'Định mức phụ cấp lưu trú',
          sub: 'Quản lý định mức phụ cấp lưu trú',
        },
        {
          path: 'moving',
          label: 'Định mức chi phí di chuyển',
          icon: <TeamOutlined />,
          title: 'Định mức chi phí di chuyển',
          sub: 'Quản lý định mức chi phí di chuyển',
        },
        {
          path: 'living-cost',
          label: 'Định mức sinh hoạt phí',
          icon: <ProfileOutlined />,
          title: 'Định mức sinh hoạt phí',
          sub: 'Quản lý định mức sinh hoạt phí',
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
                    <Row gutter={[16, 16]}>
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

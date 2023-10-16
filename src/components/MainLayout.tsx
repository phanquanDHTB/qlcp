import React, { useEffect } from "react";
import { Layout, theme } from "antd";
import UrlPath from "../constants/UrlPath.ts";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import "../assets/sass/components/main-layout.scss";
import TopNavBar from "./TopNavBar.tsx";
import { useUserStore } from "../stores/useUserStore.ts";
import { call } from "../apis/baseRequest.ts";
import { MenuLayout } from "./MenuLayout.tsx";

const { Content, Sider, Header } = Layout;

const MainLayout: React.FC = () => {
  const { setUser, setPermission } = useUserStore();

  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const auth = Boolean(localStorage.getItem("key"));

  const navigate = useNavigate();

  const getUserInfo = () => {
    call({
      uri: "info",
      hasToken: true,
    })
      .then((res: any) => {
        setUser(res.data);
        setPermission(
          res.data?.permission.filter((item) => item != null).map((i) => i.name)
        );
      })
      .catch(() => {
        navigate("/login");
      });
  };

  useEffect(() => {
    if (auth) {
      getUserInfo();
    }
  }, [auth]);

  if (!auth) return <Navigate to={UrlPath.LOGIN} />;

  return (
    <>
      <Layout
        prefixCls="ant-layout"
        style={{ height: "100vh", position: "relative" }}
      >
        <Layout>
          <Sider width={280} style={{ background: colorBgContainer }}>
            <div className="logo">{"QL chi phí"}</div>
            <MenuLayout />
          </Sider>
          <Layout
            prefixCls="ant-layout"
            hasSider
            style={{
              position: "relative",
            }}
          >
            <Header
              prefixCls="ant-layout-header"
              style={{
                zIndex: 2,
                height: 60,
                background: "white",
                padding: 0,
                position: "absolute",
                top: 0,
                width: "100%",
              }}
            >
              <TopNavBar />
            </Header>
            <Content
              style={{
                paddingTop: 60,
                margin: 0,
                minHeight: 280,
                background: colorBgContainer,
              }}
            >
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </>
  );
};

export default MainLayout;

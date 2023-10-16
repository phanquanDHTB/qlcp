import "./styles.scss";
import { Col, Row, Button, Divider } from "antd";
import bgLogin from "@assets/img/bgLogin.png";
import { useToggle } from "usehooks-ts";
import { FieldValues, useForm } from "react-hook-form";
import { MzFormInput } from "@components/forms/FormInput";
import { MzFormPassword } from "@components/forms/FormPassword";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUserInfor } from "../../stores/useUserInfor";
import { useUserStore } from "../../stores/useUserStore";
import { call } from "../../apis/baseRequest";

const LoginPage = () => {
  const [isShowForgotPassword, setIsShowForgotPassword] = useToggle(false);

  const { control, handleSubmit } = useForm();

  const [isError, setIsError] = useToggle(false);

  const navigate = useNavigate();

  const { setUser } = useUserInfor();
  const { setUser: setUserStore } = useUserStore();

  const onSubmitLogin = async (value: FieldValues) => {
    if (isError) setIsError();
    try {
      const res = await axios.post("login", value);
      if (res.data.userInfo) {
        setUser({
          id: res.data.userInfo.id,
          username: res.data.userInfo.full_name,
          department: res.data.userInfo.departments
            ? {
                value: res.data.userInfo.departments.id,
                label:
                  res.data.userInfo.departments.code +
                  " - " +
                  res.data.userInfo.departments.name,
              }
            : null,
        });
      }


      if (res.data.token) {
        localStorage.setItem("key", res.data?.token);
        navigate("/business/plan", { replace: true });
      } else {
        setIsError();
      }
    } catch (error) {
      console.log(error);
      setIsError();
    }
  };

  return (
    <>
      <Row gutter={{ xs: 24, md: 24, lg: 8 }} style={{ margin: 0 }}>
        <Col
          style={{
            backgroundImage: `url(${bgLogin})`,
            minWidth: "100%",
            minHeight: "100vh",
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            alignItems: "center",
            backgroundSize: "cover",
            backgroundPosition: "center center",
          }}
          className="contai"
        ></Col>
        <Col className="wrap-login" style={{ padding: 0 }}>
          {/* <div className="overlay" v-if="loader">
						<div className="loader"></div>
					</div> */}
          <Col xs={{ span: 24 }} md={{ span: 12 }} lg={{ span: 15 }} />
          <div className="form validate-form">
            <div className="banner">
              <span>QL Chi phí</span>
            </div>
            <form onSubmit={handleSubmit(onSubmitLogin)}>
              {!isShowForgotPassword ? (
                <div className="login-form">
                  <div className="wrap-input">{"Tài khoản"}</div>
                  <div className="wrap-input">
                    <MzFormInput
                      controllerProps={{
                        control,
                        name: "username",
                        rules: {
                          required: "Vui lòng nhập tài khoản",
                        },
                      }}
                      inputProps={{
                        allowClear: true,
                        placeholder: "Vui lòng nhập tài khoản",
                        size: "large",
                      }}
                    />
                  </div>
                  <div className="wrap-input">{"Mật khẩu"}</div>
                  <div className="wrap-input">
                    <MzFormPassword
                      controllerProps={{
                        control,
                        name: "password",
                        rules: {
                          required: "Vui lòng nhập mật khẩu",
                        },
                      }}
                      inputProps={{
                        allowClear: true,
                        placeholder: "Vui lòng nhập Mật khẩu",
                        size: "large",
                      }}
                    />
                  </div>
                  {isError && (
                    <div className="error-message">
                      {
                        "Có lỗi xảy ra khi đăng nhập, vui lòng kiểm tra lại tài khoản và mật khẩu"
                      }
                    </div>
                  )}
                  <div style={{ textAlign: "right" }}>
                    <Button
                      onClick={setIsShowForgotPassword}
                      size="large"
                      style={{
                        backgroundColor: "#00000",
                        border: "none",
                        color: "#ed1b2f",
                        paddingRight: 0,
                      }}
                    >
                      {"Quên mật khẩu"}
                    </Button>
                  </div>
                  <div className="container-form-btn">
                    <Button
                      htmlType="submit"
                      onClick={handleSubmit(onSubmitLogin)}
                      type="primary"
                      block
                      // @click="login"
                      size="large"
                      style={{
                        backgroundColor: "#ed1b2f",
                        borderColor: "#ed1b2f",
                      }}
                    >
                      {"Đăng nhập"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="reset-form">
                  <div className="wrap-input">{"Email"}</div>
                  <div className="wrap-input">
                    <MzFormInput
                      controllerProps={{
                        control,
                        name: "email",
                        rules: {
                          required: "Vui lòng nhập email",
                        },
                      }}
                      inputProps={{
                        allowClear: true,
                        placeholder: "Vui lòng nhập email",
                        size: "large",
                      }}
                    />
                  </div>
                  <div className="container-form-btn">
                    <Button
                      type="primary"
                      block
                      // @click="reset"
                      size="large"
                      style={{
                        backgroundColor: "#ed1b2f",
                        borderColor: "#ed1b2f",
                      }}
                      loading={false}
                    >
                      {"Reset"}
                    </Button>
                  </div>
                  <div className="container-form-btn back">
                    <Button
                      block
                      onClick={setIsShowForgotPassword}
                      size="large"
                    >
                      {"Quay lại"}
                    </Button>
                  </div>
                </div>
              )}
            </form>
            {/* <div v-else>
							<Row>
								<Result
									status="error"
									title="$t('login.waning')"
									sub-title="$t('login.no_support')"
								/>
							</Row>
						</div> */}
            <Divider />
          </div>
        </Col>
      </Row>
    </>
  );
};

export default LoginPage;

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

import "./styles.scss";
import { Button, Checkbox, Col, Modal, Row, message } from "antd";

import { call } from "../apis/baseRequest";

import { MzFormInput } from "./forms/FormInput";
import { MzFormSelect } from "./forms/FormSelect";
import { MzFormSelectV2 } from "./forms/FormSelectV2";
import toSlug from "@utils/toSlug";
import TableData from "./TableData";
import { MzFormCheckbox } from "./forms/FormCheckbox";
import { MzFormPassword } from "./forms/FormPassword";
import { useFieldArray, useForm } from "react-hook-form";
import getMessageError from "@utils/getMessageError";
import { handlePriority } from "@utils/handlePriority";
import FileSaver from "file-saver";
import { DeleteOutlined } from "@ant-design/icons";
import { IData, IUsersSignDTOS } from "../type/sign-interface";
import { AlignType } from "rc-table/lib/interface";
import { planStatus } from "../constants/enumConmon";

import { v4 } from "uuid";
import TableSignPerson from "@pages/business/plan/table-sign-person";
import { handleSendSignRequest, handleLoginSignRequest, handleDownloadFileRequest, handleGetDocTypeRequest, handleGetDomainRequest } from "../apis/page/business/plan/sign";

type Sign = {
  endPlan?: any;
  closeModal?: () => void;
  moneyStatus?: number;
  listFile1?: any;
  listFile2?: any;
  isAdd?: boolean;
  openLogin?: boolean;
  openSign?: boolean;
  displayTable3?: boolean;
  callbackClose?: () => void;
  position?: number[];
  callbackGetFile?: () => void;
  planStatusNum?: number;
  formAddData?: any
};

const Sign = ({
  endPlan = { status: 6 },
  closeModal = () => { },
  moneyStatus,
  listFile1 = [],
  listFile2 = [],
  isAdd = true,
  openLogin = false,
  openSign = false,
  displayTable3 = false,
  callbackClose = () => { },
  position = [1, 2, 3, 4],
  callbackGetFile = () => { },
  planStatusNum,
  // formAddData,
}: Sign) => {
  const [isVofficeDetail, setIsVofficeDetail] = useState(false);

  const [loadingSign, setLoadingSign] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);

  const vOfficeForm = useForm();

  const [isVoffice, setIsVoffice] = useState(false);

  const [listDoc, setListDoc] = useState<any>([]);
  const [userInfor, setUserInfor] = useState<any>(null);
  const [listDomain, setListDomain] = useState<any>([]);
  const [inforSign, setInforSign] = useState<any>(null);
  const [checkIndex, setCheckIndex] = useState<number | null>(0);

  const [dataTablePayment, setDataTablePayment] = useState<any>([]);
  const [dataTableQuota, setDataTableQuota] = useState<any>([]);

  const vOfficeDetailForm = useForm({
    defaultValues: {
      isAutoPromulgate: true,
      documentTypeId: listDoc[0]?.value
      // priorityId: 1,
    },
  }) as any;


  const { confirm } = Modal;

  const loginVoffice = async (data) => {
    setLoadingLogin(true)
    try {
      const res = await handleLoginSignRequest(data) as any
      if (!res.errorCode) {
        callbackGetFile();
        setIsVoffice(false);
        setIsVofficeDetail(true);
        toast("Đăng nhập thành công");
        getDoctype();
        getDomain();
      } else {
        toast(res.message, { type: "error" });
      }
      setLoadingLogin(false)
    } catch (err) {
      setLoadingLogin(false)
      toast(getMessageError(err), { type: "error" });
    }
  };

  const getSign = async () => {
    try {
      const res = (await call({
        uri: `documents?planId=${endPlan.id}&type.in=1`,
        method: "GET",
        hasToken: true,
      })) as any;
      setInforSign(res.content[0]);
      const position1 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === position[0]
      );
      const position2 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === position[1]
      );
      const position3 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === position[2]
      );
      const position4 = res.content[0]?.document_file_list.filter(
        (i: any) => i.position === position[3]
      );
      setDataTableQuota([...position2, ...position3]);
      setDataTablePayment([...position4, ...position1]);
      vOfficeDetailForm.setValue(
        "usersSignDTOS",
        res.content[0]?.document_user_list
      );
    } catch (err) {
      // toast(getMessageError(err), { type: "error" });
      console.log(err, "error");
    }
  };

  useEffect(() => {
    if (!isAdd) {
      getSign();
    }
  }, [endPlan?.id, isAdd]);

  const getDoctype = async () => {
    try {
      const res = (await handleGetDocTypeRequest() as any)
      const listDoc = res?.map((i: any) => ({ label: i.name, value: i.id }));
      setListDoc(listDoc);
    } catch (err) {
      console.log(err);
    }
  };

  const getDomain = async () => {
    try {
      const res = (await handleGetDomainRequest() as any)
      const listDomain = res?.map((i: any) => ({ label: i.name, value: i.id }));
      setListDomain(listDomain);
    } catch (err) {
      console.log(err);
    }
  };

  const addSign = async (data: IData) => {
    const arr = [...dataTablePayment, ...dataTableQuota];
    const listFile = [...listFile1, ...listFile2];
    if (vofficeData.fields.length === 0) {
      toast("Vui lòng chọn người ký nhận", { type: "error" });
    }
    if (listFile.length > 0) {
      data.files = listFile?.map((i: any) => i.file_id);
    } else if ((listFile.length = 0 && arr.length > 0)) {
      data.files = arr?.map((i: any) => i.file_id);
    }
    data.username = vOfficeForm.getValues("username");
    data.password = vOfficeForm.getValues("password");
    data.planId = endPlan.id;
    data.type = moneyStatus;

    data.usersSignDTOS?.forEach((i: IUsersSignDTOS,index) => {
        i.isDisplay = i?.isDisplay ? 1 : 0;
        if(index === checkIndex){
          i.role_key = 2
        } else {
          i.role_key = null
        }
        i.code = i.employee_code
      }
    );
    data.usersSignDTOS?.forEach(
      (i: IUsersSignDTOS) => (i.fullName = i.display_name)
    );
    data.usersSignDTOS?.forEach((i: IUsersSignDTOS) => delete i._id);
    if (planStatusNum === planStatus.init) {
      data.reSign = 1;
      // formAddData.isStatus = AdvanceRequestStatus.CHO_PHE_DUYET
      // await UpdateAdvanceRequestApi(formAddData, endPlan.id);
    } else if (planStatusNum !== planStatus.init) {
      data.reSign = 2;
      // formAddData.isStatus = AdvanceRequestStatus.CHO_PHE_DUYET
      // await UpdateAdvanceRequestApi(formAddData, endPlan.id);
    }
    try {
      const resCheck = (await call({
        uri: "voffice/budget",
        method: "POST",
        hasToken: true,
        bodyParameters: data,
      })) as any;
      if (resCheck) {
        if (resCheck?.error) {
          confirm({
            title: resCheck?.title || "Lỗi",
            content: resCheck?.message || "",
            okText: "Xác nhận",
            cancelText: "Hủy",
            onCancel() {
              console.log("Cancel");
            },
          });
        } else {
          if (resCheck?.title == "PASS_WITH_WARNING") {
            message.warning(resCheck?.message || "");
          }
          setLoadingSign(true);
          const res = (await call({
            uri: "voffice/send",
            method: "POST",
            hasToken: true,
            bodyParameters: data,
          })) as any;
          if (res.error) {
            toast(res.message, { type: "error" });
          } else {
            toast("Thành công", { type: "success" });
            setIsVofficeDetail(false);
            setIsVoffice(false);
            closeModal();
          }
        }
      } else {
        setLoadingSign(true);
        const res = (await handleSendSignRequest(data)) as any
        if (res.error) {
          toast(res.message, { type: "error" });
        } else {
          toast("Thành công", { type: "success" });
          setIsVofficeDetail(false);
          setIsVoffice(false);
          closeModal();
        }
      }
    } catch (err) {
      toast(getMessageError(err), { type: "error" });
    } finally {
      setLoadingSign(false);
    }
  };

  const vofficeData = useFieldArray({
    control: vOfficeDetailForm.control,
    name: "usersSignDTOS",
  });

  const defaulVofficeDataList = useFieldArray({
    control: vOfficeDetailForm.control,
    name: 'defaulDataList',
  })

  const columnsVoffice = [
    {
      title: "STT",
      dataIndex: "code",
      key: "name",
      width: 80,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Nhân viên",
      dataIndex: "display_name",
      key: "name",
      width: 250,
      render: (v, record) => (isAdd ? v : record?.full_name),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "name",
      width: 300,
    },
    {
      title: () => (
        <Row style={{fontSize: "16"}}>
          {endPlan.status === planStatus.confirm_result_work && (
            <span style={{ color: "red", marginRight: 10 }}>*</span>
          )}
          Đơn vị - Chức vụ
        </Row>
      ),
      dataIndex: "plan_user",
      key: "name",
      width: 400,
      render: (_, record, index) =>
        isAdd ? (
          <MzFormSelectV2
            selectProps={{
              style: {
                width: 400,
              },
              placeholder: "Chọn đơn vị, chức vụ",
              allowClear: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined =
                  option?.label !== undefined ? option?.label?.toString() : "";
                return toSlug(optionValue ?? "").indexOf(toSlug(input)) > -1;
              },
              onSelect: (_, record) => {
                vOfficeDetailForm.setValue(`defaulDataList.${index}`, record)
                vofficeData.update(index,
                  Object.assign(vOfficeDetailForm.watch(`usersSignDTOS.${index}`),
                    {
                      departmentSignId: record?.org_id,
                      sysUserId: record?.sys_user_id,
                      departmentRole: record,
                    }
                  )
                );
              },
            }}
            controllerProps={{
              control: vOfficeDetailForm.control,
              name: `usersSignDTOS.${index}.departmentRole.org_id`,
              rules: { required: "Vui lòng chọn đơn vị - chức vụ người ký" },
            }}
            uri={`voffice/users-role?keyword=${record.employee_id}&username=${vOfficeForm.getValues("username")}&password=${vOfficeForm.getValues("password")}`}
            uriSearch={"orgName.contains="}
            displayLoading={true}
            labelObj={["position", "org_name"]}
            valueObj={"org_id"}
            fetchNewUri={true}
            defaultOption={vOfficeDetailForm.watch(`defaulDataList.${index}`)}
          />
        ) : (
          record.full_name
        ),
    },
    // {
    //   title: () => <Row>Kế toán thanh toán</Row>,
    //   dataIndex: 'role_key',
    //   key: 'name',
    //   width: 150,
    //   render: (_, __, index) => (
    //     <Checkbox
    //       checked={index === checkIndex}
    //       onChange={(e) => {
    //         if (e.target.checked) {
    //           setCheckIndex(index);
    //         } else {
    //           setCheckIndex(null)
    //         }
    //       }}
    //       disabled={(isAdd) ? false : true}
    //     />
    //   ),
    // },
    // moneyStatus === 1
    isAdd
      ? {
        title: () => "Hiển thị chữ kí",
        dataIndex: "id",
        key: "name",
        width: 170,
        align: 'center' as AlignType,
        render: (_, __, index) => (
          <div style={{ marginLeft: "40%", marginRight: "40%", marginTop: "25px" }}>
            <MzFormCheckbox
              controllerProps={{
                control: vOfficeDetailForm.control,
                name: `usersSignDTOS.${index}.isDisplay`,
              }}
            />
          </div>
        ),
      }
      : {
        title: () => ("Hiển thị chữ kí"),
        dataIndex: "id",
        key: "name",
        width: 170,
        align: 'center' as AlignType,
        render: (_, record) =>
          <div style={{ marginLeft: "40%", marginRight: "40%" }}>
            <Checkbox disabled checked={!!record?.is_display}></Checkbox>
          </div>
      },

    isAdd ? {
      title: "Hành động",
      dataIndex: 'role_key',
      key: "name",
      width: 150,
      align: 'center' as AlignType,
      render: (_, __, index) =>
      (
        <Button
          icon={<DeleteOutlined />}
          onClick={() => {
            vofficeData.remove(index),
              defaulVofficeDataList.remove(index)
          }}
        ></Button>
      )
    } : {},
  ];

  const columnsTablePayment = [
    {
      title: "STT",
      dataIndex: "",
      key: "name",
      width: 180,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên File",
      dataIndex: "file_name",
      key: "name",
      width: 350,
      render: (v, record) =>
        v && (
          <a
            onClick={async () => {
              try {
                const res = (await handleDownloadFileRequest(record) as any)
                FileSaver.saveAs(new Blob([res]), record.file_name);
              } catch (err) {
                console.log(err)
              }
            }}
          >
            {v}
          </a>
        ),
    },
  ];

  const columnsTablePayment3 = [
    {
      title: "STT",
      dataIndex: "",
      key: "name",
      width: 180,
      render: (_, __, index) => index + 1,
    },
    {
      title: "Số, Ký hiệu văn bản",
      dataIndex: "file_name",
      key: "name",
      width: 350,
      // render: (v) => v && <a href={''}>{v}</a>
    },
    {
      title: "Trích yếu nội dung văn bản",
      dataIndex: "file_name",
      key: "name",
      width: 350,
      // render: (v) => v && <a href={''}>{v}</a>
    },
  ];

  useEffect(() => {
    openLogin && setIsVoffice(true);
  }, [openLogin]);

  useEffect(() => {
    openSign && setIsVofficeDetail(true);
  }, [openSign]);

  console.log(vofficeData.fields)
  return (
    <div>
      <Modal
        title={"Trình ký kế hoạch công tác"}
        open={isVofficeDetail}
        onCancel={() => {
          setIsVofficeDetail(false);
          // vOfficeForm.reset({})
          callbackClose();
          listFile1 = [];
          listFile1 = [];
        }}
        bodyStyle={{
          height: "calc(100vh - 120px)",
          padding: "0px",
        }}
        style={{
          top: 0,
          height: "100vh",
          maxWidth: "100vw",
        }}
        width={"100vw"}
        footer={[
          <Button
            key={1}
            type={"primary"}
            onClick={() =>
              vOfficeDetailForm.handleSubmit(
                (data) => addSign(data),
                (err) => {
                  if (err.usersSignDTOS) {
                    toast(
                      err.usersSignDTOS[0]?.departmentRole?.org_id?.message,
                      { type: "error" }
                    );
                  }
                }
              )()
            }
            disabled={!isAdd}
            loading={loadingSign}
          >
            Trình kí
          </Button>,
          <Button
            key={2}
            onClick={async() => { if( isAdd === true ){
                setDataTablePayment([]);
                setDataTableQuota([]);
                vofficeData.replace([]);
                await vOfficeDetailForm.reset({});
                await vOfficeDetailForm.setValue('nameUserSign', null);
                vOfficeForm.setValue('username', null);
                vOfficeForm.setValue('password', null);
                callbackClose();
                setIsVofficeDetail(false);
                setIsVoffice(false);
              }else{
                callbackClose();
                setIsVofficeDetail(false);
                setIsVoffice(false);
              }
            }}
          >
            Đóng
          </Button>,
        ]}
      >
        <div className={"modal-scroll"}>
          <Row>
            <h3>Thông tin trình kí</h3>
          </Row>
          <div
            style={{ borderBottom: "1px solid #d9d9d9", marginBottom: 20 }}
          />
          <Row style={{ padding: "10px 0" }}>
            <Col span={4}>
              {isAdd && <span style={{ color: "red", marginRight: 5 }}>*</span>}
              Trích yếu nội dung văn bản:
            </Col>
            <Col span={8}>
              {isAdd ? (
                <MzFormInput
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: "title",
                    rules: {
                      required: "Vui lòng nhập trích yếu nội dung văn bản",
                    },
                  }}
                  inputProps={{
                    style: {
                      width: "80%",
                    },
                    placeholder: "Trích yếu nội dung văn bản",
                  }}
                />
              ) : (
                inforSign?.title
              )}
            </Col>
            <Col span={4}>
              {isAdd && <span style={{ color: "red", marginRight: 5 }}>*</span>}
              Hình thức văn bản:
            </Col>
            <Col span={8}>
              {isAdd ? (
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: "documentTypeId",
                    rules: { required: "Vui lòng chọn hình thức văn bản" },
                  }}
                  selectProps={{
                    style: {
                      width: "80%",
                    },
                    placeholder: "Hình thức văn bản",
                    options: listDoc,
                  }}
                />
              ) : (
                inforSign?.document_type?.name
              )}
            </Col>
          </Row>
          <Row style={{ padding: "10px 0" }}>
            <Col span={4}>
              {isAdd && <span style={{ color: "red", marginRight: 5 }}>*</span>}
              Nội dung:
            </Col>
            <Col span={8}>
              {isAdd ? (
                <MzFormInput
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: "description",
                    rules: { required: "Vui lòng nhập nội dung" },
                  }}
                  inputProps={{
                    style: {
                      width: "80%",
                    },
                    placeholder: "Nội dung",
                  }}
                />
              ) : (
                inforSign?.description
              )}
            </Col>
            <Col span={4}>
              {isAdd && <span style={{ color: "red", marginRight: 5 }}>*</span>}
              Độ khẩn:
            </Col>
            <Col span={8}>
              {isAdd ? (
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: "priorityId",
                    rules: { required: "Vui lòng nhập độ khẩn" },
                  }}
                  selectProps={{
                    style: {
                      width: "80%",
                    },
                    placeholder: "Độ khẩn",
                    options: [
                      { value: 1, label: "Bình thường" },
                      { value: 2, label: "Khẩn" },
                      { value: 3, label: "Hỏa tốc" },
                      { value: 4, label: "Thượng khẩn" },
                    ],
                  }}
                />
              ) : (
                handlePriority(inforSign?.priority_id)
              )}
            </Col>
          </Row>
          <Row style={{ padding: "10px 0" }}>
            <Col span={4}>
              {isAdd && <span style={{ color: "red", marginRight: 5 }}>*</span>}
              Ngành:
            </Col>
            <Col span={8}>
              {isAdd ? (
                <MzFormSelect
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: "domainId",
                    rules: { required: "Vui lòng chọn ngành" },
                  }}
                  selectProps={{
                    style: {
                      width: "80%",
                    },
                    options: listDomain,
                    placeholder: "Ngành",
                  }}
                />
              ) : (
                inforSign?.domain?.name
              )}
            </Col>
          </Row>
          <Row>
            <h3>Danh sách người kí</h3>
          </Row>
          <div
            style={{ borderBottom: "1px solid #d9d9d9", marginBottom: 20 }}
          />
          <Col>
            <p style={{ width: 300 }}>
              Danh sách người ký duyệt :
              {endPlan?.status === 7 &&
                inforSign?.document_user_list?.map((i: any) => (
                  <span style={{ margin: "0 5px" }}>{i?.full_name}</span>
                ))}
            </p>
          </Col>
          {isAdd && (
            <Row>
              <Col span={6}>
                <MzFormSelectV2
                  controllerProps={{
                    control: vOfficeDetailForm.control,
                    name: "nameUserSign",
                  }}
                  selectProps={{
                    style: {
                      width: "100%",
                    },
                    placeholder: "Nhập tên",
                    allowClear: true,
                    filterOption: (input, option) => {
                      const optionValue: string | undefined =
                        (option?.label !== undefined
                          ? option?.label?.toString()
                          : "") +
                        (option?.employee_code !== undefined
                          ? option?.employee_code?.toString()
                          : "") +
                        (option?.email !== undefined
                          ? option?.email?.toString()
                          : "");
                      return (
                        toSlug(optionValue ?? "").indexOf(toSlug(input)) > -1
                      );
                    },
                    onSelect: (_, record) => setUserInfor(record),
                  }}
                  labelObj={["display_name"]}
                  valueObj="employee_id"
                  uri={`voffice/users?username=${vOfficeForm.getValues(
                    "username"
                  )}&password=${vOfficeForm.getValues("password")}`}
                  uriSearch={"keyWord="}
                  displayLoading={true}
                />
              </Col>
              <Col span={1}></Col>
              <Col span={2}>
                <Button
                  type={"primary"}
                  onClick={() => {
                    if (vOfficeDetailForm.getValues('nameUserSign')) {
                      const duplicate = vofficeData.fields?.find(
                        (i: any) => i.employee_id === userInfor.employee_id
                      );
                      if (!duplicate) {
                        vofficeData.append(
                          Object.assign(userInfor, { isDisplay: true,  _id: v4() })
                        );}
                      else{
                        toast("Vui lòng chọn nhân viên khác", {type: 'error'})
                      }
                    }
                    else{
                      toast("Vui lòng chọn nhân viên", {type: 'error'})
                    }}}
                >
                  Thêm
                </Button>
              </Col>
            </Row>
          )}
          <Row style={{ marginTop: 20 }}>
            <TableSignPerson vofficeData={vofficeData} columnsVoffice={columnsVoffice} defaulVofficeDataList={defaulVofficeDataList} />
          </Row>
          <Row style={{ margin: "30px 0" }}>
            <MzFormCheckbox
              controllerProps={{
                control: vOfficeDetailForm.control,
                name: "isAutoPromulgate",
              }}
              label={"Tự động ban hành"}
              checkboxProps={{
                disabled: endPlan?.status === 7,
              }}
            />
          </Row>
          <Row style={{ margin: "20px 0" }}>
            <Col span={11}>
              <Row>
                <h3>Văn bản đính kèm</h3>
              </Row>
              <Row>
                <Col span={24}>
                  <TableData
                    tableProps={{
                      dataSource:
                        dataTablePayment.length == 0
                          ? listFile1
                          : dataTablePayment,
                      columns: columnsTablePayment,
                      rowKey: "id",
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={2}></Col>
            <Col span={11}>
              <Row>
                <h3>Văn bản phụ lục</h3>
              </Row>
              <Row>
                <Col span={24}>
                  <TableData
                    tableProps={{
                      dataSource:
                        dataTableQuota.length == 0 ? listFile2 : dataTableQuota,
                      columns: columnsTablePayment,
                      rowKey: "id",
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          {displayTable3 && (
            <Row style={{ margin: "20px 0" }}>
              <Col span={11}>
                <Row>
                  <h3>Văn bản đính kèm</h3>
                </Row>
                <Row>
                  <Col span={24}>
                    <TableData
                      tableProps={{
                        dataSource: [],
                        columns: columnsTablePayment3,
                        rowKey: "id",
                      }}
                    />
                  </Col>
                </Row>
              </Col>
            </Row>
          )}
        </div>
      </Modal>
      <Modal
        title={"Thông tin đăng nhập"}
        open={isVoffice}
        onCancel={() => {
          callbackClose();
          setIsVoffice(false);
        }}
        footer={[
          <Button
            key={1}
            onClick={() => {
              callbackClose();
              setIsVoffice(false);
            }}
          >
            Đóng
          </Button>,
          <Button
            key={2}
            type={"primary"}
            onClick={() => vOfficeForm.handleSubmit(loginVoffice)()}
            loading={loadingLogin}
          >
            Đăng nhập
          </Button>,
        ]}
      >
        <Row>
          <Col style={{ color: "red" }} span={1}>
            <span>*</span>
          </Col>
          <Col span={23}>
            <MzFormInput
              controllerProps={{
                control: vOfficeForm.control,
                name: "username",
                rules: { required: "Vui lòng nhập tên đăng nhập" },
              }}
              label={"Tên đăng nhập Voffice"}
              inputProps={{
                style: {
                  width: "100%",
                },
              }}
            />
          </Col>
        </Row>
        <Row>
          <Col style={{ color: "red" }} span={1}>
            <span>*</span>
          </Col>
          <Col span={23}>
            <MzFormPassword
              controllerProps={{
                control: vOfficeForm.control,
                name: "password",
                rules: { required: "Vui lòng nhập mật khẩu" },
              }}
              label={"Mật khẩu Voffice"}
              inputProps={{
                style: {
                  width: "100%",
                },
                type: "password",
              }}
            />
          </Col>
        </Row>
      </Modal>
    </div>
  );
};

export default Sign;

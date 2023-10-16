import { Checkbox, Col, Input, Row, Typography, Card, Spin, Table, Modal, Empty } from "antd";
import { useEffect, useState } from "react";
import React from "react";

import useDebounce from "@utils/hook/useDebounce";
import toSlug from "@utils/toSlug";
import { formatDate } from "@utils/formatDate";
import TableData from "@components/TableData";
import formatNumber from "@utils/formatNumber";
import dayjs from "dayjs";
import { getRouteApi } from "../../../apis/page/business/plan/plan-details-modal";

const { Title, Text } = Typography;
const { Search } = Input;

interface Props {
  idDetails: number | null;
}

export const PlanRouteDetails = (props: Props) => {
  const { idDetails } = props;

  const [data, setData] = useState<any>();
  const [dataCopy, setDataCopy] = useState<any>();
  const [selectedCardData, setSelectedCardData] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState<any>();
  const debounce = useDebounce(searchTerm, 300);

  const [isLoading, setIsLoading] = useState(true);
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(0);

  const column = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      render: (_, __, rowIndex) => rowIndex + 1,
    },
    {
      title: 'Loại',
      dataIndex: 'plan_user',
      key: 'STT',
      render: (value) => typeLabel(value.type),
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'STT',
    },
    {
      title: 'Chức danh',
      dataIndex: 'plan_user',
      key: 'STT',
      render: (value) => { return (<div> {value.position} </div>) },
    },
    {
      title: 'Liên hệ',
      dataIndex: 'plan_user',
      key: 'plan_user',
      render: (value) => { return (<div> {value.phone_number} </div>) },
    },
    {
      title: 'Email',
      dataIndex: 'plan_user',
      key: 'plan_user',
      render: (value) => { return (<div> {value.email} </div>) },
    },
    {
      title: 'Ngày công tác',
      dataIndex: 'time',
      key: 'STT',
      render: (_, record) => (<div>{formatDate(record.start_time)} - {formatDate(record.end_time)}</div>)
    },
  ]


  const callBackGetRoute = async () => {
    try {
        const res = await getRouteApi(idDetails) as any
        setData(res.content);
        setSelectedCardData(res.content[0]);
        setIsLoading(false);
        setDataCopy(res.content)
    } catch (error) {
      alert(error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (idDetails) {
      callBackGetRoute()
    }
  }, [idDetails]);

  const typeLabel = (type: number) => {
    switch (type) {
      case 1:
        return "Nhân Viên";
      case 2:
        return "Đối Tác";

      default:
        return type;
    }
  };

  const setSelectedCardIndexfunction = (index: number) => {
    setSelectedCardData(data[index]);
    setSelectedCardIndex(index)
  }

  useEffect(() => {
    if (debounce) {
      const arrSearch = dataCopy.filter((i: any) => toSlug(i.name).includes(toSlug(debounce)) ||
        toSlug(i.from_department?.name).includes(toSlug(debounce)) ||
        toSlug(i.to_department?.name).includes(toSlug(debounce)) ||
        toSlug(dayjs(i.end_time).format('DD/MM/YYYY')).includes(toSlug(debounce)) ||
        toSlug(dayjs(i.start_time).format('DD/MM/YYYY')).includes(toSlug(debounce))
      )
      setData(arrSearch)
    } else {
      setData(dataCopy)
    }
  }, [debounce])

  return (
    <div style={{ marginTop: 20 }}>
      <Row>
        <Col span={6}>
          <Card
            className="card-border"
            bordered={false}
            size="small"
          >
            <div style={{ marginBottom:"20px"}}>
              <Search onChange={(e) => { setSearchTerm(e.target.value) }} />
            </div>
            {
              isLoading ? (
                <div style={{ textAlign: "center" }}>
                  <Spin size='large' />
                </div>
              ) : (
                <div className="scrollbar">
                  <div className="scrollbar-content">
                    {data.map((item: any, index: number) => (
                      <div
                        style={{ padding: 10, borderRadius: 10 }}
                        key={index}
                        className={selectedCardIndex === index ? 'route-selected' : 'route-not-selected'}
                        onClick={() => setSelectedCardIndexfunction(index)}
                      >
                        <Row
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Col span={24}>
                            <strong style={{ fontSize: "130%", marginBottom: "10px" }}>
                              {item.name ? item.name : "--"}
                            </strong>
                          </Col>
                        </Row>
                        <Row style={item.is_from_internal === true ? {marginTop: "5px"} : {marginTop: "5px", marginBottom: "10px"}}>
                          {item.is_from_internal === true ? <Col span={9}><b>Đơn vị đi</b></Col> : <Col span={9}><b>Tên cơ quan đơn vị đi</b></Col>}
                          <Col span={1}>:</Col>
                          <Col span={14}><p>{item.is_from_internal === true ? item.from_department?.name : item.from_department_name}</p></Col>
                        </Row>
                        <Row style={item.is_to_internal === true ? {} : {marginBottom: "10px"}}>
                          {item.is_to_internal === true ? <Col span={9}><b>Đơn vị đến</b></Col> : <Col span={9}><b>Tên cơ quan đơn vị đến</b></Col>}
                          <Col span={1}>:</Col>
                          <Col span={14}><p>{item.is_to_internal === true ? item.to_department?.name : item.to_department_name}</p></Col>
                        </Row>
                        <Row>
                          <Col span={9}><b>Ngày bắt đầu</b></Col>
                          <Col span={1}>:</Col>
                          <Col span={14}><p>{formatDate(item?.start_time)}</p></Col>
                        </Row>
                        <Row>
                          <Col span={9}><b>Ngày kết thúc</b></Col>
                          <Col span={1}>:</Col>
                          <Col span={14}><p>{formatDate(item?.end_time)}</p></Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                </div>
              )
            }
          </Card>
        </Col>
        <Col span={18} style={{ paddingLeft: 10 }}>
          <div style={{ margin: 10, marginTop: 26 }}>
            {selectedCardData && (<Col>
              <Row>
                <Col span={12}>
                  <Title level={5} style={{ color: "#ed1b2f" }}>
                    Điểm đi
                  </Title>
                </Col>
                <Col span={12}>
                  <Title level={5} style={{ color: "#ed1b2f" }}>
                    Điểm đến
                  </Title>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Title level={5}>
                    <Checkbox disabled checked={selectedCardData.is_from_internal === true}>Nội Bộ</Checkbox>
                  </Title>
                </Col>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Title level={5}>
                    <Checkbox disabled checked={selectedCardData.is_to_internal === true}>Nội Bộ</Checkbox>
                  </Title>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    {selectedCardData.is_from_internal === true ? <Col span={8}><b> Đơn vị đi: </b></Col> : <Col span={8}><b>Tên cơ quan đơn vị đi:</b></Col>}
                    <Col span={16}><Text> {selectedCardData.is_from_internal? selectedCardData.from_department?.name :selectedCardData?.from_department_name} </Text></Col>
                  </Row>
                </Col>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    {selectedCardData.is_to_internal === true ? <Col span={8}><b> Đơn vị đến: </b></Col> : <Col span={8}><b>Tên cơ quan đơn vị đến:</b></Col>}
                    <Col span={16}><Text> {selectedCardData.is_to_internal? selectedCardData.to_department?.name : selectedCardData.to_department_name} </Text></Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Quốc gia đi: </b></Col>
                    <Col span={16}><Text> {selectedCardData.from_country?.name} </Text></Col>
                  </Row>
                </Col>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Quốc gia đến: </b></Col>
                    <Col span={16}><Text> {selectedCardData.to_country?.name} </Text></Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Thành phố đi: </b></Col>
                    <Col span={16}><Text> {selectedCardData.from_province?.name} </Text></Col>
                  </Row>
                </Col>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Thành phố đến: </b></Col>
                    <Col span={16}><Text> {selectedCardData.to_province?.name} </Text></Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Quận/Huyện đi: </b></Col>
                    <Col span={16}><Text> {selectedCardData?.from_district?.name} </Text></Col>
                  </Row>
                </Col>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Quận/Huyện đến: </b></Col>
                    <Col span={16}><Text> {selectedCardData?.to_district?.name} </Text></Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Phố: </b></Col>
                    <Col span={16}><Text> {selectedCardData?.from_address === null ? "--" : selectedCardData.from_address} </Text></Col>
                  </Row>
                </Col>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Phố: </b></Col>
                    <Col span={16}><Text> {selectedCardData?.to_address === null ? "--" : selectedCardData.to_address} </Text></Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}>
                      <b> Ngày bắt đầu: </b>
                    </Col>
                    <Col span={16}>
                      <Text> {formatDate(selectedCardData?.start_time)} </Text>
                    </Col>
                  </Row>
                </Col>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}>
                      <b> Ngày kết thúc: </b>
                    </Col>
                    <Col span={16}>
                      <Text> {formatDate(selectedCardData?.end_time)} </Text>
                    </Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b> Phương tiện: </b></Col>
                    <Col span={16}><Text> {selectedCardData?.vehicle.name === null ? "--" : selectedCardData.vehicle.name} </Text></Col>
                  </Row>
                </Col>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Row>
                    <Col span={8}><b>  Khoảng cách: </b></Col>
                    <Col span={16}><Text> {selectedCardData?.distance === null ? "--" : formatNumber(selectedCardData.distance)} </Text></Col>
                  </Row>
                </Col>
              </Row>
              <Row>
                <Col span={12} style={{ paddingBottom: 20 }}>
                  <Title level={5}>
                    <Checkbox disabled checked={selectedCardData?.is_over_night === true}>Qua đêm</Checkbox>
                  </Title>
                </Col>
              </Row>
              <Row>
                <Col span={6} style={{ paddingBottom: 20 }}>
                  <Title level={5}><Checkbox disabled checked={selectedCardData?.movingRoute === true}>Là lộ trình di chuyển</Checkbox></Title>
                </Col>
                <Col span={6} style={{ paddingBottom: 20 }}>
                  <Title level={5}><Checkbox disabled checked={selectedCardData?.is_sea === true}>Tính chi phí công tác biển</Checkbox></Title>
                </Col>
                <Col span={6} style={{ paddingBottom: 20 }}>
                  <Title level={5}><Checkbox disabled checked={selectedCardData?.is_island === true}>Tính chi phí công tác đảo/ nhà giàn</Checkbox></Title>
                </Col>
                <Col span={6} style={{ paddingBottom: 20 }}>
                  <Title level={5}><Checkbox disabled checked={selectedCardData?.is_guest_house === true}>Ở nhà khách</Checkbox></Title>
                </Col>
              </Row>
              <Row>
                <Col span={5} style={{ paddingBottom: 20 }}><b> Nhân viên công tác: </b></Col>
                <Col span={19} style={{ paddingBottom: 20 }}>{selectedCardData?.plan_route_user_dto_list.map((user: any, key: number) => {
                  return (<Text key={key}> {key > 0 && ', '}{user.name}</Text>)
                })}</Col>
              </Row>
              <TableData
                tableProps={{
                  columns: column,
                  dataSource: selectedCardData?.plan_route_user_dto_list,
                  rowKey: "_id",
                }} />
            </Col>)}
          </div>

        </Col>
      </Row>
    </div>
  );
};

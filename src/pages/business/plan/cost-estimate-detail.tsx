import React, { forwardRef, useImperativeHandle, useMemo } from 'react';
import { Col, Input, Row, Card, Spin, TabsProps, Tabs, Table } from 'antd';

import { useEffect, useState } from 'react';

import useDebounce from '@utils/hook/useDebounce';
import TableData from '@components/TableData';
import toSlug from '@utils/toSlug';
import formatNumber from '@utils/formatNumber';
import getMessageError from '@utils/getMessageError';
import { removeDuplicates } from '@utils/removeDuplicatesArr';
import Sign from '@components/Sign';
import dayjs from 'dayjs';
import { v4 } from 'uuid';
import { toast } from 'react-toastify';
import { IPlan, IPlanCost } from 'type';
import { formatDate } from '@utils/formatDate';
import { pdfSignPosition } from '../../../constants/enumConmon';

import { getFile } from '../../../apis/page/business/plan/cost-estimate-details';
import { getCostRequestApi, getPlanApi, getRouteApi } from '../../../apis/page/business/plan/plan-details-modal';

import { ISelectedUser } from '../../../type/cost-estimate-interface';
import { AlignType } from "rc-table/lib/interface";

const { Search } = Input;

interface Props {
  idDetails: number | null;
  planInfor?: any;
  callback: () => void;
  planCost?: IPlanCost | 0;
  baseReload: () => void;
}

// interface ArrayType {
//   [index: number]: {id: number, name: string, position: string } ;
// }

interface IUserListCopy {
  id: number;
  name: string;
  position: string;
}

const CostEstimateDetails = forwardRef((props: Props, ref) => {
  const { idDetails, planInfor, callback, planCost, baseReload } = props;

  const [data, setData] = useState<any>();
  const [dataPlan, setDataPlan] = useState<any>();
  const [dataCopy, setDataCopy] = useState<any>();
  const [userList, setUserList] = useState<any>([]);
  const [userListCopy, setUserListCopy] = useState<any>([]);
  const [workPlanList, setWorkPlanList] = useState<any>([]);
  const [costFileList, setCostFileList] = useState<any>([]);
  const [signFileList, setSignFileList] = useState<any>([]);

  const [selectedCardCost, setSelectedCardCost] = useState<any>(0);

  const [searchRoute, setSearchRoute] = useState<any>();
  const debounceRoute = useDebounce(searchRoute, 300);

  const [searchUser, setSearchUser] = useState<any>();
  const debounceUser = useDebounce(searchUser, 300);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoginVOFFICE, setIsVOFFICE] = useState(false);
  const [isOpenModalLoginVO, setIsOpenModalLoginVO] = useState(false);

  const [selectedUserIndex, setSelectedUserIndex] = useState<any>(null);
  const [selectedCardIndex, setSelectedCardIndex] = useState<any>(0);
  const [cost, setCost] = useState<any>([]);

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Theo cung đường`,
      children: (
        <Card className="card-border" bordered={false} size="small">
          <Search
            value={searchRoute}
            style={{ marginBottom: '20px' }}
            onChange={(e) => {
              setSearchRoute(e.target.value);
            }}
          />
          {isLoading ? (
            <Spin size="large" />
          ) : (
            <div className="scrollbar">
              <div className="scrollbar-content">
                {data.map((item: any, index: number) => {
                  return (
                    <div
                      style={{ padding: 10, borderRadius: 10 }}
                      key={index}
                      className={selectedCardIndex === index ? 'route-selected' : 'route-not-selected'}
                      onClick={() => {
                        setSelectedCardIndex(index);
                        setSelectedUserIndex(null);
                      }}
                    >
                      <Row style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Col span={24}>
                          <strong style={{ fontSize: '130%' }}>{item?.name}</strong>
                        </Col>
                      </Row>
                      <Row
                        style={
                          item.is_from_internal === true
                            ? { marginTop: '5px' }
                            : { marginTop: '5px', marginBottom: '10px' }
                        }
                      >
                        {item.is_from_internal === true ? (
                          <Col span={9}>
                            <b>Đơn vị đi</b>
                          </Col>
                        ) : (
                          <Col span={9}>
                            <b>Tên cơ quan đơn vị đi</b>
                          </Col>
                        )}
                        <Col span={1}>:</Col>
                        <Col span={14} style={{ marginBottom: '10px' }}>
                          {item.is_from_internal ? item.from_department?.name : item.from_department_name || ''}
                        </Col>
                      </Row>
                      <Row style={item.is_to_internal === true ? {} : { marginBottom: '10px' }}>
                        {item.is_to_internal === true ? (
                          <Col span={9}>
                            <b>Đơn vị đến</b>
                          </Col>
                        ) : (
                          <Col span={9}>
                            <b>Tên cơ quan đơn vị đến</b>
                          </Col>
                        )}
                        <Col span={1}>:</Col>
                        <Col span={14} style={{ marginBottom: '10px' }}>
                          {item.is_to_internal === true ? item.to_department?.name : item.to_department_name}
                        </Col>
                      </Row>
                      <Row>
                        <Col span={9}>
                          <b>Ngày bắt đầu:</b>
                        </Col>
                        <Col span={1}>:</Col>
                        <Col span={14} style={{ marginBottom: '10px' }}>
                          {formatDate(item?.start_time)}
                        </Col>
                      </Row>
                      <Row>
                        <Col span={9}>
                          <strong>Ngày kết thúc:</strong>
                        </Col>
                        <Col span={1}>:</Col>
                        <Col span={14} style={{ marginBottom: '10px' }}>
                          {formatDate(item?.end_time)}
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      ),
    },
    {
      key: '2',
      label: `Theo nhân viên`,
      children: (
        <Card className="card-border" bordered={false} size="small">
          <Search value={searchUser} style={{ marginBottom: '20px' }} onChange={(e) => setSearchUser(e.target.value)} />
          {isLoading ? (
            <Spin size="large" />
          ) : (
            <div className="scrollbar">
              <div className="scrollbar-content">
                {userList.map((item: any, index: number) => {
                  return (
                    <div
                      style={{ padding: 10, borderRadius: 10 }}
                      key={index}
                      className={selectedUserIndex === index ? 'route-selected' : 'route-not-selected'}
                      onClick={() => {
                        handleUser(item.id);
                        setSelectedCardIndex(null);
                        setSelectedUserIndex(index);
                      }}
                    >
                      <Row>
                        <Col span={24}>
                          <b style={{ fontSize: '16.38px' }}>{item.name}</b>
                        </Col>
                      </Row>
                      <Row>
                        <Col span={24}>
                          <p>{item.position}</p>
                        </Col>
                      </Row>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>
      ),
    },
  ];

  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'name_of_plan_route',
      key: 'name',
      width: 150,
    },
    {
      title: 'Số lượng',
      dataIndex: 'estimate_quantity',
      key: 'name',
      width: 80,
      align: 'right' as AlignType,
      render: (value) => {
        if (value > 0) {
          return formatNumber(value);
        }
      },
    },
    {
      title: 'Hạn mức',
      dataIndex: 'limit_amount',
      key: 'name',
      width: 180,
      align: 'right' as AlignType,
      render: (value) => {
        if (value > 0) {
          return formatNumber(value);
        }
      },
    },
    {
      title: 'Chi phí dự định',
      dataIndex: 'total_amount',
      key: 'name',
      width: 180,
      align: 'right' as AlignType,
      render: (value) => {
        if (value > 0) {
          return formatNumber(value);
        }
      },
    },
  ];

  useImperativeHandle(ref, () => ({
    SignModalOpen: () => {
      setIsVOFFICE(true);
    },
    watchOf: () => {
      setIsOpenModalLoginVO(true);
    },
  }));

  const callBackGetPlan = async () => {
    try {
      const res = (await getPlanApi(idDetails)) as IPlan;
      setDataPlan(res);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const callBackGetRoute = async () => {
    try {
      const res = (await getRouteApi(idDetails)) as any;
      setData(res.content);
      const user = [] as any;
      res.content.forEach((i) => {
        i.plan_route_user_dto_list?.map((item: ISelectedUser) => {
          user.push({
            id: item.user_id,
            name: item.name,
            position: item.plan_user?.position || [],
          });
        });
        setUserList(removeDuplicates(user, 'id'));
        setUserListCopy(removeDuplicates(user, 'id'));
        setIsLoading(false);
        setDataCopy(res.content);
      });
    } catch (error) {
      console.log(error);
      setIsLoading(false);
    }
  };

  const callBackGetCost = async () => {
    try {
      const res = (await getCostRequestApi(idDetails)) as any;
      if (res.length === 0) {
        toast('Chưa tạo dự toán chi phí kế hoạch', { type: 'error' });
      } else {
        setCost(res);
      }
    } catch (error) {
      toast(getMessageError(error), { type: 'error' });
    }
  };

  const callbackGetFile = () => {
    if (dataPlan?.status && !planInfor?.is_add && planCost !== 0 && dataPlan?.status !== 4) {
      getFile(
        'export-pdf/cost-append/' + idDetails,
        `files/upload-voffice?position=${pdfSignPosition.PHU_LUC_CHI_PHI}`,
        (data) => setCostFileList(() => [data]),
        'PHU_LUC_CHI_PHI.pdf'
      ); //3
      getFile(
        'export-pdf/advance-request-plan/' + idDetails,
        `files/upload-voffice?position=${pdfSignPosition.DE_NGHI_TAM_UNG}`,
        (data) => setSignFileList(() => [data]),
        'DE_NGHI_TAM_UNG.pdf'
      ); //2
    }
    getFile(
      'export-pdf/cost-append/' + idDetails,
      `files/upload-voffice?position=${pdfSignPosition.PHU_LUC_CHI_PHI}`,
      (data) => setCostFileList(() => [data]),
      'PHU_LUC_CHI_PHI.pdf'
    ); //3
    getFile(
      'export-pdf/work-plan/' + idDetails,
      `files/upload-voffice?position=${pdfSignPosition.KE_HOACH_CONG_TAC}`,
      (data) => setWorkPlanList(() => [data]),
      'KE_HOACH_CONG_TAC.pdf'
    ); //1
  };

  useEffect(() => {
    if (idDetails) {
      callBackGetRoute();
      callBackGetCost();
      callBackGetPlan();
    }
  }, [idDetails]);

  useEffect(() => {
    if (debounceRoute) {
      const arrSearch = dataCopy.filter(
        (i: any) =>
          toSlug(i.name)?.includes(toSlug(debounceRoute)) ||
          toSlug(i.from_department?.name)?.includes(toSlug(debounceRoute)) ||
          toSlug(i.to_department?.name)?.includes(toSlug(debounceRoute)) ||
          toSlug(i.from_department_name)?.includes(toSlug(debounceRoute)) ||
          toSlug(i.to_department_name)?.includes(toSlug(debounceRoute)) ||
          toSlug(dayjs(i.end_time)?.format('DD/MM/YYYY'))?.includes(toSlug(debounceRoute)) ||
          toSlug(dayjs(i.start_time)?.format('DD/MM/YYYY'))?.includes(toSlug(debounceRoute)) ||
          toSlug(i.from_department?.code)?.includes(toSlug(debounceRoute)) ||
          toSlug(i.to_department?.code)?.includes(toSlug(debounceRoute))
      );
      setData(arrSearch);
    } else {
      setData(dataCopy);
    }
  }, [debounceRoute]);

  useEffect(() => {
    if (debounceUser) {
      const userList = userListCopy.filter((i: IUserListCopy) => 
        toSlug(i.name)?.includes(toSlug(debounceUser)) ||
        toSlug(i.position)?.includes(toSlug(debounceUser))
      );
      setUserList(userList);
    } else {
      setUserList(userListCopy);
    }
  }, [debounceUser]);

  const handleUser = (id: number) => {
    const listRoute = cost?.filter((i: IPlanCost) => i.user_id === id);
    const listIdRoute = Array.from(new Set(listRoute.map((item: IPlanCost) => item.plan_route_id)));
    const listRouteWithId = listIdRoute.map((item) => listRoute?.filter((i: IPlanCost) => i.plan_route_id === item));
    const listTabledata = [] as any;
    listRouteWithId.forEach((i) => {
      listTabledata.push({
        plan_route_id: i[0]?.plan_route_id,
        plan_route_user_id: i[0]?.plan_route_user_id,
        name_of_plan_route: i[0]?.name_of_plan_route,
        _id: v4(),
        total_amount: Math.round(i?.reduce((accumulator, currentValue) => accumulator + currentValue.total_amount, 0)),
        children: i.map((item) => {
          if (item.name_of_service === 'Tiền taxi sân bay update') {
            item.name_of_service = 'Tiền taxi sân bay';
          }
          return {
            name_of_plan_route: item.name_of_service,
            estimate_quantity: item.estimate_quantity,
            limit_amount: Math.round(item.limit_amount),
            total_amount: Math.round(item.total_amount),
            _id: v4(),
          };
        }),
      });
    });
    setSelectedCardCost(listTabledata);
  };

  useEffect(() => {
    if (selectedCardIndex !== null && dataCopy) {
      const filteredCost = cost?.filter((i) => i.plan_route_id === dataCopy[selectedCardIndex]?.id);
      const service = Array.from(new Set(filteredCost.map((i: IPlanCost) => i.name_of_service)));
      const test = [] as any;
      if (filteredCost[0]?.plan_route_id) {
        test.push({
          name_of_plan_route: filteredCost[0]?.name_of_plan_route,
          total_amount: Math.round(filteredCost?.reduce((accumulator, currentValue) => accumulator + currentValue.total_amount, 0)),
          _id: v4(),
          children: service.map((i) => {
            const chil1 = filteredCost?.filter((item: IPlanCost) => item.name_of_service === i);
            if (chil1[0]?.name_of_service === 'Tiền taxi sân bay update') {
              chil1[0].name_of_service = 'Tiền taxi sân bay';
            }
            
            return {
              name_of_plan_route: chil1[0].name_of_service,
              total_amount: Math.round(chil1?.reduce((accumulator, currentValue) => accumulator + currentValue.total_amount, 0)),
              _id: v4(),
              children: chil1.map((i: IPlanCost) => {
                  const roundedLimitAmount: number | undefined = i.limit_amount !== undefined ? Math.round(i.limit_amount) : undefined;
                  const roundedTotalAmount: number | undefined = i.total_amount !== undefined ? Math.round(i.total_amount) : undefined;
                return {
                  name_of_plan_route: i.name_of_plan_route_user,
                  estimate_quantity: i.estimate_quantity,
                  limit_amount: roundedLimitAmount,
                  total_amount: roundedTotalAmount,
                  _id: v4(),
                };
              }),
            };
          }),
        });
      }
      setSelectedCardCost(test);
    }
  }, [selectedCardIndex, cost, dataCopy]);

  const total = useMemo(() => {
    const total = {} as any;
    if (selectedCardCost[0]?.children[0]?.children) {
      total.quantity = selectedCardCost[0]?.children?.reduce(
        (accumulator, currentValue) =>
          accumulator +
          currentValue?.children?.reduce(
            (accumulator, currentValue) => accumulator + (+currentValue.estimate_quantity || 0),
            0
          ),
        0
      );
      total.limit_amount = selectedCardCost[0]?.children?.reduce(
        (accumulator, currentValue) =>
          accumulator +
          currentValue?.children?.reduce(
            (accumulator, currentValue) => accumulator + (+currentValue.limit_amount || 0),
            0
          ),
        0
      );
      total.total_amount = selectedCardCost[0]?.children?.reduce(
        (accumulator, currentValue) =>
          accumulator +
          currentValue?.children?.reduce(
            (accumulator, currentValue) => accumulator + (+currentValue.total_amount || 0),
            0
          ),
        0
      );
    }
    if (!selectedCardCost[0]?.children[0]?.children && selectedCardCost.length) {
      total.quantity =  selectedCardCost.reduce(
        (accumulator, currentValue) =>
          accumulator +
          currentValue?.children?.reduce(
            (accumulator, currentValue) => accumulator + (+currentValue.estimate_quantity || 0),
            0
          ),
        0
      );
      total.limit_amount =  selectedCardCost.reduce(
        (accumulator, currentValue) =>
          accumulator +
          currentValue?.children?.reduce(
            (accumulator, currentValue) => accumulator + (+currentValue.limit_amount || 0),
            0
          ),
        0
      );
      total.total_amount = Math.round(selectedCardCost.reduce(
        (accumulator, currentValue) =>
          accumulator +
          currentValue?.children?.reduce(
            (accumulator, currentValue) => accumulator + (+currentValue.total_amount || 0),
            0
          ),
        0
      ));
    }
    return total;
  }, [selectedCardCost]);

  const [expandableRowKey, setExpandableRowKey] = useState<string[]>([]);
  useEffect(() => {
    if (selectedCardCost) {
      if (selectedCardCost[0]?.children[0]?.children) {
        const idList: string[] = [];
        selectedCardCost?.forEach((i: any) => {
          idList.push(i?._id);
          i.children?.forEach((i: any) => {
            idList.push(i?._id);
            i.children?.forEach((i: any) => {
              idList.push(i?._id);
            });
          });
        });
        setExpandableRowKey(idList);
      } else {
        const idList: string[] = [];
        selectedCardCost?.forEach((i: any) => {
          idList.push(i?._id);
          i.children?.forEach((i: any) => {
            idList.push(i?._id);
          });
        });
        setExpandableRowKey(idList);
      }
    }
  }, [selectedCardCost]);
  return (
    <div style={{ marginTop: 20 }}>
      <Row>
        <Col span={6}>
          <Tabs
            style={{ marginTop: 11.5 }}
            defaultActiveKey="1"
            items={items}
            onChange={(e) => {
              if (e === '1') {
                setSearchUser('');
                if (data.length) {
                  setSelectedCardIndex(0);
                  setSelectedUserIndex(null);
                }
              } else {
                setSearchRoute('');
                if (userList.length) {
                  handleUser(userList[0].id);
                  setSelectedCardIndex(null);
                  setSelectedUserIndex(0);
                }
              }
            }}
          />
        </Col>
        <Col span={18}>
          <TableData
            tableProps={{
              columns: columns,
              dataSource: selectedCardCost,
              rowKey: '_id',
              expandable: {
                defaultExpandAllRows: true,
                expandRowByClick: true,
                expandedRowKeys: expandableRowKey,
                onExpandedRowsChange: (v) => setExpandableRowKey(v as any),
              },
              summary: () => (
                <Table.Summary>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0}>
                      <strong>Tổng</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" index={1}>
                      <strong>{formatNumber(total.quantity)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" index={2}>
                      <strong>{formatNumber(total.limit_amount)}</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right" index={3}>
                      <strong>{formatNumber(total.total_amount)}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              ),
              // footer: () => (
              //   <Row>
              //     <Col span={6}>Tổng</Col>
              //     <Col span={4} style={{ paddingLeft: 14 }}>
              //       {formatNumber(total.quantity)}
              //     </Col>
              //     <Col span={7} style={{ marginLeft: '-12px' }}>
              //       {formatNumber(total.limit_amount)}
              //     </Col>
              //     <Col span={5} style={{ paddingLeft: 23 }}>
              //       {formatNumber(total.total_amount)}
              //     </Col>
              //   </Row>
              // ),
            }}
          />
          {dataPlan?.status && (
            <Sign
              isAdd={dataPlan?.status === 1 || dataPlan?.status === 4 ? true : false}
              position={[2, 3, 999, 1]}
              openLogin={isLoginVOFFICE}
              openSign={isOpenModalLoginVO}
              listFile1={[...signFileList, ...workPlanList]}
              moneyStatus={1}
              listFile2={[...costFileList]}
              endPlan={dataPlan}
              callbackClose={() => {
                setIsOpenModalLoginVO(false);
                setIsVOFFICE(false);
              }}
              closeModal={()=>{callback(); baseReload()}}
              callbackGetFile={callbackGetFile}
            />
          )}
        </Col>
      </Row>
    </div>
  );
});

export default CostEstimateDetails;

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { useDebounce } from 'usehooks-ts';
import { PlusCircleOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { v4 } from 'uuid';
import { Button, Col, Input, Modal, Row, Space, Spin, Tabs, TabsProps } from 'antd';
import TableData from '@components/TableData';
import getMessageError from '@utils/getMessageError';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import formatNumber from '@utils/formatNumber';
import { removeDuplicates } from '@utils/removeDuplicatesArr';
import toSlug from '@utils/toSlug';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { RouteInfor } from 'type';
import { addCost, getCostByService, getCostExpense, getPlanRoute } from '../../../apis/page/business/plan/expense';

type Expense = {
  idEdit?: any;
  callback?: () => void;
  callbackLoading?: (loading: boolean) => void;
  isAdd: boolean;
};

type CostExpense = {
  amount?: number;
  estimate_amount?: number;
  estimate_quantity?: number;
  limit_amount?: number;
  name_of_plan_route?: string;
  name_of_plan_route_user?: string;
  name_of_service?: string;
  name_of_service_group?: string;
  plan_id?: number;
  plan_route_id?: number;
  plan_route_user_id?: number;
  quantity?: number;
  service_group_id?: number;
  service_id?: number;
  total_amount?: number;
  total_estimate_amount?: number;
  user_id?: number;
  idDelete?: string;
};

const Expense = forwardRef((props: Expense, ref) => {
  const [expandableRowKey, setExpandableRowKey] = useState<string[]>([]);
  const [idPlanRouteUser, setIdPlanRouteUser] = useState<{ id?: number; name?: string } | null>(null);
  const [nameOfService, setNameOfService] = useState<string | null>(null);

  const {
    idEdit,
    callback = () => {
      return;
    },
    callbackLoading = (loading: boolean) => {
      return;
    },
    isAdd,
  } = props;

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingCost, setLoadingCost] = useState<boolean>(false);

  const [listRoutePlan, setListRoutePlan] = useState<RouteInfor[]>([]);
  const [listRoutePlanCopy, setListRoutePlanCopy] = useState<RouteInfor[]>([]);
  const [indexSelect, setIndexSelect] = useState<number | null>(null);
  const [indexUser, setIndexUser] = useState<number | null>(null);
  const [cost, setCost] = useState<CostExpense[]>([]);
  const [costClone, setCostClone] = useState<CostExpense[]>([]);
  const [costWithRouteId, setCostWithRouteId] = useState<CostExpense[][]>([]);
  const [routeSelect, setRouteSelect] = useState<RouteInfor | null>(null);
  const [dataTable, setDataTable] = useState<any>([]);

  const [userList, setUserList] = useState<any>([]);
  const [userListCopy, setUserListCopy] = useState<any>([]);

  const [searchRoute, setSearchRoute] = useState('');
  const debounceRoute = useDebounce(searchRoute, 400);
  const [searchUser, setSearchUser] = useState('');
  const debounceUser = useDebounce(searchUser, 400);

  const [planSelect, setPlanSelect] = useState<any>(null);
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Theo cung đường`,
      children: (
        <>
          <Input.Search
            value={searchRoute}
            style={{ marginBottom: '20px' }}
            onChange={(e) => setSearchRoute(e.target.value)}
          ></Input.Search>
          {listRoutePlan?.map((i: RouteInfor, index: number) => {
            return (
              <div
                key={v4()}
                onClick={() => {
                  setRouteSelect(i);
                  setIndexSelect(index);
                  const route = costWithRouteId.find((item: any) => item[0]?.plan_route_id === i.id);
                  if (route) {
                    handleRoute(route);
                  } else {
                    setDataTable([
                      {
                        plan_route_id: i.id,
                        name_of_plan_route: i.name,
                        total_amount: 0,
                        add: 1,
                        _id: v4(),
                      },
                    ]);
                    setTotalQuantity({
                      quantity: 0,
                      limit_amount: 0,
                      total_amount: 0,
                    });
                  }
                }}
              >
                    <RouteItem index={index} indexSelect={indexSelect} i={i} />
              </div>
            );
          })}
        </>
      ),
    },
    {
      key: '2',
      label: `Theo nhân viên`,
      children: (
        <>
          <Input.Search
            value={searchUser}
            style={{ marginBottom: '20px' }}
            onChange={(e) => setSearchUser(e.target.value)}
          ></Input.Search>
          {userList.map((i: any, index) => (
            <div
              className={`route-wrap ${index === indexUser && 'route-select'}`}
              key={v4()}
              onClick={() => {
                handleUser(i.id);
                setIndexUser(index);
              }}
            >
              <h3>{i.name}</h3>
              <p>{i.position || '--'}</p>
            </div>
          ))}
        </>
      ),
    },
  ];

  const [idEditInput, setIdEditInput] = useState<string | null>(null);

  const [valueInput, setValueInput] = useState<string | null>(null);
  const columns = [
    {
      title: 'Nội dung',
      dataIndex: 'name_of_plan_route',
      key: 'name',
      width: 130,
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'name',
      width: 80,
      render: (v) => {
        if (v > 0) {
          return formatNumber(v);
        }
      },
    },
    {
      title: 'Hạn mức',
      dataIndex: 'limit_amount',
      key: 'name',
      width: 160,
      render: (v) => {
        if (v > 0) {
          return formatNumber(v);
        }
      },
    },
    {
      title: 'Chi phí dự định',
      dataIndex: 'total_amount',
      key: 'name',
      width: 180,
      render: (v, record) => {
        if (record.idDelete === idEditInput) {
          return <Input type={'number'} onChange={(e) => setValueInput(e.target.value)} defaultValue={v} />;
        } else {
          return formatNumber(v);
        }
      },
    },
    {
      title: 'Hành động',
      dataIndex: 'add',
      key: 'name',
      width: 100,
      render: (v, record) => {
        if (v > 0) {
          return (
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => {
                setIsOpen(true);
                setPlanSelect(record);
              }}
            ></Button>
          );
        }
        if (record.edit) {
          return (
            <Space>
              {record.idDelete === idEditInput ? (
                <Space>
                  <Button
                    onClick={() => {
                      if (valueInput && (record.limit_amount === 0 || record.limit_amount >= +valueInput)) {
                        const costData = cost.map((i: any) => {
                          if (i.idDelete === idEditInput) {
                            i.total_amount = valueInput;
                          }
                          return i;
                        });
                        setCost(costData);
                        setCostClone(costData);
                        setIdEditInput(null);
                      } else if (record.limit_amount > 0 && valueInput && record.limit_amount <= +valueInput) {
                        toast.error('Chi phí dự tính không được lớn hơn hạn mức');
                      }
                    }}
                  >
                    Lưu
                  </Button>
                  <Button onClick={() => setIdEditInput(null)}>Hủy</Button>
                </Space>
              ) : (
                <Space>
                  <Button
                    icon={<EditOutlined />}
                    onClick={() => {
                      setIdEditInput(record.idDelete);
                      setValueInput(record.total_amount);
                    }}
                  ></Button>
                  <Button
                    icon={<DeleteOutlined />}
                    onClick={() => {
                      setCost((pre) => pre.filter((i: any) => i?.idDelete !== record.idDelete));
                      setCostClone((pre) => pre.filter((i: any) => i?.idDelete !== record.idDelete));
                      // setRouteSelect((pre) =>
                      //     pre.filter((i: any) => i?.idDelete !== record.idDelete)
                      // );
                    }}
                  ></Button>
                </Space>
              )}
            </Space>
          );
        }
      },
    },
  ];

  const handleUser = (id: number) => {
    const listRoute = cost.filter((i: CostExpense) => i.user_id === id);
    const listIdRoute = Array.from(new Set(listRoute.map((item: CostExpense) => item.plan_route_id)));
    const listRouteWithId = listIdRoute.map((item: number | undefined) =>
      listRoute.filter((i: CostExpense) => i.plan_route_id === item)
    );
    const listTabledata = [] as any;
    listRouteWithId.forEach((i: any) => {
      listTabledata.push({
        plan_route_id: i[0]?.plan_route_id,
        plan_route_user_id: i[0]?.plan_route_user_id,
        name_of_plan_route: i[0]?.name_of_plan_route,
        _id: v4(),
        total_amount: i?.reduce((accumulator, currentValue) => accumulator + (+currentValue.total_amount || 0), 0),
        children: i.map((item: any) => {
          return {
            name_of_plan_route: item.name_of_service,
            quantity: item.quantity,
            limit_amount: item.limit_amount,
            total_amount: item.total_amount,
            edit: item?.edit,
            idDelete: item?.idDelete,
            _id: v4(),
          };
        }),
      });
    });
    setDataTable(listTabledata);
    const footer = listTabledata?.map((i: any) => {
      return {
        quantity: i?.children?.reduce((accumulator, currentValue) => accumulator + (+currentValue.quantity || 0), 0),
        limit_amount: i?.children?.reduce(
          (accumulator, currentValue) => accumulator + (+currentValue.limit_amount || 0),
          0
        ),
        total_amount: i?.children?.reduce(
          (accumulator, currentValue) => accumulator + (+currentValue.total_amount || 0),
          0
        ),
      };
    });
    const footerData = {
      quantity: footer?.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0),
      limit_amount: footer?.reduce((accumulator, currentValue) => accumulator + (+currentValue.limit_amount || 0), 0),
      total_amount: footer?.reduce((accumulator, currentValue) => accumulator + (+currentValue.total_amount || 0), 0),
    };
    setTotalQuantity(footerData);
  };
  const getPlanRouteRequest = async () => {
    try {
      setLoading(true)
      const res = (await getPlanRoute(idEdit)) as any;
      setListRoutePlan(res.content as RouteInfor[]);
      setListRoutePlanCopy(res.content as RouteInfor[]);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    } finally {
      setLoading(false)
    }
  };

  const getCostRequest = async () => {
    setLoadingCost(true)
    try {
      const res = (await getCostExpense(idEdit)) as CostExpense[];
      setCost(res);
      setCostClone(res);
      setLoadingCost(false)
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
      setLoadingCost(false)
    }
  };
  useEffect(() => {
    getPlanRouteRequest();
    getCostRequest();
  }, []);

  const [totalQuantity, setTotalQuantity] = useState<any>({});

  const handleRoute = (routeSelect: any) => {
    const listChildren1 = Array.from(new Set(routeSelect.map((i: any) => i.name_of_service)));
    const test = [] as any;
    if (routeSelect[0]?.plan_route_id) {
      test.push({
        plan_route_id: routeSelect[0]?.plan_route_id,
        name_of_plan_route: routeSelect[0]?.name_of_plan_route,
        total_amount: routeSelect?.reduce(
          (accumulator, currentValue) => accumulator + (+currentValue.total_amount || 0),
          0
        ),
        add: 1,
        _id: v4(),
        children: listChildren1.map((i: any) => {
          const chil1 = routeSelect.filter((item: any) => item.name_of_service === i);
          return {
            name_of_plan_route: chil1[0]?.name_of_service,
            total_amount: chil1?.reduce(
              (accumulator, currentValue) => accumulator + (+currentValue.total_amount || 0),
              0
            ),
            _id: v4(),
            children: chil1.map((i: any) => {
              return {
                name_of_plan_route: i.name_of_plan_route_user,
                quantity: i.quantity,
                limit_amount: i.limit_amount,
                total_amount: i.total_amount,
                _id: v4(),
                edit: i?.edit,
                idDelete: i?.idDelete,
              };
            }),
          };
        }),
      });
    }
    setDataTable(test);
    const footer = test[0]?.children?.map((i: any) => {
      return {
        quantity: i?.children?.reduce((accumulator, currentValue) => accumulator + +currentValue.quantity, 0),
        limit_amount: i?.children?.reduce((accumulator, currentValue) => accumulator + +currentValue.limit_amount, 0),
        total_amount: i?.children?.reduce((accumulator, currentValue) => accumulator + +currentValue.total_amount, 0),
      };
    });
    const footerData = {
      quantity: footer?.reduce((accumulator, currentValue) => accumulator + currentValue.quantity, 0),
      limit_amount: footer?.reduce((accumulator, currentValue) => accumulator + currentValue.limit_amount, 0),
      total_amount: footer?.reduce((accumulator, currentValue) => accumulator + currentValue.total_amount, 0),
    };
    setTotalQuantity(footerData);
  };

  useEffect(() => {
    const user = [] as any;
    listRoutePlan.forEach((i) => {
      i.plan_route_user_dto_list?.map((item: any) => {
        user.push({
          id: item.user_id,
          name: item.name,
          position: item.plan_user?.position || '',
        });
      });
    });
    setUserList(removeDuplicates(user, 'id'));
    setUserListCopy(removeDuplicates(user, 'id'));
  }, [listRoutePlan]);

  useEffect(() => {
    if (debounceRoute) {
      const arrSearch = listRoutePlanCopy.filter(
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
      setListRoutePlan(arrSearch);
      setIndexSelect(null);
    } else {
      setListRoutePlan(listRoutePlanCopy);
      setIndexSelect(null);
    }
  }, [debounceRoute]);

  useEffect(() => {
    if (debounceUser) {
      const arrSearch = userListCopy.filter((i: any) => toSlug(i.name).includes(toSlug(debounceUser)));
      setUserList(arrSearch);
    } else {
      setUserList(userListCopy);
    }
  }, [debounceUser]);
  const [isOpen, setIsOpen] = useState(false);
  const { control, watch, setValue, handleSubmit, reset } = useForm();

  const conlumTableAdd = [
    {
      title: 'Dịch vụ',
      dataIndex: '',
      key: 'name',
      width: 180,
      render: () => (
        <MzFormSelectV2
          controllerProps={{ control, name: 'service_id', rules: { required: 'Vui lòng chọn dịch vụ' } }}
          selectProps={{
            style: {
              width: '100%',
            },
            allowClear: true,
            onSelect: (_, record) => {
              setNameOfService(record.name);
            },
            showSearch: true,
            filterOption: (input, option) => {
              const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
              return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
            },
            placeholder: 'Chọn dịch vụ',
          }}
          uri={'services?isDefaultServiceGroup=false'}
          uriSearch={'name.contains='}
        />
      ),
    },
    {
      title: 'Nhân viên',
      dataIndex: '',
      key: 'name',
      width: 180,
      render: () => (
        <MzFormSelectV2
          controllerProps={{ control, name: 'user_id', rules: { required: 'Vui lòng chọn nhân viên' } }}
          selectProps={{
            style: {
              width: '100%',
            },
            onSelect: (_, record) => {
              setIdPlanRouteUser({ id: record.id, name: record.name });
            },
            showSearch: true,
            filterOption: (input, option) => {
              const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
              return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
            },
            placeholder: 'Chọn nhân viên',
          }}
          uri={`plan-route-users?planRouteId=${planSelect.plan_route_id}&planUserType.equals=1`}
          uriSearch={'name.contains='}
          valueObj={'user_id'}
        />
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: '',
      key: 'name',
      width: 180,
      render: () => (
        <Controller
          control={control}
          name={'quantity'}
          rules={{ required: 'Vui lòng chọn số lượng' }}
          render={({ field }) => <Input {...field} type={'number'} placeholder="Nhập số lượng" />}
        />
      ),
    },
    {
      title: 'Hạn mức',
      dataIndex: '',
      key: 'name',
      width: 180,
      render: () => (
        <Controller
          control={control}
          name={'limit_amount'}
          render={({ field }) => <Input {...field} disabled={true} type={watch('limit_amount') ? 'text' : 'number'} />}
        />
      ),
    },
    {
      title: 'Chi phí dự định',
      dataIndex: 'total_amount',
      key: 'name',
      width: 180,
      render: () => (
        <Controller
          control={control}
          name={'total_amount'}
          rules={{ required: 'Vui lòng chọn số lượng' }}
          render={({ field }) => <Input {...field} type={'number'} placeholder="Nhập chi phí dự dịnh" />}
        />
      ),
    },
  ];

  const service = watch('service_id');
  const user = watch('user_id');
  const limit = watch('limit_amount');
  const total = watch('total_amount');
  const getCost = async () => {
    try {
      const res = (await getCostByService(service, user)) as number;
      if (res) {
        setValue('limit_amount', formatNumber(res));
      } else {
        setValue('limit_amount', null);
      }
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };
  useEffect(() => {
    if (service && user) {
      getCost();
    }
  }, [service, user]);

  const addCostRequest = async () => {
    try {
      callbackLoading(true);
      await addCost(costClone);
      toast(isAdd ? 'Thêm mới kế hoạch thành công' : 'Sửa kế hoạch thành công', { type: 'success' });
      if (callback) {
        callback();
      }
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    } finally {
      callbackLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    addCost: () => {
      addCostRequest();
    },
  }));

  useEffect(() => {
    const listId = Array.from(new Set(cost.map((i: CostExpense) => i.plan_route_id)));
    const data = listId?.map((i: any) => cost.filter((item: CostExpense) => item.plan_route_id === i));
    setCostWithRouteId(data);
  }, [cost]);

  const route2 = costWithRouteId?.find((item: any) => item[0]?.plan_route_id === listRoutePlan[0]?.id);
  console.log(route2);

  useMemo(() => {
    if (route2) {
      // setIndexSelect(0);
      handleRoute(route2);
    }
  }, [route2]);

  useEffect(() => {
    if (listRoutePlan.length) {
      setRouteSelect(listRoutePlan[0]);
      setIndexSelect(0);
    }
  }, [listRoutePlan]);

  useEffect(() => {
    if (cost.length === 0) {
      setDataTable([
        {
          plan_route_id: routeSelect ? routeSelect.id : null,
          name_of_plan_route: routeSelect ? routeSelect.name : null,
          total_amount: 0,
          add: 1,
          _id: v4(),
        },
      ]);
    }
  }, [cost.length, listRoutePlan, routeSelect]);

  useEffect(() => {
    if (indexSelect) {
      const route2 = costWithRouteId?.find((item: any) => item[0]?.plan_route_id === listRoutePlan[indexSelect]?.id);
      if (route2) {
        handleRoute(route2);
      }
    }
  }, [cost.length, costWithRouteId]);

  useEffect(() => {
    if (dataTable.length) {
      if (dataTable[0]?.children && dataTable[0]?.children[0]?.children) {
        const idList: string[] = [];
        dataTable?.forEach((i: any) => {
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
        dataTable?.forEach((i: any) => {
          idList.push(i?._id);
          i.children?.forEach((i: any) => {
            idList.push(i?._id);
          });
        });
        setExpandableRowKey(idList);
      }
    }
  }, [dataTable]);

  console.log(indexSelect);
  return (
    <div style={{ marginTop: '20px' }}>
      <Modal
        open={isOpen}
        onCancel={() => {
          reset({});
          setIsOpen(false);
          setPlanSelect(null);
          setNameOfService(null);
          setIdPlanRouteUser(null);
        }}
        title={'Thêm dự toán chi phí'}
        width={'80vw'}
        footer={[
          <Button
            key={1}
            onClick={() => {
              setIsOpen(false);
              setPlanSelect(null);
              reset({});
              setNameOfService(null);
              setIdPlanRouteUser(null);
            }}
          >
            Trở lại
          </Button>,
          <Button
            key={2}
            type={'primary'}
            onClick={() => {
              if (limit && +total > +limit.replaceAll('.', '')) {
                toast('Chi phí không được lớn hơn hạn mức', { type: 'error' });
              } else {
                handleSubmit(
                  (e) => {
                    const data = {
                      name_of_service: nameOfService,
                      name_of_plan_route_user: idPlanRouteUser ? idPlanRouteUser.name : '',
                      name_of_plan_route: planSelect?.name_of_plan_route,
                      plan_route_user_id: idPlanRouteUser ? idPlanRouteUser.id : '',
                      plan_id: idEdit,
                      plan_route_id: planSelect.plan_route_id,
                      limit_amount: e.limit_amount ? +e.limit_amount.replaceAll('.', '') : 0,
                      quantity: +e.quantity,
                      service_id: e.service_id,
                      total_amount: +e.total_amount,
                      user_id: e.user_id,
                      edit: true,
                      idDelete: v4(),
                    } as CostExpense;
                    setCost((pre) => [...pre, data]);
                    setCostClone((pre) => [...pre, data]);
                    // setRouteSelect((pre) => [...pre, data]);
                    setIsOpen(false);
                    setPlanSelect(null);
                    reset({});
                    toast('Thêm chi phí phát sinh thành công', { type: 'success' });
                  },
                  (err) => toast(Object.values(err)[0]?.message as any, { type: 'error' })
                )();
              }
            }}
          >
            Thêm
          </Button>,
        ]}
      >
        <TableData
          tableProps={{
          columns: conlumTableAdd,
          dataSource: [{ id: 1 }],
          rowKey: 'id',}}/>
      </Modal>
      {
        loadingCost && loading ? 
          <div style={{ textAlign: 'center', marginTop: '10vh' }}>
            <Spin size="large" />
        </div> : 
        <Row>
        <Col span={6}>
          <div style={{ padding: '0 20px' }}>
            <Tabs
              defaultActiveKey="1"
              items={items}
              onChange={(e) => {
                if (e === '2') {
                  setIndexSelect(null);
                  setSearchRoute('');
                  if (userList.length) {
                    handleUser(userList[0]?.id);
                    setIndexUser(0);
                  }
                } else {
                  setIndexUser(null);
                  setSearchUser('');
                  const route2 = costWithRouteId?.find((item: any) => item[0]?.plan_route_id === listRoutePlan[0]?.id);
                  if (route2) {
                    setIndexSelect(0);
                    handleRoute(route2);
                  } else {
                    setIndexSelect(0);
                    setDataTable([
                      {
                        plan_route_id: listRoutePlan[0]?.id,
                        name_of_plan_route: listRoutePlan[0]?.name,
                        total_amount: 0,
                        add: 1,
                        _id: v4(),
                      },
                    ]);
                    setTotalQuantity({
                      quantity: 0,
                      limit_amount: 0,
                      total_amount: 0,
                    });
                  }
                }
              }}
            />
          </div>
        </Col>
        <Col span={18}>
          <TableData
            tableProps={{
              columns: columns,
              dataSource: dataTable,
              rowKey: '_id',
              expandable: {
                defaultExpandAllRows: true,
                expandRowByClick: true,
                expandedRowKeys: expandableRowKey,
                onExpandedRowsChange: (v) => setExpandableRowKey(v as any),
              },
              footer: () => (
                <>
                  <Row>
                    <Col span={5}>Tổng</Col>
                    <Col span={3}>{formatNumber(totalQuantity?.quantity)}</Col>
                    <Col span={6}>{formatNumber(totalQuantity?.limit_amount)}</Col>
                    <Col span={4}>{formatNumber(totalQuantity?.total_amount)}</Col>
                  </Row>
                </>
              ),
            }}
          />
        </Col>
      </Row>
      }
    </div>
  );
});

export default Expense;

type RouteItem = {
  index: number;
  indexSelect?: number | null;
  i?: any;
};

const RouteItem = ({ index, indexSelect, i }: RouteItem) => {
  return (
        <div className={`route-wrap ${index === indexSelect && 'route-select'}`} key={v4()}>
        <Row>
          <h3>{i.name || ''}</h3>
        </Row>
        <Row>
          <Col span={7}>
            <h3>{!i.is_from_internal ? 'Tên cơ quan đơn vị đi' : 'Đơn vị đi'}</h3>
          </Col>
          <Col span={1}>:</Col>
          <Col style={{ textAlign: 'right' }} span={16}>
            {!i.is_from_internal ? i.from_department_name : i.from_department?.name || ''}
          </Col>
        </Row>
        <Row>
          <Col span={7}>
            <h3>{!i.is_to_internal ? 'Tên cơ quan đơn vị đến' : 'Đơn vị đến'}</h3>
          </Col>
          <Col span={1}>:</Col>
          <Col style={{ textAlign: 'right' }} span={16}>
            {!i.is_to_internal ? i.to_department_name : i.to_department?.name || ''}
          </Col>
        </Row>
        <Row>
          <Col span={7}>
            <h3>Ngày bắt đầu</h3>
          </Col>
          <Col span={1}>:</Col>
          <Col style={{ textAlign: 'right' }} span={16}>
            {dayjs(i?.start_time).format('DD/MM/YYYY') || ''}
          </Col>
        </Row>
        <Row>
          <Col span={7}>
            <h3>Ngày kết thúc</h3>
          </Col>
          <Col span={1}>:</Col>
          <Col style={{ textAlign: 'right' }} span={16}>
            {dayjs(i?.end_time).format('DD/MM/YYYY') || ''}
          </Col>
        </Row>
      </div>
  );
};

/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
import TableData from '@components/TableData';
import { MzFormCheckbox } from '@components/forms/FormCheckbox';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelect } from '@components/forms/FormSelect';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import getMessageError from '@utils/getMessageError';
import toSlug from '@utils/toSlug';
import { Button, Col, DatePicker, Input, Popover, Row, Space, Spin } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { v4 } from 'uuid';
import dayjs from 'dayjs';
import { useDebounce } from 'usehooks-ts';
import { CloseOutlined } from '@ant-design/icons';
import { IDefaulOption, IDepartment, IPlan, IUser, RouteInfor as RouteInforInterface } from '../../../type';
import {
  addOrEditRouteRequest,
  deleteRouteRequest,
  getDistantRequest,
  getListRoutePlanRequest,
  getListRouteUser,
} from '../../../apis/page/business/plan/route-infor';
import isBetween from 'dayjs/plugin/isBetween';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { string } from 'prop-types';
dayjs.extend(isBetween);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

type RouteInforProps = {
  idEdit?: number | null;
  departmentProcess?: IDepartment;
  callBack?: () => void;
  type?: any;
  callbackLoading?: (loading: boolean) => void;
};

export type RouteUser = {
  account_number?: string;
  amount?: number;
  bank?: string;
  code?: string;
  department?: IDepartment;
  department_name?: string;
  description?: string;
  email?: string;
  end_time?: string;
  gender?: string;
  id: number;
  name?: string;
  phone_number?: string;
  plan?: IPlan;
  position?: string;
  user?: IUser;
  _id?: string;
  rangePicker?: dayjs.Dayjs[];
};

const RouteInfor = forwardRef((props: RouteInforProps, ref) => {
  const { idEdit, departmentProcess, callBack = () => null, type, callbackLoading = () => null } = props;
  const { control, watch, handleSubmit, setValue, reset, setFocus } = useForm({
    defaultValues: {
      from_department: { id: departmentProcess?.id },
      from_country: { id: 192 },
      to_country: { id: 192 },
      is_from_internal: true,
      is_to_internal: true,
    },
  } as any);

  const tableUserPlan = useFieldArray({
    control,
    name: 'plan_route_user_dto_list',
    keyName: '_id',
  });

  // const [isAir, setIsAir] = useState<boolean | undefined>(false);
  const [to, setTo] = useState('');
  const [from, setfrom] = useState('');

  const [defaulFromProvince, setDefaulFromProvince] = useState(true);
  const [defaulToProvince, setDefaulToProvince] = useState(true);
  const [defaulFromDistrict, setDefaulFromDistrict] = useState(true);
  const [defaulToDistrict, setDefaulToDistrict] = useState(true);
  const [defaulVehicle, setDefaulVehicle] = useState(true);

  const [indexSelect, setIndexSelect] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setDefaulFromDistrict(true);
    setDefaulFromProvince(true);
    setDefaulToDistrict(true);
    setDefaulToProvince(true);
    setDefaulVehicle(true);
    setfrom('');
    setTo('');
  }, [indexSelect]);

  const stringFormatDate = 'YYYY/MM/DD'
  const startTime = watch('start_time');
  const endTime = watch('end_time');

  const userIdList = watch('select_user');
  const columns = [
    {
      title: 'STT',
      dataIndex: '',
      key: 'name',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'name',
      width: 100,
      render: (v) => (v === 2 ? 'Đối tác' : 'Nhân viên'),
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      key: 'name',
      render: (v) => v,
    },
    {
      title: 'Chức danh',
      dataIndex: 'position',
      key: 'name',
      width: 200,
      render: (v) => v,
    },
    {
      title: 'Liên hệ',
      dataIndex: 'phone_number',
      key: 'name',
      width: 150,
      render: (v) => v,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'name',
      width: 200,
      render: (v) => v,
    },
    {
      title: 'Ngày công tác',
      dataIndex: '',
      key: 'name',
      width: 250,
      render: (__, record, index) => {
        const userRoute: any = [];
        if (!indexSelect) {
          listRoutePlan?.forEach((i: RouteInforInterface) => {
            const arr = i.plan_route_user_dto_list.find((item: any) => item?.plan_user?.id === record?.plan_user?.id);
            if (arr) {
              userRoute.push(arr);
            }
          });
        } else {
          listRoutePlan
            ?.filter((item: RouteInforInterface) => item.id !== indexSelect)
            ?.forEach((i: RouteInforInterface) => {
              const arr = i.plan_route_user_dto_list.find((item: any) => item?.plan_user?.id === record?.plan_user?.id);
              if (arr) {
                userRoute.push(arr);
              }
            });
        }
        console.log(userRoute, index)
        return (
          <Controller
            name={`plan_route_user_dto_list.${index}.rangePicker`}
            control={control}
            rules={{
              required: 'Vui lòng nhập ngày công tác',
              validate: (e) => {
                if (
                  (dayjs(e[0].format(stringFormatDate)).isAfter(startTime.format(stringFormatDate)) ||
                    e[0].format(stringFormatDate) === startTime.format(stringFormatDate)) &&
                  (dayjs(e[1].format(stringFormatDate)).isBefore(endTime.format(stringFormatDate)) ||
                    e[1].format(stringFormatDate) === endTime.format(stringFormatDate))
                ) {
                  if (!userRoute.length) {
                    return true;
                  } else {
                    let check: boolean | string = true;
                    userRoute.forEach((i: any) => {
                      if (
                        !(
                          dayjs(e[0].format(stringFormatDate)).isSameOrAfter(dayjs(i.end_time).format(stringFormatDate)) ||
                          (
                            dayjs(e[0].format(stringFormatDate)).isSameOrBefore(dayjs(i.start_time).format(stringFormatDate)) &&
                            dayjs(e[1].format(stringFormatDate)).isSameOrBefore(dayjs(i.start_time).format(stringFormatDate))
                          )
                        ) ||
                        !(
                          dayjs(e[1].format(stringFormatDate)).isSameOrBefore(dayjs(i.start_time).format(stringFormatDate)) ||
                          (
                            dayjs(e[1].format(stringFormatDate)).isSameOrAfter(dayjs(i.end_time).format(stringFormatDate)) &&
                            dayjs(e[0].format(stringFormatDate)).isSameOrAfter(dayjs(i.end_time).format(stringFormatDate))
                          )
                        )
                        ||
                        (dayjs(i.start_time).isBetween(e[0].add(1, 'day'), e[1].add(-1, 'day'), 'day') &&
                          e[0].format(stringFormatDate) !== dayjs(i.start_time).format(stringFormatDate) &&
                          e[1].format(stringFormatDate) !== dayjs(i.start_time).format(stringFormatDate)) ||
                        (dayjs(i.end_time).isBetween(e[0].add(1, 'day'), e[1].add(-1, 'day'), 'day') &&
                          e[0].format(stringFormatDate) !== dayjs(i.end_time).format(stringFormatDate) &&
                          e[1].format(stringFormatDate) !== dayjs(i.end_time).format(stringFormatDate))
                      ) {
                        check = 'Nhân viên trùng ngày công tác với lộ trình khác';
                      }
                    });
                    return check;
                  }
                } else {
                  return 'Ngày bắt đầu và kết thúc không được nằm ngoài khoảng thời gian theo lộ trình';
                }
              },
            }}
            render={({ field }) => (
              <DatePicker.RangePicker
                {...field}
                placeholder={['Bắt đầu', 'Kết thúc']}
                format={['DD/MM/YYYY', 'DD/MM/YYYY']}
                autoComplete='off'
                area-aria-autocomplete='none'
              />
            )}
          />
        );
      },
    },
  ];

  // console.log(dayjs(dayjs(new Date()).format('YYYY/MM/DD')).isSameOrAfter('2023/08/29'));
  const [listUserPlan, setListUserPlan] = useState<RouteUser[]>([]);
  const [listRoutePlan, setListRoutePlan] = useState<RouteInforInterface[]>([]);
  const [listRoutePlanCopy, setListRoutePlanCopy] = useState<RouteInforInterface[]>([]);

  const addRoute = async (data: any, indexSelect) => {
    callbackLoading(true);
    const formData = { ...data } as any;
    formData.end_time = formData.end_time.format('YYYY-MM-DD');
    formData.start_time = formData.start_time.format('YYYY-MM-DD');
    formData.plan = { id: idEdit };
    formData.id = indexSelect;
    formData.plan_route_user_dto_list.map((i: any) => {
      if (i.rangePicker && i.rangePicker[0] && i.rangePicker[1]) {
        i.start_time = i.rangePicker[0].format('YYYY-MM-DD');
        i.end_time = i.rangePicker[1].format('YYYY-MM-DD');
      }
      i.user_id = i.user?.id;
      i.user_name = i.user?.user_name;
      if (indexSelect) {
        i.plan_route_id = indexSelect;
      }
      i.plan_id = idEdit;
      if (!i.status) {
        i.status = 0;
      }
      return i;
    });
    if (!formData.from_department?.id) {
      formData.from_department = null;
    }
    if (!formData.to_department?.id) {
      formData.to_department = null;
    }
    formData.name = `${from.length ? from : formData?.from_province?.name} - ${to.length ? to : formData?.to_province?.name
      }`;
    // if (isAir) {
    //     delete formData.distance;
    // }
    try {
      const res = (await addOrEditRouteRequest(indexSelect, formData)) as any;
      toast(indexSelect ? 'Sửa thành công' : 'Thêm thành công', { type: 'success' });
      setIndexSelect(res.id);
      setTimeout(() => {
        getListPlanRoute();
      }, 1000);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    } finally {
    }
  };

  useImperativeHandle(ref, () => ({
    addOrEditRouteRef: () => {
      handleSubmit(
        (data) => {
          addRoute(data, indexSelect);
        },
        (err: any) => {
          if (err.plan_route_user_dto_list) {
            const arrayErr = err.plan_route_user_dto_list
              ?.filter((i: any) => i.rangePicker)
              ?.map((i: any) => {
                return i.rangePicker.message;
              });
            if (arrayErr.length) {
              toast(arrayErr[0], { type: 'error' });
            }
          }
        }
      )();
    },
    listRoute: listRoutePlan,
    handleContinue: () => {
      handleSubmit(
        async (data) => {
          const formData = { ...data };
          formData.end_time = formData.end_time.format('YYYY-MM-DD');
          formData.start_time = formData.start_time.format('YYYY-MM-DD');
          formData.plan = { id: idEdit };
          formData.id = indexSelect;
          formData.plan_route_user_dto_list.map((i: any) => {
            if (i.rangePicker && i.rangePicker[0] && i.rangePicker[1]) {
              i.start_time = i.rangePicker[0].format('YYYY-MM-DD');
              i.end_time = i.rangePicker[1].format('YYYY-MM-DD');
            }
            i.user_id = i.user?.id;
            i.user_name = i.user?.user_name;
            if (indexSelect) {
              i.plan_route_id = indexSelect;
            }
            i.plan_id = idEdit;
            return i;
          });
          if (!formData.from_department?.id) {
            formData.from_department = null;
          }
          if (!formData.to_department?.id) {
            formData.to_department = null;
          }
          formData.name = `${from.length ? from : formData?.from_province?.name} - ${to.length ? to : formData?.to_province?.name
            }`;
          try {
            callbackLoading(true);
            await addOrEditRouteRequest(indexSelect, formData);
            toast(indexSelect ? 'Sửa thành công' : 'Thêm thành công', { type: 'success' });
            callBack();
          } catch (e) {
            toast(getMessageError(e), { type: 'error' });
          } finally {
            setTimeout(() => {
              callbackLoading(false);
            }, 1500)
          }
        },
        (err: any) => {
          if (err.plan_route_user_dto_list) {
            const arrayErr = err.plan_route_user_dto_list
              ?.filter((i: any) => i.rangePicker)
              ?.map((i: any) => {
                return i.rangePicker.message;
              });
            if (arrayErr.length) {
              toast(arrayErr[0], { type: 'error' });
            }
          }
        }
      )();
    },
  }));

  const getListPlanUser = async () => {
    try {
      const res = (await getListRouteUser(idEdit)) as any;
      setListUserPlan(res.content as RouteUser[]);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };

  const getListPlanRoute = async () => {
    try {
      setIsLoading(true)
      const res = (await getListRoutePlanRequest(idEdit)) as any;
      if (indexSelect) {
        setListRoutePlan(res.content as RouteInforInterface[]);
        setListRoutePlanCopy(res.content as RouteInforInterface[]);
      } else {
        setListRoutePlan(res.content?.reverse() as RouteInforInterface[]);
        setListRoutePlanCopy(res.content?.reverse() as RouteInforInterface[]);
      }
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    } finally {
      setTimeout(() => {
        callbackLoading(false);
      }, 1500)
      setIsLoading(false)
    }
  };

  useEffect(() => {
    getListPlanUser();
    getListPlanRoute();
  }, [idEdit]);

  const idUserList = useMemo(() => {
    return listRoutePlan
      .find((i: RouteInforInterface) => i.id === indexSelect)
      ?.plan_route_user_dto_list?.map((i: any) => i?.plan_user?.id);
  }, [indexSelect]);

  const [listIdRemove, setListIdRemove] = useState<number[]>([]);

  useEffect(() => {
    setListIdRemove([]);
  }, [indexSelect]);

  useEffect(() => {
    if (userIdList?.length > 0) {
      const list = [...userIdList].map((item: number) => {
        const obj = { ...listUserPlan.find((i: RouteUser) => i.id === item) };
        const plan_user = obj.id as number;
        if (
          startTime &&
          endTime &&
          (indexSelect === null || (idUserList && !idUserList.includes(plan_user)) || listIdRemove.includes(plan_user))
        ) {
          obj.rangePicker = [dayjs(startTime), dayjs(endTime)];
        } else {
          if (watch('plan_route_user_dto_list') && watch('plan_route_user_dto_list').length > 0) {
            watch('plan_route_user_dto_list').map((p: any) => {
              if (p?.plan_user?.id == obj.id) {
                obj.rangePicker = p.rangePicker;
              }
            });
          }
        }
        obj._id = v4();
        delete obj.id;
        return Object.assign({ plan_user: { id: plan_user } }, obj);
      });
      setValue('plan_route_user_dto_list', list);
      tableUserPlan.replace(list);
    } else {
      setValue('plan_route_user_dto_list', []);
    }
  }, [userIdList]);

  const fromProvinceId = watch('from_province.id');
  const toProvinceId = watch('to_province.id');
  const fromDistrictId = watch('from_district.id');
  const toDistrictId = watch('to_district.id');
  const vehicleId = watch('vehicle.id');

  const getdistanceQuotas = async () => {
    try {
      const res = await getDistantRequest(fromProvinceId, toProvinceId, fromDistrictId, toDistrictId);
      setValue('distance', res);
    } catch (err) {
      console.log(err);
    }
  };

  // useEffect(() => {
  //     setValue("from_district", null);
  //     setValue("distance", null);
  // }, [fromProvinceId]);

  // useEffect(() => {
  //     setValue("to_district", null);
  //     setValue("distance", null);
  // }, [toProvinceId]);

  useEffect(() => {
    if (fromProvinceId && fromDistrictId && toProvinceId && toDistrictId && vehicleId) {
      getdistanceQuotas();
    }
  }, [fromDistrictId, fromProvinceId, toProvinceId, toDistrictId, vehicleId]);

  useEffect(() => {
    if (startTime && endTime && dayjs(startTime).isAfter(dayjs(endTime))) {
      setValue('end_time', null);
      toast('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu', { type: 'error' });
      setFocus('end_time');
    }
    if (!startTime || !endTime) {
      setValue('is_over_night', false);
    }
  }, [startTime, endTime]);

  const [search, setSearch] = useState('');
  const debounce = useDebounce(search, 400);

  useEffect(() => {
    if (debounce) {
      const arrSearch = listRoutePlanCopy.filter(
        (i: RouteInforInterface) =>
          toSlug(i.name as string)?.includes(toSlug(debounce)) ||
          toSlug(i.from_department?.name as string)?.includes(toSlug(debounce)) ||
          toSlug(i.to_department?.name as string)?.includes(toSlug(debounce)) ||
          toSlug(i.from_department_name as string)?.includes(toSlug(debounce)) ||
          toSlug(i.to_department_name as string)?.includes(toSlug(debounce)) ||
          toSlug(dayjs(i.end_time).format('DD/MM/YYYY'))?.includes(toSlug(debounce)) ||
          toSlug(dayjs(i.start_time).format('DD/MM/YYYY'))?.includes(toSlug(debounce)) ||
          toSlug(i.from_department?.code as string)?.includes(toSlug(debounce)) ||
          toSlug(i.to_department?.code as string)?.includes(toSlug(debounce))
      );
      setListRoutePlan(arrSearch);
      setIndexSelect(null);
    } else {
      setListRoutePlan(listRoutePlanCopy);
      setIndexSelect(null);
    }
  }, [debounce]);

  useEffect(() => {
    if (listRoutePlan[0]) {
      setIndexSelect(listRoutePlan[0]?.id);
      const formData = { ...listRoutePlan[0] };
      // setIsAir(listRoutePlan[0]?.vehicle?.is_air);
      formData.start_time = dayjs(formData.start_time);
      formData.end_time = dayjs(formData.end_time);
      formData.select_user = formData?.plan_route_user_dto_list?.map((i: any) => i.plan_user?.id);
      formData?.plan_route_user_dto_list?.map((i: any) => {
        i.rangePicker = i.start_time && i.end_time ? [dayjs(i.start_time), dayjs(i.end_time)] : [null, null];
        i._id = v4();
        return i;
      });
      tableUserPlan.replace(formData.plan_route_user_dto_list);
      reset(formData);
    } else {
      setIndexSelect(null);
      reset({
        from_department: { id: departmentProcess?.value },
        from_country: { id: 192 },
        to_country: { id: 192 },
        select_user: [],
      });
    }
  }, [listRoutePlan.length]);

  const [defaulFrom, setDefaulFrom] = useState<IDefaulOption[]>([{ label: 'Vietnam', value: 192, id: 192 }, {}, {}]);
  const [defaulTo, setDefaulTo] = useState<IDefaulOption[]>([{ label: 'Vietnam', value: 192, id: 192 }, {}, {}]);

  useEffect(() => {
    if (departmentProcess) {
      setValue('from_department.id', departmentProcess.id);
      const arrDefaul: IDefaulOption[] = [{}, {}, {}];
      if (departmentProcess.country) {
        setTimeout(() => {
          setValue('from_country.id', departmentProcess.country?.id);
        }, 100);
        arrDefaul[0] = {
          value: departmentProcess.country?.id,
          id: departmentProcess.country?.id,
          label: departmentProcess.country?.name,
        };
      } else {
        setValue('from_country.id', null);
        setValue('from_province.id', null);
        setValue('from_district.id', null);
      }
      if (departmentProcess.province) {
        setTimeout(() => {
          setValue('from_province.id', departmentProcess.province?.id);
        }, 100);
        arrDefaul[1] = {
          value: departmentProcess.province?.id,
          id: departmentProcess.province?.id,
          label: departmentProcess.province?.name,
        };
        setfrom(departmentProcess.province?.name);
      } else {
        setValue('from_province.id', null);
        setValue('from_district.id', null);
      }
      if (departmentProcess.district) {
        setTimeout(() => {
          setValue('from_district.id', departmentProcess.district?.id);
        }, 100);
        arrDefaul[2] = {
          value: departmentProcess.district?.id,
          id: departmentProcess.district?.id,
          label: departmentProcess.district?.name,
        };
      } else {
        setValue('from_district.id', null);
      }
      setDefaulFrom(arrDefaul);
    }
  }, [departmentProcess]);

  return (
    <div className="route-infor">
      <div className="left-wrap">
        <div className="search-wrap">
          <Input.Search onChange={(e) => setSearch(e.target.value)}></Input.Search>
          <Button
            type={'primary'}
            onClick={() => {
              if (departmentProcess) {
                const arrDefaul: IDefaulOption[] = [{}, {}, {}];
                if (departmentProcess.country) {
                  arrDefaul[0] = {
                    value: departmentProcess.country?.id,
                    id: departmentProcess.country?.id,
                    label: departmentProcess.country?.name,
                  };
                }
                if (departmentProcess.province) {
                  arrDefaul[1] = {
                    value: departmentProcess.province?.id,
                    id: departmentProcess.province?.id,
                    label: departmentProcess.province?.name,
                  };
                  setTimeout(() => {
                    setfrom(departmentProcess.province?.name as string);
                  }, 500);
                }
                if (departmentProcess.district) {
                  arrDefaul[2] = {
                    value: departmentProcess.district?.id,
                    id: departmentProcess.district?.id,
                    label: departmentProcess.district?.name,
                  };
                }
                setDefaulFrom(arrDefaul);
              }
              setDefaulTo([{ label: 'Vietnam', value: 192, id: 192 }, {}, {}]);
              reset({
                from_department: { id: departmentProcess?.id },
                from_country: { id: departmentProcess?.country?.id },
                from_province: { id: departmentProcess?.province?.id },
                from_district: { id: departmentProcess?.district?.id },
                to_department_name: null,
                select_user: [],
              });
              setIndexSelect(null);
              tableUserPlan.replace([]);
              // setIsAir(false);
            }}
          >
            Thêm
          </Button>
        </div>
        <div>
          {isLoading ? (
            <div style={{ textAlign: 'center', marginTop: '10vh' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {listRoutePlan.map((i: RouteInforInterface, index: number) => (
                <CardRoute
                  key={v4()}
                  i={i}
                  index={index}
                  reset={reset}
                  indexSelect={indexSelect}
                  setIndexSelect={setIndexSelect}
                  listRoutePlan={listRoutePlan}
                  getListPlanRoute={getListPlanRoute}
                  tableUserPlan={tableUserPlan}
                // setIsAir={() => setIsAir(i.vehicle.is_air)}
                />
              ))}
            </>
          )}
        </div>
      </div>
      <div>
        {isLoading ? (
          <div style={{ textAlign: 'center', marginTop: '10vh' }}>
            <Spin size="large" />
          </div>
        ) : (
          <>
            <div className="form-route">
              <div>
                <h3>Điểm đi</h3>
                <Row>
                  <Col>
                    <MzFormCheckbox
                      controllerProps={{
                        control,
                        name: 'is_from_internal',
                      }}
                      callback={(e) => {
                        if (!e) {
                          setValue('from_department.id', null);
                        }
                      }}
                      label={'Nội bộ'}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>* </span>
                    {watch('is_from_internal') === false || watch('is_from_internal') === undefined
                      ? 'Tên cơ quan đơn vị đi:'
                      : 'Đơn vị đi:'}
                  </Col>
                  <Col span={16}>
                    {watch('is_from_internal') === false || watch('is_from_internal') === undefined ? (
                      <MzFormInput
                        controllerProps={{
                          control,
                          name: 'from_department_name',
                          rules: {
                            required: 'Vui lòng nhập tên đơn vị',
                            maxLength: { value: 100, message: 'Tên không được quá 100 kí tự' },
                          },
                        }}
                        inputProps={{
                          placeholder: 'Tên cơ quan đơn vị đi',
                        }}
                      />
                    ) : (
                      <MzFormSelectV2
                        labelObj={['code', 'name']}
                        valueObj={'id'}
                        defaultOption={
                          indexSelect !== null
                            ? {
                              value: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_department?.id,
                              id: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_department?.id,
                              label:
                                listRoutePlan.find((i: any) => i.id === indexSelect)?.from_department?.code +
                                ' - ' +
                                listRoutePlan.find((i: any) => i.id === indexSelect)?.from_department?.name,
                            }
                            : {
                              label: (departmentProcess?.code + ' - ' || '') + (departmentProcess?.name || ''),
                              value: departmentProcess?.id,
                              id: departmentProcess?.id,
                            }
                        }
                        controllerProps={{
                          control,
                          name: 'from_department.id',
                          rules: { required: 'Vui lòng nhập đơn vị đi' },
                        }}
                        selectProps={{
                          placeholder: 'Đơn vị đi',
                          allowClear: true,
                          showSearch: true,
                          filterOption: (input, option) => {
                            const optionValue: string | undefined =
                              option?.label !== undefined ? option?.label?.toString() : '';
                            return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                          },
                          style: {
                            width: '100%',
                          },
                          onSelect: (_, record) => {
                            const arrDefaul: IDefaulOption[] = [{}, {}, {}];
                            if (record.country) {
                              setTimeout(() => {
                                setValue('from_country.id', record.country?.id);
                              }, 100);
                              arrDefaul[0] = {
                                value: record.country?.id,
                                id: record.country?.id,
                                label: record.country?.name,
                              };
                            } else {
                              setValue('from_country.id', null);
                              setValue('from_province.id', null);
                              setValue('from_district.id', null);
                            }
                            if (record.province) {
                              setTimeout(() => {
                                setValue('from_province.id', record.province?.id);
                              }, 100);
                              arrDefaul[1] = {
                                value: record.province?.id,
                                id: record.province?.id,
                                label: record.province?.name,
                              };
                              setfrom(record.province?.name);
                            } else {
                              setValue('from_province.id', null);
                              setValue('from_district.id', null);
                            }
                            if (record.district) {
                              setTimeout(() => {
                                setValue('from_district.id', record.district?.id);
                              }, 100);
                              arrDefaul[2] = {
                                value: record.district?.id,
                                id: record.district?.id,
                                label: record.district?.name,
                              };
                            } else {
                              setValue('from_district.id', null);
                            }
                            setDefaulFrom(arrDefaul);
                          },
                        }}
                        uri={'departments?isActive.in=1'}
                        uriSearch={'name.contains='}
                        isFormItem={true}
                      />
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Quốc gia đi:
                  </Col>
                  <Col span={16}>
                    <MzFormSelectV2
                      labelObj={['name']}
                      valueObj={'id'}
                      defaultOption={
                        indexSelect !== null
                          ? {
                            value: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_country?.id,
                            id: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_country?.id,
                            label: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_country?.name,
                          }
                          : defaulFrom[0]
                      }
                      controllerProps={{
                        control,
                        name: 'from_country.id',
                        rules: { required: 'Vui lòng nhập quốc gia đi' },
                      }}
                      selectProps={{
                        placeholder: 'Quốc gia đi',
                        allowClear: true,
                        showSearch: true,
                        filterOption: (input, option) => {
                          const optionValue: string | undefined =
                            option?.label !== undefined ? option?.label?.toString() : '';
                          return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                        },
                        style: {
                          width: '100%',
                        },
                        onSelect: () => {
                          setDefaulFromDistrict(false);
                          setDefaulFromProvince(false);
                        },
                        disabled: type === 1,
                      }}
                      uri={'countries?'}
                      uriSearch={'name.contains='}
                      isFormItem={true}
                      onChangeValue={() => {
                        setValue('from_province.id', null);
                        setValue('from_district.id', null);
                        setValue('distance', null);
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Thành phố đi:
                  </Col>
                  <Col span={16}>
                    <MzFormSelectV2
                      labelObj={['name']}
                      valueObj={'id'}
                      defaultOption={
                        indexSelect !== null
                          ? {
                            value: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_province?.id,
                            id: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_province?.id,
                            label: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_province?.name,
                          }
                          : defaulFrom[1]
                      }
                      controllerProps={{
                        control,
                        name: 'from_province.id',
                        rules: { required: 'Vui lòng nhập thành phố đi' },
                      }}
                      selectProps={{
                        placeholder: 'Thành phố đi',
                        allowClear: true,
                        showSearch: true,
                        filterOption: (input, option) => {
                          const optionValue: string | undefined =
                            option?.label !== undefined ? option?.label?.toString() : '';
                          return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                        },
                        style: {
                          width: '100%',
                        },
                        onSelect: (_, record) => {
                          console.log(record);
                          setDefaulFromDistrict(false);
                        },
                      }}
                      uri={`provinces?countryId=${watch('from_country.id')}`}
                      uriSearch={'name.contains='}
                      isFormItem={true}
                      onChangeValue={(e) => {
                        setfrom(e.label);
                        setValue('from_district.id', null);
                        setValue('distance', null);
                      }}
                      fetchNewUri={true}
                      hasDefaul={defaulFromProvince}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Quận/Huyện:
                  </Col>
                  <Col span={16}>
                    <MzFormSelectV2
                      labelObj={['name']}
                      valueObj={'id'}
                      defaultOption={
                        indexSelect !== null
                          ? {
                            value: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_district?.id,
                            id: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_district?.id,
                            label: listRoutePlan.find((i: any) => i.id === indexSelect)?.from_district?.name,
                          }
                          : defaulFrom[2]
                      }
                      controllerProps={{
                        control,
                        name: 'from_district.id',
                        rules: { required: 'Vui lòng nhập quận huyện' },
                      }}
                      selectProps={{
                        placeholder: 'Quận huyện đi',
                        allowClear: true,
                        showSearch: true,
                        filterOption: (input, option) => {
                          const optionValue: string | undefined =
                            option?.label !== undefined ? option?.label?.toString() : '';
                          return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                        },
                        style: {
                          width: '100%',
                        },
                      }}
                      uri={`districts?provinceId=${watch('from_province.id')}`}
                      uriSearch={'name.contains='}
                      isFormItem={true}
                      fetchNewUri={true}
                      hasDefaul={defaulFromDistrict}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Phố:</Col>
                  <Col span={16}>
                    <MzFormInput
                      controllerProps={{ control, name: 'from_address' }}
                      inputProps={{
                        placeholder: 'Phố',
                        maxLength: 99,
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Ngày bắt đầu:
                  </Col>
                  <Col span={16}>
                    <MzFormDatePicker
                      controllerProps={{
                        control,
                        name: 'start_time',
                        rules: { required: 'Vui lòng nhập ngày bắt đầu' },
                      }}
                      datePickerProps={{
                        placeholder: 'Ngày bắt đầu',
                        format: 'DD/MM/YYYY',
                        onSelect: (e) => {
                          if (
                            endTime &&
                            dayjs(e).isBefore(dayjs(endTime)) &&
                            e.format('DD/MM/YYYY') !== endTime.format('DD/MM/YYYY')
                          ) {
                            setValue('is_over_night', true);
                          }
                          if (endTime && e.format('DD/MM/YYYY') === endTime.format('DD/MM/YYYY')) {
                            setValue('is_over_night', false);
                          }
                          if (watch('end_time')) {
                            setValue(
                              'plan_route_user_dto_list',
                              tableUserPlan.fields?.map((i: any) => {
                                i.rangePicker[0] = e;
                                i.rangePicker[1] = watch('end_time');
                                return i;
                              })
                            );
                          }
                        },
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Phương tiện:
                  </Col>
                  <Col span={16}>
                    <MzFormSelectV2
                      labelObj={['name']}
                      valueObj={'id'}
                      defaultOption={
                        indexSelect !== null
                          ? {
                            value: listRoutePlan.find((i: any) => i.id === indexSelect)?.vehicle?.id,
                            label: listRoutePlan.find((i: any) => i.id === indexSelect)?.vehicle?.name,
                            id: listRoutePlan.find((i: any) => i.id === indexSelect)?.vehicle?.id,
                          }
                          : {}
                      }
                      controllerProps={{
                        control,
                        name: 'vehicle.id',
                        rules: { required: 'Vui lòng nhập phương tiện' },
                      }}
                      selectProps={{
                        placeholder: 'Phương tiện đi',
                        allowClear: true,
                        showSearch: true,
                        filterOption: (input, option) => {
                          const optionValue: string | undefined =
                            option?.label !== undefined ? option?.label?.toString() : '';
                          return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                        },
                        style: {
                          width: '100%',
                        },
                        onSelect: (_, record) => {
                          // setIsAir(record?.is_air);
                          setDefaulVehicle(false);
                        },
                      }}
                      uri={'vehicles?'}
                      uriSearch={'name.contains='}
                      isFormItem={true}
                      hasDefaul={defaulVehicle}
                    />
                  </Col>
                </Row>
              </div>
              <div>
                <h3>Điểm đến</h3>
                <Row>
                  <Col>
                    <MzFormCheckbox
                      controllerProps={{
                        control,
                        name: 'is_to_internal',
                      }}
                      label={'Nội bộ'}
                      callback={(e) => {
                        if (!e) {
                          setValue('to_department.id', null);
                        }
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>* </span>
                    {watch('is_to_internal') === false || watch('is_to_internal') === undefined
                      ? 'Tên cơ quan đơn vị đến:'
                      : 'Đơn vị đến'}
                  </Col>
                  <Col span={16}>
                    {watch('is_to_internal') === false || watch('is_to_internal') === undefined ? (
                      <MzFormInput
                        controllerProps={{
                          control,
                          name: 'to_department_name',
                          rules: {
                            required: 'Vui lòng nhập tên đơn vị',
                            maxLength: { value: 100, message: 'Tên không được quá 100 kí tự' },
                          },
                        }}
                        inputProps={{
                          placeholder: 'Tên cơ quan đơn vị',
                        }}
                      />
                    ) : (
                      <MzFormSelectV2
                        labelObj={['code', 'name']}
                        valueObj={'id'}
                        defaultOption={
                          indexSelect !== null
                            ? {
                              value: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_department?.id,
                              label:
                                listRoutePlan.find((i: any) => i.id === indexSelect)?.to_department?.code +
                                ' - ' +
                                listRoutePlan.find((i: any) => i.id === indexSelect)?.to_department?.name,
                              id: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_department?.id,
                            }
                            : {}
                        }
                        controllerProps={{
                          control,
                          name: 'to_department.id',
                          rules: { required: 'Vui lòng nhập đơn vị đến' },
                        }}
                        selectProps={{
                          placeholder: 'Đơn vị đến',
                          allowClear: true,
                          showSearch: true,
                          filterOption: (input, option) => {
                            const optionValue: string | undefined =
                              option?.label !== undefined ? option?.label?.toString() : '';
                            return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                          },
                          style: {
                            width: '100%',
                          },
                          onSelect: (_, record) => {
                            const arrDefaul: IDefaulOption[] = [{}, {}, {}];
                            if (record.country) {
                              setTimeout(() => {
                                setValue('to_country.id', record.country?.id);
                              }, 100);
                              arrDefaul[0] = {
                                value: record.country?.id,
                                id: record.country?.id,
                                label: record.country?.name,
                              };
                            } else {
                              setValue('to_country.id', null);
                              setValue('to_province.id', null);
                              setValue('to_district.id', null);
                            }
                            if (record.province) {
                              setTimeout(() => {
                                setValue('to_province.id', record.province?.id);
                              }, 100);
                              arrDefaul[1] = {
                                value: record.province?.id,
                                id: record.province?.id,
                                label: record.province?.name,
                              };
                              setTo(record.province?.name);
                            } else {
                              setValue('to_province.id', null);
                              setValue('to_district.id', null);
                            }
                            if (record.district) {
                              setTimeout(() => {
                                setValue('to_district.id', record.district?.id);
                              }, 100);
                              arrDefaul[2] = {
                                value: record.district?.id,
                                id: record.district?.id,
                                label: record.district?.name,
                              };
                            } else {
                              setValue('to_district.id', null);
                            }
                            setDefaulTo(arrDefaul);
                          },
                        }}
                        uri={'departments?isActive.in=1'}
                        uriSearch={'name.contains='}
                        isFormItem={true}
                      />
                    )}
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Quốc gia đến:
                  </Col>
                  <Col span={16}>
                    <MzFormSelectV2
                      labelObj={['name']}
                      valueObj={'id'}
                      defaultOption={
                        indexSelect !== null
                          ? {
                            value: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_country?.id,
                            label: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_country?.name,
                            id: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_country?.id,
                          }
                          : defaulTo[0]
                      }
                      controllerProps={{
                        control,
                        name: 'to_country.id',
                        rules: { required: 'Vui lòng nhập quốc gia đến' },
                      }}
                      selectProps={{
                        placeholder: 'Quốc gia đến',
                        allowClear: true,
                        showSearch: true,
                        filterOption: (input, option) => {
                          const optionValue: string | undefined =
                            option?.label !== undefined ? option?.label?.toString() : '';
                          return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                        },
                        style: {
                          width: '100%',
                        },
                        onSelect: () => {
                          setDefaulToProvince(false);
                          setDefaulToDistrict(false);
                        },
                        disabled: type === 1,
                      }}
                      uri={'countries?'}
                      uriSearch={'name.contains='}
                      isFormItem={true}
                      onChangeValue={() => {
                        setValue('to_province.id', null);
                        setValue('to_district.id', null);
                        setValue('distance', null);
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Thành phố đến:
                  </Col>
                  <Col span={16}>
                    <MzFormSelectV2
                      labelObj={['name']}
                      valueObj={'id'}
                      defaultOption={
                        indexSelect !== null
                          ? {
                            value: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_province?.id,
                            id: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_province?.id,
                            label: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_province?.name,
                          }
                          : defaulTo[1]
                      }
                      controllerProps={{
                        control,
                        name: 'to_province.id',
                        rules: { required: 'Vui lòng nhập thành phố đến' },
                      }}
                      selectProps={{
                        placeholder: 'Thành phố đến',
                        allowClear: true,
                        showSearch: true,
                        filterOption: (input, option) => {
                          const optionValue: string | undefined =
                            option?.label !== undefined ? option?.label?.toString() : '';
                          return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                        },
                        style: {
                          width: '100%',
                        },
                        onSelect: () => setDefaulToDistrict(false),
                      }}
                      uri={`provinces?countryId=${watch('to_country.id')}`}
                      uriSearch={'name.contains='}
                      isFormItem={true}
                      onChangeValue={(e) => {
                        setTo(e.label);
                        setValue('to_district.id', null);
                        setValue('distance', null);
                      }}
                      fetchNewUri={true}
                      hasDefaul={defaulToProvince}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Quận/Huyện:
                  </Col>
                  <Col span={16}>
                    <MzFormSelectV2
                      labelObj={['name']}
                      valueObj={'id'}
                      defaultOption={
                        indexSelect !== null
                          ? {
                            value: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_district?.id,
                            id: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_district?.id,
                            label: listRoutePlan.find((i: any) => i.id === indexSelect)?.to_district?.name,
                          }
                          : defaulTo[2]
                      }
                      controllerProps={{
                        control,
                        name: 'to_district.id',
                        rules: { required: 'Vui lòng nhập quận huyện đến' },
                      }}
                      selectProps={{
                        placeholder: 'Quận huyện đến',
                        allowClear: true,
                        showSearch: true,
                        filterOption: (input, option) => {
                          const optionValue: string | undefined =
                            option?.label !== undefined ? option?.label?.toString() : '';
                          return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                        },
                        style: {
                          width: '100%',
                        },
                      }}
                      uri={`districts?provinceId=${watch('to_province.id')}`}
                      uriSearch={'name.contains='}
                      isFormItem={true}
                      fetchNewUri={true}
                      hasDefaul={defaulToDistrict}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>Phố:</Col>
                  <Col span={16}>
                    <MzFormInput
                      controllerProps={{ control, name: 'to_address' }}
                      inputProps={{
                        placeholder: 'Phố',
                        maxLength: 99,
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col span={8}>
                    <span style={{ color: 'red' }}>*</span> Ngày kết thúc:
                  </Col>
                  <Col span={16}>
                    <MzFormDatePicker
                      controllerProps={{ control, name: 'end_time', rules: { required: 'Vui lòng nhập ngày kết thúc' } }}
                      datePickerProps={{
                        placeholder: 'Ngày kết thúc',
                        format: 'DD/MM/YYYY',
                        onSelect: (e) => {
                          if (
                            startTime &&
                            dayjs(e).isAfter(dayjs(startTime)) &&
                            e.format('DD/MM/YYYY') !== startTime.format('DD/MM/YYYY')
                          ) {
                            setValue('is_over_night', true);
                          }
                          if (startTime && e.format('DD/MM/YYYY') === startTime.format('DD/MM/YYYY')) {
                            setValue('is_over_night', false);
                          }
                          if (watch('start_time')) {
                            setValue(
                              'plan_route_user_dto_list',
                              tableUserPlan.fields?.map((i: any) => {
                                i.rangePicker = [watch('start_time'), e]
                                return i;
                              })
                            );
                          }
                        },
                      }}
                    />
                  </Col>
                </Row>
                <Row>
                  {
                    <>
                      <Col span={8}>
                        <span style={{ color: 'red' }}>*</span> Khoảng cách:
                      </Col>
                      <Col span={16}>
                        <MzFormInput
                          controllerProps={{
                            control,
                            name: 'distance',
                            rules: { required: 'Chưa có thông tin khoảng cách' },
                          }}
                          inputProps={{
                            placeholder: 'Khoảng cách',
                            disabled: true,
                          }}
                        />
                      </Col>
                    </>
                  }
                </Row>
              </div>
            </div>
            <Row>
              <Col>
                <MzFormCheckbox controllerProps={{ control, name: 'is_over_night' }} label={'Qua đêm'} />
              </Col>
            </Row>
            <Row>
              <Col span={3}>
                <MzFormCheckbox
                  controllerProps={{ control, name: 'is_moving_route' }}
                  label={'Là lộ trình di chuyển'}
                  callback={(e) => {
                    if (e) {
                      setValue('is_island', false);
                      setValue('is_sea', false);
                      setValue('is_guest_house', false);
                    }
                  }}
                />
              </Col>
              <Col span={3}></Col>
              <Col span={3}>
                <MzFormCheckbox
                  controllerProps={{ control, name: 'is_sea' }}
                  label={'Tính chi phí công tác biển'}
                  callback={(e) => {
                    if (e) {
                      setValue('is_island', false);
                      setValue('is_moving_route', false);
                      setValue('is_guest_house', false);
                    }
                  }}
                />
              </Col>
              <Col span={3}></Col>
              <Col span={3}>
                <MzFormCheckbox
                  controllerProps={{ control, name: 'is_island' }}
                  label={'Tính chi phí công tác đảo / nhà giàn'}
                  callback={(e) => {
                    if (e) {
                      setValue('is_sea', false);
                      setValue('is_moving_route', false);
                      setValue('is_guest_house', false);
                    }
                  }}
                />
              </Col>
              <Col span={3}></Col>
              <Col span={3}>
                <MzFormCheckbox
                  controllerProps={{ control, name: 'is_guest_house' }}
                  label={'Ở nhà khách'}
                  callback={(e) => {
                    if (e) {
                      setValue('is_sea', false);
                      setValue('is_island', false);
                      setValue('is_moving_route', false);
                    }
                  }}
                />
              </Col>
            </Row>
            <Row style={{ marginTop: 20 }}>
              <Col span={3}>
                <span style={{ color: 'red' }}>*</span> Nhân viên công tác:
              </Col>
              <Col span={21}>
                <MzFormSelect
                  controllerProps={{
                    control,
                    name: 'select_user',
                    rules: { required: 'Vui lòng nhập nhân viên' },
                  }}
                  selectProps={{
                    placeholder: 'Nhân viên công tác',
                    allowClear: true,
                    showSearch: true,
                    mode: 'multiple',
                    options: listUserPlan?.map((i: any) => {
                      i.label =
                        `${i.type === 1 ? 'Nhân viên' : 'Đối tác'}` +
                        `${i.code ? ` - ${i.code}` : ''}` +
                        `${i.name ? ` - ${i.name}` : ''}` +
                        `${i.position ? ` - ${i.position}` : ''}`;
                      i.value = i.id;
                      return i;
                    }),
                    filterOption: (input, option) => {
                      const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                      return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                    },
                    style: {
                      width: '100%',
                    },
                    onSelect: (_, record) => {
                      // tableUserPlan.append(
                      //   Object.assign(record, { rangePicker: [dayjs(startTime), dayjs(endTime)], _id: v4() })
                      // );
                    },
                    onDeselect: (e) => setListIdRemove((pre) => [...pre, e]),
                    open: open,
                    onDropdownVisibleChange: (visible) => setOpen(visible),
                    dropdownRender: (menu) => (
                      <div
                        onMouseDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        {menu}
                      </div>
                    ),
                  }}
                />
              </Col>
            </Row>
            <Row>
              <h3>Danh sách cán bộ công tác theo lộ trình</h3>
            </Row>
            <Row>
              <div style={{ width: '71vw', marginBottom: 30 }}>
                <TableData
                  tableProps={{
                    columns: columns,
                    dataSource: tableUserPlan.fields,
                    rowKey: '_id',
                    scroll: { x: 1300 },
                  }}
                />
              </div>
            </Row>
          </>
        )}
      </div>
    </div>
  );
});

export default RouteInfor;

const CardRoute = ({
  i,
  index,
  indexSelect,
  setIndexSelect,
  listRoutePlan,
  getListPlanRoute,
  tableUserPlan,
  reset,
}: // setIsAir,
  any) => {
  const [openPopover, setOpenPopover] = useState(false);
  const handleOpenChange = (newOpen: boolean) => {
    setOpenPopover(newOpen);
  };
  return (
    <div
      className={`route-wrap ${i.id === indexSelect && 'route-select'}`}
      key={v4()}
      onClick={() => {
        // setIsAir();
        setIndexSelect(i.id);
        const formData = { ...listRoutePlan[index] };
        formData.start_time = dayjs(formData.start_time);
        formData.end_time = dayjs(formData.end_time);
        formData.select_user = formData.plan_route_user_dto_list?.map((i: any) => i.plan_user?.id);
        formData.plan_route_user_dto_list.map((i: any) => {
          i.rangePicker = i.start_time && i.end_time ? [dayjs(i.start_time), dayjs(i.end_time)] : [null, null];
          return i;
        });
        tableUserPlan.replace(formData.plan_route_user_dto_list);
        reset(formData);
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ flex: 1, fontWeight: 'bold', fontSize: '18px' }}>{i.name || ''}</div>
        <div>
          <CloseOutlined
            onClick={(e) => {
              e.stopPropagation();
              setOpenPopover(true);
            }}
            style={{ width: 20, height: 20 }}
          />
        </div>
        <Popover
          content={
            <Space>
              <Button
                style={{ width: 40, height: 25, padding: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenPopover(false);
                }}
              >
                Hủy
              </Button>
              <Button
                style={{ width: 40, height: 25, padding: 0 }}
                onClick={async (e) => {
                  e.stopPropagation();
                  try {
                    await deleteRouteRequest(i.id);
                    toast('Xóa thành công', { type: 'success' });
                    setTimeout(() => {
                      getListPlanRoute();
                    }, 1000);
                  } catch (err) {
                    toast(getMessageError(err), { type: 'error' });
                  }
                }}
              >
                Xóa
              </Button>
            </Space>
          }
          title="Chắc chắn xóa lộ trình?"
          trigger="click"
          open={openPopover}
          onOpenChange={handleOpenChange}
        ></Popover>
      </div>
      <Row>
        <Col span={9}>
          <h3>{i.is_from_internal ? 'Đơn vị đi' : 'Tên cơ quan đơn vị đi'}</h3>
        </Col>
        <Col span={1}>:</Col>
        <Col style={{ textAlign: 'right' }} span={14}>
          {!i.is_from_internal ? i.from_department_name : i.from_department?.name || ''}
        </Col>
      </Row>
      <Row>
        <Col span={9}>
          <h3>{i.is_to_internal ? 'Đơn vị đến' : 'Tên cơ quan đơn vị đến'}</h3>
        </Col>
        <Col span={1}>:</Col>
        <Col style={{ textAlign: 'right' }} span={14}>
          {!i.is_to_internal ? i.to_department_name : i.to_department?.name || ''}
        </Col>
      </Row>
      <Row>
        <Col span={9}>
          <h3>Ngày bắt đầu</h3>
        </Col>
        <Col span={1}>:</Col>
        <Col style={{ textAlign: 'right' }} span={14}>
          {dayjs(i.start_time).format('DD/MM/YYYY') || ''}
        </Col>
      </Row>
      <Row>
        <Col span={9}>
          <h3>Ngày kết thúc</h3>
        </Col>
        <Col span={1}>:</Col>
        <Col style={{ textAlign: 'right' }} span={14}>
          {dayjs(i.end_time).format('DD/MM/YYYY') || ''}
        </Col>
      </Row>
    </div>
  );
};

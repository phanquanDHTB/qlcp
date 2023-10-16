/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Button, Card, Col, Modal, Row, Spin, Tabs, TabsProps } from 'antd';
import { EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { FieldValues, useFieldArray, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import Search from 'antd/es/input/Search';
import { useDebounce } from 'usehooks-ts';
import toSlug from '@utils/toSlug';
import TableData from '@components/TableData';
import { v4 } from 'uuid';
import { MzFormCheckbox } from '@components/forms/FormCheckbox';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { formatWithTzVN } from '@utils/dateUtils';
import { IDepartment, IDistrict, IPlan, IProvince, IUser, RouteInfor, Vehicle } from 'type';
import getMessageError from '@utils/getMessageError';
import { call } from '../../../apis/baseRequest';
import { getAllPlanRouteUserByPlanRoute, getPlanConfirm } from '../../../apis/plan-confirm/index';
import {
  addConfirm,
  changeInforConfirmRequest,
  getInforRequestConfirmRequest,
  getListPlanRouteRequest,
  getPlanRequest,
} from '../../../apis/page/business/plan/confirm-infor';
import { getFileRequest } from '../../../apis/page/business/confirm-plan';
import { getInforUserRequest } from '../../../apis/page/business/plan/infor-modal';
import utc from 'dayjs';
import tz from 'dayjs';

dayjs.extend(utc)
dayjs.extend(tz)

type ConfirmProps = {
  idEdit?: number | null;
  departmentProcess?: IDepartment;
  idDetails: number | null;
  handleCancel?: () => void;
  callback?: (data: boolean) => void;
};
export const enum planConfirmUserStatus {
  CHO_XAC_NHAN = 1,
  DA_XAC_NHAN = 2,
}

export type UserPlan = {
  code?: string;
  confirm_date?: string;
  department_require?: IDepartment;
  description?: string;
  end_time?: string;
  from_district?: IDistrict;
  from_province?: IProvince;
  start_time?: string;
  to_district?: IDistrict;
  to_province?: IProvince;
  id?: number;
  plan?: IPlan;
  plan_route?: RouteInfor;
  plan_confirm_user: any;
  total_user?: number;
  user_require?: IUser;
  vehicle?: Vehicle;
  status: number;
};

type ConfirmPlan = {
  checkin_file?: string;
  checkin_latitude?: string;
  checkin_location?: string;
  checkin_longitude?: string;
  checkin_time?: string;
  email?: string;
  end_time_reality?: string;
  from_date?: string;
  from_district_id?: number;
  from_district_name?: string;
  from_province_id?: number;
  from_province_name?: string;
  to_date?: string;
  to_district_id?: number;
  to_district_name?: string;
  to_province_id?: number;
  to_province_name?: string;
  is_business?: boolean;
  name?: string;
  status?: number;
  plan_route_user_id?: number;
  plan_user_id?: number;
  total_night?: number;
  vehicle_id?: number;
  vehicle_name?: string;
  user_name?: string;
  _id?: string;
};

const ConfirmInfo = forwardRef((props: ConfirmProps, ref) => {
  const {
    idDetails,
    handleCancel,
    callback = () => {
      return;
    },
  } = props;

  const [user, setUser] = useState<any>({});
  useEffect(() => {
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    const res = (await getInforUserRequest()) as any;
    if (res.status == 'success') {
      setUser(res.data);
    }
  };

  const [listUserPlan, setListUserPlan] = useState<UserPlan[]>([]);
  const [listRoutePlan, setListRoutePlan] = useState<RouteInfor[]>([]);
  const [listConfirmPlan, setListConfirmPlan] = useState<ConfirmPlan[]>([]);
  const [listConfirmPlanClone, setListConfirmPlanClone] = useState<ConfirmPlan[]>([]);
  const [routeSelect, setRouteSelect] = useState<RouteInfor>();
  const [dataConfirm, setDataConfirm] = useState<any>([]);
  const [isOpendDemand, setOpenDemand] = useState(false);

  const [planDetails, setPlanDetails] = useState<IPlan>();

  const [modalImg, setModalImg] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);
  const dowloadFileImg = async (file: string, index: number) => {
    const img = document.createElement('img');
    img.id = `img-${index}`;
    img.style.width = '300px';
    img.style.objectFit = 'contain';
    img.style.padding = '0px auto';
    const wrapImg: any = document.getElementById('img-wrap');
    if (wrapImg) {
      wrapImg.appendChild(img);
    }
    try {
      setLoadingImg(true);
      const res = (await getFileRequest(file)) as any;
      const urlCreator = window.URL || window.webkitURL;
      const immg: any = document.getElementById(`img-${index}`);
      if (immg) {
        immg.src = urlCreator.createObjectURL(res);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingImg(false);
    }
  };

  const getListPlanRoute = async (isSetRouteSelect = true) => {
    try {
      const res = (await getListPlanRouteRequest(idDetails)) as any;
      setListRoutePlan(res.content as RouteInfor[]);
      if (isSetRouteSelect) {
        setRouteSelect(res.content[0] as RouteInfor);
      }
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };

  const getPlan = async () => {
    try {
      const res = (await getPlanRequest(idDetails)) as IPlan;

      setPlanDetails(res);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };

  const [loading, setLoading] = useState(false);
  const handleSelectRoute = (record: any) => {
    getAllPlanRouteUserByPlanRoute(record.id)
      .then((res: any) => {
        const data = res.data?.map((i: ConfirmPlan) => {
          i._id = v4();
          return i;
        });
        setListConfirmPlan(data);
        setListConfirmPlanClone(data);
      })
      .catch((error) => {
        console.log(error, 'error');
      });
    setLoading(true);
    getPlanConfirm(record)
      .then((res) => {
        setListUserPlan(res as UserPlan[]);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (listRoutePlan.length > 0) {
      handleSelectRoute(listRoutePlan[0]);
    }
  }, [listRoutePlan]);

  useEffect(() => {
    getListPlanRoute();
    getPlan();
  }, [idDetails]);

  const staffColumn: ColumnsType<any> = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      width: 60,
      align: 'center',
      render: (_, __, rowIndex) => rowIndex + 1,
    },
    {
      title: 'Tên thành viên',
      width: 200,
      dataIndex: 'name',
      key: 'STT',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'plan_user',
      width: 200,
      render: (v) => <a href={`mailto:${v}`}>{v}</a>,
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone_number',
      key: 'plan_user',
      width: 130,
      render: (v) => <a href={`tel:${v}`}>{v}</a>,
    },
    {
      title: 'Ngày bắt đầu thực tế',
      dataIndex: 'from_date',
      width: 200,
      align: 'center',
      render: (v, record) => (v && record.status === 2 && record.is_business ? dayjs(v).format('DD/MM/YYYY') : '--'),
    },
    {
      title: 'Ngày kết thúc thực tế',
      dataIndex: 'to_date',
      width: 200,
      align: 'center',
      render: (v, record) => (v && record.status === 2 && record.is_business ? dayjs(v).format('DD/MM/YYYY') : '--'),
    },
    {
      title: 'Số đêm ở nhà nghỉ',
      dataIndex: 'total_night',
      align: 'center',
      width: 200,
      render: (v, record) => (v && record.status === 2 && record.is_business ? v : '--'),
    },
    {
      title: 'Có đi công tác ?',
      dataIndex: 'is_business',
      align: 'center',
      width: 150,
      render: (v) => {
        return v ? <div style={{ textAlign: 'center' }}> Có </div> : <div style={{ textAlign: 'center' }}> Không </div>;
      },
    },
    {
      title: 'Ở nhà khách',
      dataIndex: 'is_guest_house',
      align: 'center',
      width: 150,
      render: (v) => {
        return v ? <div style={{ textAlign: 'center' }}> Có </div> : <div style={{ textAlign: 'center' }}> Không </div>;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: 150,
      fixed: 'right',
      render: (value) => {
        let res;
        switch (value) {
          case 1:
            res = 'Chờ xác nhận';
            break;
          case 2:
            res = 'Xác nhận';
            break;
          case 3:
            res = 'Từ chối';
            break;

          default:
            res = 'Chưa xác nhận';
            break;
        }
        return res;
      },
    },
  ];

  const [detailData, setDetailData] = useState<any>([]);

  const detailForm = useForm();
  const detailPerson = useFieldArray({
    control: detailForm.control,
    name: 'plan_confirm_user',
    keyName: '_id',
  });

  const getInforRequestConfirm = async (id: any) => {
    try {
      const res = (await getInforRequestConfirmRequest(id)) as any;
      setDetailData(res);
      const data = res.plan_confirm_user?.map((i: any) => {
        if (i.from_date) {
          i.from_date = dayjs(i.from_date);
        }
        if (i.to_date) {
          i.to_date = dayjs(i.to_date);
        }
        return i;
      });
      const formData = {
        department_require: { id: res.department_require?.id },
        code: res.code,
        confirm_date: res.confirm_date,
        description: res.description,
        end_time: res.end_time,
        from_district: { id: res.from_district?.id },
        from_province: { id: res.from_province?.id },
        id: res.id,
        ins_date: res.ins_date,
        ins_id: res.ins_id,
        plan: { id: res.plan?.id },
        plan_confirm_user: data,
        plan_route: { id: res.plan_route?.id },
        reason: res.reason,
        start_time: res.start_time,
        status: res.status,
        to_district: { id: res.to_district?.id },
        to_province: { id: res.to_province?.id },
        total_user: res.total_user,
        upd_date: res.upd_date,
        upd_id: res.upd_id,
        user_require: { id: res.user_require?.id },
        vehicle: { id: res.vehicle?.id },
      };
      detailForm.reset(formData);
      detailForm.setValue('plan_confirm_user', data);
    } catch (err) {
      console.log(err);
    }
  };

  const [isView, setIsView] = useState(false);

  const [id, setId] = useState<{ code?: string; id: number } | null>(null);
  const [isOpenDelete, setIsOpenDelete] = useState(false);

  const workConfirmation: ColumnsType<any> = [
    {
      title: 'STT',
      dataIndex: 'index',
      width: '5%',
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Mã xác nhận',
      dataIndex: 'code',
      width: '10%',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'ins_date',
      align: 'center',
      width: '10%',
      render: (date) => {
        return date ? dayjs(date).format('DD/MM/YYYY') : '--';
      },
    },
    {
      title: 'Ngày duyệt',
      dataIndex: 'confirm_date',
      width: '10%',
      align: 'center',
      render: (date) => {
        return date ? dayjs(date).format('DD/MM/YYYY') : '--';
      },
    },
    {
      title: 'Số thành viên',
      dataIndex: 'total_user',
      width: '10%',
      align: 'right',
      render: (_, recordValue) => {
        const planConfirmUser = recordValue['plan_confirm_user'];
        if (Array.isArray(planConfirmUser) && planConfirmUser.length > 0) {
          return (
            <div style={{ textAlign: 'center' }}>
              {planConfirmUser.filter((i) => i.is_business == true).length}/{planConfirmUser.length}
            </div>
          );
        } else {
          return '--';
        }
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      width: '10%',
      align: 'center',
      render: (value) => {
        let res;
        switch (value) {
          case 1:
            res = 'Chờ xác nhận';
            break;
          case 2:
            res = 'Xác nhận';
            break;
          case 3:
            res = 'Từ chối';
            break;

          default:
            res = 'Chưa xác nhận';
            break;
        }
        return res;
      },
    },
    {
      title: 'Quản trị',
      width: '10%',
      align: 'center',
      dataIndex: 'id',
      render: (v, record) => {
        return (
          <div className="btn_actionInvoices">
            <Button
              icon={
                <EyeOutlined
                  style={{ padding: 10, cursor: 'pointer' }}
                />
              }
              style={{ border: 'none', backgroundColor: 'white' }}
              onClick={() => {
                setOpenDemand(true);
                getInforRequestConfirm(v);
                setIsView(true);
              }}
            ></Button>
            {record.status === 1 && (
              <>
                <Button
                  icon={
                    <EditOutlined
                      style={{ padding: 10, cursor: 'pointer' }}
                    />
                  }
                  onClick={() => {
                    setOpenDemand(true);
                    getInforRequestConfirm(v);
                  }}
                  disabled={(user?.id === planDetails?.ins_id || user?.id === planDetails?.user_process?.id) ? false : true}
                  style={{ border: 'none', backgroundColor: 'white' }}
                ></Button>
                <Button
                  icon={
                    <DeleteOutlined
                      style={{ padding: 10, cursor: 'pointer' }}
                    />
                  }
                  disabled={(user?.id === planDetails?.ins_id || user?.id === planDetails?.user_process?.id) ? false : true}
                  style={{ border: 'none', backgroundColor: 'white' }}
                  onClick={() => {
                    setIsOpenDelete(true);
                    setId({
                      code: record.code,
                      id: record.id,
                    });
                  }}
                ></Button>
              </>
            )}
          </div>
        );
      },
    },
  ];

  console.log(isOpendDemand);

  const [routeSearch, setRouteSearch] = useState('');
  const debounce = useDebounce(routeSearch, 400);

  useEffect(() => {
    if (debounce) {
      const userList = listConfirmPlanClone.filter(
        (i: any) =>
          toSlug(i.name)?.includes(toSlug(debounce)) ||
          toSlug(i.email)?.includes(toSlug(debounce)) ||
          toSlug(i.phone_number)?.includes(toSlug(debounce)) ||
          toSlug(dayjs(i?.end_time_reality).format('DD/MM/YYYY'))?.includes(toSlug(debounce)) ||
          toSlug(dayjs(i?.start_time_reality).format('DD/MM/YYYY'))?.includes(toSlug(debounce))
      );
      setListConfirmPlan(userList);
    } else {
      setListConfirmPlan(listConfirmPlanClone);
    }
  }, [debounce]);

  useImperativeHandle(ref, () => ({
    isConfirm: dataConfirm.length !== 0,
    openModal: () => setIsOpen(true),
  }));

  const [defaul1, setDefaul1] = useState(true);
  const [defaul2, setDefaul2] = useState(true);
  const [defaul3, setDefaul3] = useState(true);
  const [defaul4, setDefaul4] = useState(true);
  const [defaul5, setDefaul5] = useState(true);

  const [defaulDetail1, setDefaulDetail1] = useState(true);
  const [defaulDetail2, setDefaulDetail2] = useState(true);
  const [defaulDetail3, setDefaulDetail3] = useState(true);
  const [defaulDetail4, setDefaulDetail4] = useState(true);
  const [defaulDetail5, setDefaulDetail5] = useState(true);

  const [isOpend, setIsOpen] = useState(false);

  const { control, setValue, watch, handleSubmit, clearErrors } = useForm();

  const columnsRoute = [
    {
      title: 'STT',
      dataIndex: 'STT',
      width: 100,
      render: (_, __, rowIndex) => rowIndex + 1,
    },
    {
      title: 'Thành phố đi',
      dataIndex: 'from_province',
      width: 400,
      render: () => {
        return (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaul1 && routeSelect
                ? {
                  label: routeSelect.from_province.name,
                  value: routeSelect.from_province?.id,
                  id: routeSelect.from_province?.id,
                }
                : {}
            }
            controllerProps={{
              control,
              name: 'from_province.id',
              rules: { required: 'Vui lòng nhập thành phố đi' },
            }}
            selectProps={{
              placeholder: 'Thành phố đi',
              // allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => {
                setDefaul1(false);
                setDefaul2(false);
              },
            }}
            uri={`provinces?countryId=${routeSelect ? routeSelect.from_country.id : ''}`}
            uriSearch={'name.contains='}
            isFormItem={true}
            onChangeValue={() => {
              setValue('from_district.id', null);
            }}
          />
        );
      },
    },
    {
      title: 'Quận/Huyện đi',
      dataIndex: 'from_district',
      width: 400,
      render: () => {
        return (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaul2 && routeSelect
                ? {
                  label: routeSelect.from_district?.name,
                  value: routeSelect.from_district?.id,
                  id: routeSelect.from_district?.id,
                }
                : {}
            }
            controllerProps={{
              control,
              name: 'from_district.id',
              rules: { required: 'Vui lòng nhập quận huyện' },
            }}
            selectProps={{
              placeholder: 'Quận huyện đi',
              // allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => setDefaul2(false),
            }}
            uri={`districts?provinceId=${watch('from_province.id')}`}
            uriSearch={'name.contains='}
            isFormItem={true}
            fetchNewUri={true}
          />
        );
      },
    },
    {
      title: 'Thành phố đến',
      dataIndex: 'to_province',
      width: 400,
      render: () => {
        return (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaul3 && routeSelect
                ? {
                  label: routeSelect.to_province?.name,
                  value: routeSelect.to_province?.id,
                  id: routeSelect.to_province?.id,
                }
                : {}
            }
            controllerProps={{
              control,
              name: 'to_province.id',
              rules: { required: 'Vui lòng nhập thành phố đến' },
            }}
            selectProps={{
              placeholder: 'Thành phố đến',
              // allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => {
                setDefaul3(false);
                setDefaul4(false);
              },
            }}
            uri={`provinces?countryId=${routeSelect ? routeSelect.to_country.id : ''}`}
            uriSearch={'name.contains='}
            isFormItem={true}
            onChangeValue={() => {
              setValue('to_district.id', null);
            }}
          />
        );
      },
    },
    {
      title: 'Quận/Huyện đến',
      dataIndex: 'to_district',
      width: 400,
      render: () => {
        return (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaul4 && routeSelect
                ? {
                  label: routeSelect.to_district?.name,
                  value: routeSelect.to_district?.id,
                  id: routeSelect.to_district?.id,
                }
                : {}
            }
            controllerProps={{
              control,
              name: 'to_district.id',
              rules: { required: 'Vui lòng nhập quận huyện đến' },
            }}
            selectProps={{
              placeholder: 'Quận huyện đến',
              // allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => setDefaul4(false),
            }}
            uri={`districts?provinceId=${watch('to_province.id')}`}
            uriSearch={'name.contains='}
            isFormItem={true}
            fetchNewUri={true}
          />
        );
      },
    },
    {
      title: 'Phương tiện công tác',
      dataIndex: 'vehicle',
      width: 400,
      render: () => {
        return (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaul5 && routeSelect
                ? {
                  label: routeSelect.vehicle?.name,
                  value: routeSelect.vehicle?.id,
                  id: routeSelect.vehicle?.id,
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
              // allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => setDefaul5(false),
            }}
            uri={'vehicles?'}
            uriSearch={'name.contains='}
            isFormItem={true}
          />
        );
      },
    },
  ];

  useEffect(() => {
    if (routeSelect) {
      setValue('from_province.id', routeSelect.from_province?.id);
      setValue('to_province.id', routeSelect.to_province?.id);
      setValue('from_district.id', routeSelect.from_district?.id);
      setValue('to_district.id', routeSelect.to_district?.id);
      setValue('vehicle.id', routeSelect.vehicle?.id);
      setValue('plan', planDetails);
      setValue('plan_route.id', routeSelect.id);
      //   setValue("plan_checkin", []);
      //   setValue("plan_confirm_user", dataUser.fields);
      //   setValue("totalUser", dataConfirm.length);
    }
  }, [routeSelect]);

  const columnsRouteUser = [
    {
      title: 'STT',
      dataIndex: 'STT',
      width: 100,
      render: (_, __, rowIndex) => rowIndex + 1,
    },
    {
      title: 'Mã nhân viên',
      width: 400,
      dataIndex: 'code',
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      width: 400,
    },
    {
      title: 'Đi công tác',
      dataIndex: 'is_business',
      align: 'center',
      width: 400,
      render: (_, __, index) => (
        <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
          <MzFormCheckbox
            controllerProps={{
              control,
              name: `plan_confirm_user.${index}.is_business`,
            }}
            callback={(e) => {
              if (!e) {
                setValue(`plan_confirm_user.${index}.from_date`, null);
                setValue(`plan_confirm_user.${index}.to_date`, null);
                setValue(`plan_confirm_user.${index}.total_night`, null);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: 'Ở nhà khách',
      dataIndex: 'is_guest_house',
      align: 'center',
      width: 400,
      render: (_, __, index) => (
        <div style={{ marginTop: 30, display: 'flex', justifyContent: 'center' }}>
          <MzFormCheckbox
            controllerProps={{
              control,
              name: `plan_confirm_user.${index}.is_guest_house`,
            }}
          />
        </div>
      ),
    },
    {
      title: 'Từ ngày',
      dataIndex: 'STT',
      width: 400,
      render: (_, __, index) => (
        <div>
          <MzFormDatePicker
            controllerProps={{
              control,
              name: `plan_confirm_user.${index}.from_date`,
              rules: {
                validate: (e) => {
                  if (watch(`plan_confirm_user.${index}.is_business`)) {
                    if (!e) {
                      return 'Vui lòng chọn ngày công tác của nhân viên'
                    }
                  }
                  return true;
                },
              },
            }}
            datePickerProps={{
              placeholder: 'Từ ngày',
              format: ['DD/MM/YYYY'],
              disabled: !watch(`plan_confirm_user.${index}.is_business`),
            }}
            isForm={false}
          />
        </div>
      ),
    },
    {
      title: 'Đến ngày',
      dataIndex: 'STT',
      width: 400,
      render: (_, __, index) => (
        <div style={{ marginTop: 5 }}>
          <MzFormDatePicker
            controllerProps={{
              control,
              name: `plan_confirm_user.${index}.to_date`,
              rules: {
                validate: (e) => {
                  if (watch(`plan_confirm_user.${index}.is_business`)) {
                    if (!e) {
                      return 'Vui lòng chọn ngày công tác của nhân viên'
                    }
                  }
                  if (e && watch(`plan_confirm_user.${index}.from_date`)) {
                    if (
                      e.format('DD/MM/YYYY') === watch(`plan_confirm_user.${index}.from_date`).format('DD/MM/YYYY') ||
                      dayjs(e).isAfter(dayjs(watch(`plan_confirm_user.${index}.from_date`)))
                    ) {
                      return true;
                    } else {
                      return 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu';
                    }
                  }
                  return true;
                },
              },
            }}
            datePickerProps={{
              placeholder: 'Đến ngày',
              format: ['DD/MM/YYYY'],
              disabled: !watch(`plan_confirm_user.${index}.is_business`),
            }}
            isForm={false}
          />
        </div>
      ),
    },
    {
      title: 'Số ngày qua đêm',
      dataIndex: 'total_night',
      width: 400,
      render: (_, __, index) => (
        <div style={{ marginTop: 30 }}>
          <MzFormInput
            controllerProps={{
              control,
              name: `plan_confirm_user.${index}.total_night`,
            }}
            inputProps={{
              type: 'number',
              disabled: !watch(`plan_confirm_user.${index}.is_business`),
            }}
          />
        </div>
      ),
    },
    {
      title: 'TG checkin',
      dataIndex: 'checkin_time',
      width: 400,
      render: (v) => (v ? dayjs.tz(v, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') : '--'),
    },
    {
      title: 'Địa điểm checkin',
      dataIndex: 'checkin_location',
      width: 400,
      render: (v, recordValue) => {
        return v ? (
          <a
            target="blank"
            href={`https://www.google.com/maps/@${recordValue.checkin_latitude + ',' + recordValue.checkin_longitude
              }z?entry=ttu`}
          >
            {v}
          </a>
        ) : (
          '--'
        );
      },
    },
    {
      title: 'Link ảnh checkin',
      dataIndex: 'checkin_file',
      width: 400,
      render: (v) =>
        v ? (
          <a
            onClick={() => {
              setModalImg(true);
              setTimeout(() => {
                const listUrl = v.split(',');
                if (listUrl.length) {
                  listUrl.forEach((i: string, index) => {
                    dowloadFileImg(i, index);
                  });
                }
              }, 500);
            }}
          >
            {v}
          </a>
        ) : (
          '--'
        ),
    },
  ];

  const [loadingConfirm, setLoadingConfirm] = useState(false)

  const SubmitForm = async (value: FieldValues) => {
    try {
      setLoadingConfirm(true)
      const data = {
        ...value,
        total_user: value?.plan_confirm_user?.length,
        plan_confirm_user: value?.plan_confirm_user?.map((i: any) => {
          if (i.from_date) {
            i.from_date = formatWithTzVN(i.from_date);
          }
          if (i.to_date) {
            i.to_date = formatWithTzVN(i.to_date);
          }
          return i;
        }),
      };
      await addConfirm(data);
      getListPlanRoute(false)
      handleDefaul();
      toast('Lưu thành công', { type: 'success' });
      setIsOpen(false);
      handleSelectRoute(routeSelect);
      callback(false);
    } catch (error) {
      console.log(error);
      toast(getMessageError(error), { type: 'error' });
    } finally {
      setLoadingConfirm(false)
    }
  };

  const columnRouteDetail = [
    {
      title: 'STT',
      dataIndex: 'STT',
      width: 100,
      render: (_, __, rowIndex) => rowIndex + 1,
    },
    {
      title: 'Thành phố đi',
      dataIndex: 'from_province',
      width: 400,
      render: () => {
        return isView ? (
          detailData?.from_province?.name
        ) : (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaulDetail1
                ? {
                  label: detailData?.from_province?.name,
                  value: detailData?.from_province?.id,
                  id: detailData?.from_province?.id,
                }
                : {}
            }
            controllerProps={{
              control: detailForm.control,
              name: 'from_province.id',
              rules: { required: 'Vui lòng nhập thành phố đi' },
            }}
            selectProps={{
              placeholder: 'Thành phố đi',
              allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => {
                setDefaulDetail1(false);
                setDefaulDetail2(false);
              },
            }}
            uri={`provinces?countryId=${routeSelect ? routeSelect.from_country.id : ''}`}
            uriSearch={'name.contains='}
            isFormItem={true}
            onChangeValue={() => {
              detailForm.setValue('from_district.id', null);
            }}
          />
        );
      },
    },
    {
      title: 'Quận/Huyện đi',
      dataIndex: 'from_district',
      width: 400,
      render: () => {
        return isView ? (
          detailData.from_district?.name
        ) : (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaulDetail2
                ? {
                  label: detailData.from_district?.name,
                  value: detailData.from_district?.id,
                  id: detailData.from_district?.id,
                }
                : {}
            }
            controllerProps={{
              control: detailForm.control,
              name: 'from_district.id',
              rules: { required: 'Vui lòng nhập quận huyện' },
            }}
            selectProps={{
              placeholder: 'Quận huyện đi',
              allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => {
                setDefaulDetail2(false);
              },
            }}
            uri={`districts?provinceId=${detailForm.watch('from_province.id')}`}
            uriSearch={'name.contains='}
            isFormItem={true}
            fetchNewUri={true}
          />
        );
      },
    },
    {
      title: 'Thành phố đến',
      dataIndex: 'to_province',
      width: 400,
      render: () => {
        return isView ? (
          detailData.to_province?.name
        ) : (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaulDetail3
                ? {
                  label: detailData.to_province?.name,
                  value: detailData.to_province?.id,
                  id: detailData.to_province?.id,
                }
                : {}
            }
            controllerProps={{
              control: detailForm.control,
              name: 'to_province.id',
              rules: { required: 'Vui lòng nhập thành phố đến' },
            }}
            selectProps={{
              placeholder: 'Thành phố đến',
              allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => {
                setDefaulDetail3(false);
                setDefaulDetail4(false);
              },
            }}
            uri={`provinces?countryId=${routeSelect ? routeSelect.to_country.id : ''}`}
            uriSearch={'name.contains='}
            isFormItem={true}
            onChangeValue={() => {
              detailForm.setValue('to_district.id', null);
            }}
          />
        );
      },
    },
    {
      title: 'Quận/Huyện đến',
      dataIndex: 'to_district',
      width: 400,
      render: () => {
        return isView ? (
          detailData.to_district?.name
        ) : (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaulDetail4
                ? {
                  label: detailData.to_district?.name,
                  value: detailData.to_district?.id,
                  id: detailData.to_district?.id,
                }
                : {}
            }
            controllerProps={{
              control: detailForm.control,
              name: 'to_district.id',
              rules: { required: 'Vui lòng nhập quận huyện đến' },
            }}
            selectProps={{
              placeholder: 'Quận huyện đến',
              // allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => {
                setDefaulDetail4(false);
              },
            }}
            uri={`districts?provinceId=${detailForm.watch('to_province.id')}`}
            uriSearch={'name.contains='}
            isFormItem={true}
            fetchNewUri={true}
          />
        );
      },
    },
    {
      title: 'Phương tiện công tác',
      // dataIndex: "vehicle",
      width: 400,
      render: () => {
        return isView ? (
          detailData.vehicle?.name
        ) : (
          <MzFormSelectV2
            labelObj={['name']}
            valueObj={'id'}
            defaultOption={
              defaulDetail5
                ? {
                  label: detailData.vehicle?.name,
                  value: detailData.vehicle?.id,
                  id: detailData.vehicle?.id,
                }
                : {}
            }
            controllerProps={{
              control: detailForm.control,
              name: 'vehicle.id',
              rules: { required: 'Vui lòng nhập phương tiện' },
            }}
            selectProps={{
              placeholder: 'Phương tiện đi',
              // allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              onSelect: () => {
                setDefaulDetail5(false);
              },
            }}
            uri={'vehicles?'}
            uriSearch={'name.contains='}
            isFormItem={true}
          />
        );
      },
    },
  ];

  const columnsRouteUserDetail = [
    {
      title: 'STT',
      dataIndex: 'STT',
      width: 100,
      render: (_, __, rowIndex) => rowIndex + 1,
    },
    {
      title: 'Mã nhân viên',
      width: 200,
      dataIndex: 'code',
      render: (v) => v || '--',
    },
    {
      title: 'Họ tên',
      dataIndex: 'full_name',
      width: 400,
    },
    {
      title: 'Đi công tác',
      dataIndex: 'is_business',
      width: 200,
      align: 'center',
      render: (_, __, index) => (
        <div style={{ marginBottom: '-20px', display: 'flex', justifyContent: 'center' }}>
          <MzFormCheckbox
            controllerProps={{
              control: detailForm.control,
              name: `plan_confirm_user.${index}.is_business`,
            }}
            checkboxProps={{
              disabled: isView,
            }}
            callback={(e) => {
              if (!e && !isView) {
                detailForm.setValue(`plan_confirm_user.${index}.from_date`, null);
                detailForm.setValue(`plan_confirm_user.${index}.to_date`, null);
                detailForm.setValue(`plan_confirm_user.${index}.total_night`, null);
              }
            }}
          />
        </div>
      ),
    },
    {
      title: 'Ở nhà khách',
      width: 250,
      align: 'center',
      dataIndex: 'is_guest_house',
      render: (_, __, index) => (
        <div style={{ marginBottom: '-20px', display: 'flex', justifyContent: 'center' }}>
          <MzFormCheckbox
            controllerProps={{
              control: detailForm.control,
              name: `plan_confirm_user.${index}.is_guest_house`,
            }}
            checkboxProps={{
              disabled: isView,
            }}
          />
        </div>
      ),
    },
    {
      title: 'Từ ngày',
      dataIndex: 'from_date',
      width: 200,
      render: (v, __, index) => {
        return isView ? (
          v ? (
            v.format('DD/MM/YYYY')
          ) : (
            '--'
          )
        ) : (
          <div style={{ marginBottom: '-20px' }}>
            <MzFormDatePicker
              controllerProps={{
                control: detailForm.control,
                name: `plan_confirm_user.${index}.from_date`,
              }}
              datePickerProps={{
                placeholder: 'Từ ngày',
                format: ['DD/MM/YYYY'],
                disabled: !detailForm.watch(`plan_confirm_user.${index}.is_business`),
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Đến ngày',
      dataIndex: 'to_date',
      width: 200,
      render: (v, __, index) =>
        isView ? (
          v ? (
            v.format('DD/MM/YYYY')
          ) : (
            '--'
          )
        ) : (
          <div style={{ marginBottom: '-20px' }}>
            <MzFormDatePicker
              controllerProps={{
                control: detailForm.control,
                name: `plan_confirm_user.${index}.to_date`,
              }}
              datePickerProps={{
                placeholder: 'Đến ngày',
                format: ['DD/MM/YYYY'],
                disabled: !detailForm.watch(`plan_confirm_user.${index}.is_business`),
              }}
            />
          </div>
        ),
    },
    {
      title: 'Số ngày qua đêm',
      dataIndex: 'total_night',
      width: 250,
      render: (v, __, index) =>
        isView ? (
          v || '--'
        ) : (
          <div style={{ marginBottom: '-20px' }}>
            <MzFormInput
              controllerProps={{
                control: detailForm.control,
                name: `plan_confirm_user.${index}.total_night`,
              }}
              inputProps={{
                type: 'number',
                disabled: !detailForm.watch(`plan_confirm_user.${index}.is_business`),
              }}
            />
          </div>
        ),
    },
    {
      title: 'TG checkin',
      dataIndex: 'plan_checkin',
      width: 200,
      render: (record) => {
        return record?.checkin_time ? dayjs.tz(record.checkin_time, 'Asia/Ho_Chi_Minh').format('DD/MM/YYYY HH:mm:ss') : '--';
      },
    },
    {
      title: 'Địa điểm checkin',
      dataIndex: 'plan_checkin',
      width: 400,
      render: (record, recordValue) =>
        record?.checkin_location ? (
          <a
            target="blank"
            href={`https://www.google.com/maps/@${recordValue.checkin_latitude + ',' + recordValue.checkin_longitude
              }z?entry=ttu`}
          >
            {record.checkin_location}
          </a>
        ) : (
          '--'
        ),
    },
    {
      title: 'Link ảnh checkin',
      dataIndex: 'plan_checkin',
      width: 400,
      render: (record) =>
        record?.checkin_file_id ? (
          <a
            onClick={() => {
              setModalImg(true);
              setTimeout(() => {
                const listUrl = record.checkin_file_id.split(',');
                if (listUrl.length) {
                  listUrl.forEach((i: string, index) => {
                    dowloadFileImg(i, index);
                  });
                }
              }, 500);
            }}
          >
            {record.checkin_file_id}
          </a>
        ) : (
          '--'
        ),
    },
  ];

  const changeInforConfirm = async (bodyData: FieldValues) => {
    try {
      await changeInforConfirmRequest(bodyData);
      handleSelectRoute(routeSelect);
      setOpenDemand(false);
      toast('Lưu thành công', { type: 'success' });
    } catch (err) {
      console.log(err);
    }
  };

  const handleDefaul = () => {
    setDefaul1(true);
    setDefaul2(true);
    setDefaul3(true);
    setDefaul4(true);
    setDefaul5(true);
    if (routeSelect) {
      setValue('from_province.id', routeSelect.from_province?.id);
      setValue('to_province.id', routeSelect.to_province?.id);
      setValue('from_district.id', routeSelect.from_district?.id);
      setValue('to_district.id', routeSelect.to_district?.id);
      setValue('vehicle.id', routeSelect.vehicle?.id);
      setValue('plan', planDetails);
      setValue('plan_route.id', routeSelect.id);
    }
  };
  const items: TabsProps['items'] = [
    {
      key: '1',
      label: `Danh sách nhân viên`,
      children: (
        <>
          <Row gutter={8}>
            <Col span={6}>
              <Search
                placeholder="Tìm kiếm"
                onChange={(e) => setRouteSearch(e.target.value)}
                style={{ marginBottom: 20 }}
              />
            </Col>
          </Row>
          <TableData
            tableProps={{
              loading: loading,
              size: 'small',
              columns: staffColumn,
              dataSource: listConfirmPlan,
              scroll: { x: 1500, y: 300 },
              bordered: true,
              rowKey: '_id',
              rowSelection: {
                onChange: (_, selectedRows) => {
                  if (selectedRows.length === 0) {
                    callback(false);
                  } else {
                    callback(true);
                  }
                  setDataConfirm(selectedRows);
                  const data = selectedRows.map((i: any) => {
                    return {
                      ...i,
                      from_date: i?.start_time_reality ? dayjs(i?.start_time_reality) : null,
                      to_date: i?.end_time_reality ? dayjs(i?.end_time_reality) : null,
                      plan_route: {
                        id: routeSelect?.id,
                      },
                      plan_user: { id: i?.plan_user_id },
                      plan_route_user: { id: i?.plan_route_user_id },
                      full_name: i?.name,
                      is_business: true,
                      code: i?.plan_route_user_code,
                    };
                  });
                  setValue('plan_confirm_user', data);
                },
                // getCheckboxProps: (record) => ({
                //   disabled: record.status > 1,
                // }),
                getCheckboxProps: (record) => ({
                  disabled: [planConfirmUserStatus.CHO_XAC_NHAN, planConfirmUserStatus.DA_XAC_NHAN].includes(
                    record.status
                  ), // Column configuration not to be checked
                }),
                fixed: true,
              },
            }}
          />
        </>
      ),
    },
    {
      key: '2',
      label: `Đề nghị xác nhận công tác`,
      children: (
        <>
          <TableData
            tableProps={{
              loading: loading,
              columns: workConfirmation,
              dataSource: listUserPlan,
              size: 'small',
              rowKey: 'id',
              pagination: false,
            }}
          />
        </>
      ),
    },
  ];

  useEffect(() => {
    if (isOpend) {
      const data = dataConfirm?.map((i: any) => {
        return {
          ...i,
          from_date: i?.start_time_reality ? dayjs(i?.start_time_reality) : null,
          to_date: i?.end_time_reality ? dayjs(i?.end_time_reality) : null,
          plan_route: {
            id: routeSelect?.id,
          },
          plan_user: { id: i?.plan_user_id },
          plan_route_user: { id: i?.plan_route_user_id },
          full_name: i?.name,
          is_business: true,
          code: i?.plan_route_user_code,
        };
      });
      setValue('plan_confirm_user', data);
    }
  }, [isOpend]);

  return (
    <div className="confirm-infor">
      <Modal
        open={isOpend}
        destroyOnClose={true}
        title={'Tạo mới xác nhận kế hoạch công tác'}
        onCancel={() => {
          handleDefaul();
          setIsOpen(false);
          clearErrors();
        }}
        bodyStyle={{
          height: 'calc(100vh - 120px)',
          padding: '0px',
        }}
        style={{
          top: 0,
          height: '100vh',
          maxWidth: '100vw',
        }}
        width={'100vw'}
        footer={[
          Array.isArray(watch('plan_confirm_user')) && watch('plan_confirm_user').length > 0 ? (
            <Button
              type="primary"
              key={1}
              onClick={() =>
                handleSubmit(
                  (e) => SubmitForm(e),
                  (err: any) => {
                    if (err.plan_confirm_user) {
                      if (err.plan_confirm_user[0]?.from_date?.message) {
                        toast.error(err.plan_confirm_user[0]?.from_date?.message)
                      } else {
                        toast.error(err.plan_confirm_user[0]?.to_date?.message)
                      }
                    }
                  }
                )()
              }
              loading={loadingConfirm}
            >
              {routeSelect && (!routeSelect.is_to_internal || routeSelect.is_moving_route) ? 'Gửi' : 'Gửi duyệt'}
            </Button>
          ) : null,
          <Button
            key={2}
            onClick={() => {
              handleDefaul();
              setIsOpen(false);
              clearErrors();
            }}
          >
            Hủy
          </Button>,
        ]}
      >
        <div className={'modal-scroll'}>
          <Row style={{ margin: '20px 0' }}>
            <Col span={4}>Lộ trình công tác:</Col>
            <Col span={4}>{routeSelect?.name}</Col>
          </Row>
          <Row style={{ padding: '20px 0' }}>
            <Col span={4}>Đơn vị công tác:</Col>
            <Col span={4}>{routeSelect?.to_department?.name || routeSelect?.to_department_name || '--'}</Col>
          </Row>
          <h3 style={{ marginTop: 20 }}>Chặng di chuyển thực tế</h3>
          <Row>
            <TableData
              tableProps={{
                dataSource: [routeSelect],
                columns: columnsRoute,
              }}
            />
          </Row>
          <h3 style={{ marginTop: 20 }}>Danh sách cán bộ</h3>
          <Row>
            <TableData
              tableProps={{
                dataSource:
                  Array.isArray(watch('plan_confirm_user')) && watch('plan_confirm_user').length > 0
                    ? watch('plan_confirm_user')
                    : [], // dataUser.fields,
                columns: columnsRouteUser as any,
                size: 'small',
                scroll: {
                  x: 1720,
                },
              }}
            />
          </Row>
        </div>
      </Modal>
      <Modal
        open={isOpenDelete}
        title={'Bạn chắc chắn muốn xoá bản ghi ' + id?.code}
        onCancel={() => setIsOpenDelete(false)}
        footer={[
          <Button key={1} onClick={() => setIsOpenDelete(false)}>
            Hủy
          </Button>,
          <Button
            key={2}
            type={'primary'}
            onClick={async () => {
              try {
                await call({
                  uri: 'plan-confirms/' + id?.id,
                  hasToken: true,
                  method: 'DELETE',
                });
                handleSelectRoute(routeSelect);
                toast('Xóa thành công', { type: 'success' });
                setIsOpenDelete(false);
              } catch (err) {
                toast(getMessageError(err), { type: 'error' });
              }
            }}
          >
            Xác nhận
          </Button>,
        ]}
      ></Modal>
      <Modal
        open={isOpendDemand}
        title={(!isView ? 'Sửa' : 'Chi tiết') + ' xác nhận công tác'}
        onCancel={() => {
          setOpenDemand(false);
          setIsView(false);
        }}
        bodyStyle={{
          height: 'calc(100vh - 120px)',
          padding: '0px',
        }}
        style={{
          top: 0,
          height: '100vh',
          maxWidth: '100vw',
        }}
        width={'100vw'}
        footer={[
          !isView ? (
            <Button
              key={1}
              type={'primary'}
              onClick={() => {
                detailForm.handleSubmit((e) => {
                  e.plan_confirm_user?.map((i: any) => {
                    i.business = i.is_business;
                    if (i.from_date) {
                      i.from_date = i.from_date.format('YYYY-MM-DD');
                    }
                    if (i.to_date) {
                      i.to_date = i.to_date.format('YYYY-MM-DD');
                    }
                    return i;
                  });
                  changeInforConfirm(e);
                })();
              }}
            >
              Lưu
            </Button>
          ) : (
            <></>
          ),
          <Button
            key={2}
            onClick={() => {
              setOpenDemand(false);
              setIsView(false);
            }}
          >
            Trở lại
          </Button>,
        ]}
      >
        <div className={'modal-scroll'}>
          <Row style={{ margin: '20px 0' }}>
            <Col span={4}>Lộ trình công tác:</Col>
            <Col span={4}>{routeSelect?.name}</Col>
          </Row>
          <Row style={{ padding: '20px 0' }}>
            <Col span={4}>Đơn vị công tác:</Col>
            <Col span={4}>{routeSelect?.to_department?.name || routeSelect?.to_department_name}</Col>
          </Row>
          <h3 style={{ marginTop: 20 }}>Chặng di chuyển thực tế</h3>
          <Row>
            <TableData
              tableProps={{
                rowKey: '_id',
                dataSource: [{}],
                columns: columnRouteDetail,
                scroll: {
                  x: 1720,
                },
              }}
            />
          </Row>
          <h3 style={{ marginTop: 20 }}>Danh sách cán bộ</h3>
          <Row>
            <TableData
              tableProps={{
                rowKey: '_id',
                dataSource: detailPerson.fields,
                columns: columnsRouteUserDetail as any,
                size: 'small',
                scroll: {
                  x: 1720,
                },
              }}
            />
          </Row>
        </div>
      </Modal>
      <Modal
        onCancel={() => setModalImg(false)}
        open={modalImg}
        footer={[<Button onClick={() => setModalImg(false)}>Đóng</Button>]}
        zIndex={999999999999999}
      >
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          {loadingImg && (
            <div style={{ position: 'absolute', top: '45%', left: '45%' }}>
              <Spin size="large" />
            </div>
          )}
          <div id={'img-wrap'} style={{ height: '70vh', overflowY: 'scroll' }}></div>
        </div>
      </Modal>
      <Row gutter={[16, 0]}>
        <Col span={6}>
          <Card className="card-border" bordered={false} title="Danh sách lộ trình" size="small">
            <div className="scrollbar">
              <div className="scrollbar-content">
                <Row>
                  <Col span={24} className="tab_pane">
                    <Row>
                      <Col span={24}>
                        <Row gutter={[0, 24]}>
                          <Col span={24}>
                            {listRoutePlan.map((i: any) => (
                              <div
                                key={v4()}
                                style={{ padding: 10, borderRadius: 10 }}
                                className={
                                  routeSelect && i.id === routeSelect.id ? 'route-selected' : 'route-not-selected'
                                }
                                onClick={() => {
                                  handleSelectRoute(i);
                                  setRouteSelect(i);
                                  setDataConfirm([]);
                                  callback(false);
                                  setDefaul1(true);
                                  setDefaul2(true);
                                  setDefaul3(true);
                                  setDefaul4(true);
                                  setDefaul5(true);
                                }}
                              >
                                <Row
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                  }}
                                >
                                  <Col span={24}>
                                    <strong style={{ fontSize: '130%' }}>{i.name ? i.name : '--'}</strong>
                                  </Col>
                                </Row>
                                <Row>
                                  <Col span={9}>
                                    <h3>{i.from_department?.name ? 'Đơn vị đi' : 'Tên cơ quan đơn vị đi'}</h3>
                                  </Col>
                                  <Col span={1}>:</Col>
                                  <Col style={{ marginBottom: '10px' }} span={14}>
                                    {i.from_department?.name || i.from_department_name || '--'}
                                  </Col>
                                </Row>
                                <Row>
                                  <Col span={9}>
                                    <h3>{i.to_department?.name ? 'Đơn vị đến' : 'Tên cơ quan đơn vị đến'}</h3>
                                  </Col>
                                  <Col span={1}>:</Col>
                                  <Col style={{ marginBottom: '10px' }} span={14}>
                                    {i.to_department?.name || i.to_department_name || ''}
                                  </Col>
                                </Row>
                                <Row>
                                  <Col span={9}>
                                    <h3>Ngày bắt đầu</h3>
                                  </Col>
                                  <Col span={1}>:</Col>
                                  <Col style={{ marginBottom: '10px' }} span={14}>
                                    {dayjs(i.start_time).format('DD/MM/YYYY') || ''}
                                  </Col>
                                </Row>
                                <Row>
                                  <Col span={9}>
                                    <h3>Ngày kết thúc</h3>
                                  </Col>
                                  <Col span={1}>:</Col>
                                  <Col style={{ marginBottom: '10px' }} span={14}>
                                    {dayjs(i.end_time).format('DD/MM/YYYY') || ''}
                                  </Col>
                                </Row>
                                <Row>
                                  <Col span={9}>
                                    <h3>Tình trạng</h3>
                                  </Col>
                                  <Col span={1}>:</Col>
                                  <Col style={{ marginBottom: '10px' }} span={14}>
                                    {i.is_confirm == 2 ? 'Đã xác nhận' : 'Chưa xác nhận'}
                                  </Col>
                                </Row>
                              </div>
                            ))}
                          </Col>
                        </Row>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={18}>
          <Tabs size="small" items={items} />
        </Col>
      </Row>
    </div>
  );
});

export default ConfirmInfo;

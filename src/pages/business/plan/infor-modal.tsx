import { Checkbox, Col, Radio, Row, Spin } from 'antd';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'react-toastify';
import { Controller, useForm } from 'react-hook-form';
import dayjs from 'dayjs';
import { MzFormInput } from '@components/forms/FormInput';
import toSlug from '@utils/toSlug';
import { IDepartment, IPlan } from 'type';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import { addOrEditPlan, getInforUserRequest, getPlan } from '../../../apis/page/business/plan/infor-modal';
import getMessageError from '@utils/getMessageError';

export interface ISelect {
  label?: string;
  value?: number;
  id?: number;
}

interface IProps {
  callback: (id: number, idParent: number | null, departmentProcess: IDepartment, type: number) => void;
  idEdit?: number | null;
  openModal?: boolean;
  callbackLoading?: (loading: boolean) => void;
}

const Infor = forwardRef((props: IProps, ref) => {
  const {
    callback,
    idEdit,
    openModal,
    callbackLoading = () => {
      return;
    },
  } = props;

  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  const { control, handleSubmit, watch, reset, setValue, setFocus } = useForm({ defaultValues: { type: 1 } as any });
  const [listDefaul, setListDefaul] = useState<ISelect[]>([{}, {}, {}, {}, {}, {}, {}]);
  const [department, setDepartment] = useState<ISelect>();

  const callbackGetPlan = (res: IPlan) => {
    const resetData = { ...res };
    setDepartment({
      label: resetData?.department_process.code + ' - ' + resetData?.department_process.name,
      value: resetData.department_process.id,
      id: resetData.department_process.id,
    });
    resetData.end_time = dayjs(resetData.end_time);
    resetData.start_time = dayjs(resetData.start_time);
    const parent: ISelect = {};
    const purpose: ISelect = {};
    const department_require: ISelect = {};
    const department_process: ISelect = {};
    const user_require: ISelect = {};
    const user_process: ISelect = {};
    purpose.label = resetData.purpose.name;
    purpose.value = resetData.purpose.id;
    purpose.id = resetData.purpose.id;
    department_process.label = resetData.department_process.code + ' - ' + resetData.department_process.name;
    department_process.value = resetData.department_process.id;
    department_process.id = resetData.department_process.id;
    user_process.label = resetData.user_process.fullName;
    user_process.value = resetData.user_process.id;
    user_process.id = resetData.user_process.id;
    if (resetData.department_require) {
      department_require.label = resetData.department_require.code + ' - ' + resetData.department_require.name;
      department_require.value = resetData.department_require.id;
      department_require.id = resetData.department_require.id;
    }
    if (resetData.user_require) {
      user_require.label = resetData.user_require.fullName;
      user_require.value = resetData.user_require.id;
      user_require.id = resetData.user_require.id;
    }
    if (resetData.parent) {
      setAdditionalPlan(true);
      parent.label = resetData.parent.code || '' + resetData.parent.name || '';
      parent.value = resetData.parent.id;
      parent.id = resetData.parent.id;
    } else {
      setAdditionalPlan(false);
    }

    setListDefaul([parent, purpose, department_require, user_require, department_process, user_process]);
    reset(resetData);
  };

  const handleGetPlanForUpdate = async() => {
    try {
      setIsLoading(true)
      await getPlan(idEdit, callbackGetPlan);
      setIsLoading(false)
    } catch (error) {
      toast(getMessageError(error),{type:"error"})
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (idEdit) {
      handleGetPlanForUpdate()
    } else {
      reset({ name: null });
    }
  }, [idEdit]);

  const [additionalPlan, setAdditionalPlan] = useState(false);

  useImperativeHandle(ref, () => ({
    submitInfor: () => {
      handleSubmit((value) =>
        addOrEditPlan(
          idEdit ? value : Object.assign(value, { ins_id: user.id }),
          callback,
          callbackLoading,
          idEdit,
          additionalPlan,
          watch('parent.id'),
          department
        )
      )();
    },
    resetFields: () => {
      reset({});
      setAdditionalPlan(false);
    },
  }));

  const getParent = (res: IPlan) => {
    const parent: ISelect = {};
    const purpose: ISelect = {};
    const department_require: ISelect = {};
    const department_process: ISelect = {};
    const user_require: ISelect = {};
    const user_process: ISelect = {};
    purpose.label = res.purpose.name;
    purpose.value = res.purpose.id;
    purpose.id = res.purpose.id;
    department_process.label = res.department_process.code + ' - ' + res.department_process.name;
    department_process.value = res.department_process.id;
    department_process.id = res.department_process.id;
    user_process.label = res.user_process.fullName;
    user_process.value = res.user_process.id;
    user_process.id = res.user_process.id;
    if (res.department_require) {
      department_require.label = res.department_require.code + ' - ' + res.department_require.name;
      department_require.value = res.department_require.id;
      department_require.id = res.department_require.id;
    }
    if (res.user_require) {
      user_require.label = res.user_require.fullName;
      user_require.value = res.user_require.id;
      user_require.id = res.user_require.id;
    }
    if (res.parent) {
      parent.label = (res.parent.code || '') + (res.parent.name || '');
      parent.value = res.parent.id;
      parent.id = res.parent.id;
    }
    setListDefaul([parent, purpose, department_require, user_require, department_process, user_process]);
    setValue('name', res.name);
    setValue('purpose.id', res.purpose?.id);
    setValue('department_require.id', res.department_require?.id);
    setValue('department_process.id', res.department_process?.id);
    setValue('user_require.id', res.user_require?.id);
    setValue('user_process.id', res.user_process?.id);
    setValue('start_time', res.start_time ? dayjs(res.start_time) : null);
    setValue('end_time', res.end_time ? dayjs(res.end_time) : null);
    setValue('description', res.description);
    setValue('note', res.note);
  };

  const startTime = watch('start_time');
  const endTime = watch('end_time');
  // const dateRef = useRef<any>();

  useEffect(() => {
    if (startTime && endTime && dayjs(startTime).isAfter(dayjs(endTime))) {
      setValue('end_time', null);
      toast('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu', { type: 'error' });
      // dateRef.current.focus();
      setFocus('end_time');
    }
  }, [startTime, endTime]);

  useEffect(() => {
    if (user?.full_name && user?.id && !idEdit) {
      setValue('user_process.id', user.id);
    }
    if (user?.departments?.length > 0 && user?.departments[0]?.id && !idEdit) {
      setValue('department_process.id', user.departments[0].id);
    }
  }, [user, openModal, idEdit]);

  return (
    <div className={'infor-wrap'}>
      {idEdit && isLoading ? (
        <div style={{ textAlign: 'center', marginTop: '10vh' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row style={{ padding: '15px 0' }}>
            <Col span={12}>
              <Row>
                <Col span={8}>Hình thức công tác:</Col>
                <Col span={16}>
                  <Controller
                    name={'type'}
                    control={control}
                    render={({ field }) => (
                      <Radio.Group {...field} defaultValue={1} disabled={additionalPlan}>
                        <Radio value={1}>Nội địa</Radio>
                        <Radio value={2} disabled>
                          Nước ngoài
                        </Radio>
                      </Radio.Group>
                    )}
                  />
                </Col>
              </Row>
            </Col>
            <Col
              span={12}
              style={{
                paddingLeft: 20,
              }}
            >
              <Checkbox
                checked={additionalPlan}
                onChange={(e) => {
                  setAdditionalPlan(e.target.checked);
                  if (!e.target.checked) {
                    setValue('parent.id', null);
                  }
                }}
              >
                Kế hoạch bổ sung
              </Checkbox>
            </Col>
          </Row>
          {/* <Row>
        <Col span={4}>Mã kế hoạch:</Col>
        <Col span={20}>
          <MzFormInput
            controllerProps={{ control, name: 'code' }}
            inputProps={{
              disabled: true,
              placeholder: 'Mã kế hoạch',
            }}
          />
        </Col>
      </Row> */}
          {additionalPlan && (
            <Row>
              <Col span={4}>
                <span style={{ color: 'red' }}>*</span> Kế hoạch gốc:
              </Col>
              <Col span={20}>
                <MzFormSelectV2
                  isFormItem={true}
                  controllerProps={{
                    control,
                    name: 'parent.id',
                    rules: { required: additionalPlan ? 'Vui lòng nhập kế hoạch bổ sung' : false },
                  }}
                  selectProps={{
                    disabled: !additionalPlan,
                    placeholder: 'Kế hoạch gốc',
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
                      const data = record as any;
                      getParent(data);
                    },
                  }}
                  uri={'plans?isAdd.in=0&status.in[]=3&status.in[]=5&status.in[]=6&status.in[]=9'}
                  uriSearch={'name.contains='}
                  labelObj={['code', 'name']}
                  valueObj="id"
                  defaultOption={listDefaul[0]}
                />
              </Col>
            </Row>
          )}
          <Row>
            <Col span={12}>
              <Row>
                <Col span={8}>
                  <span style={{ color: 'red' }}>*</span> Tên kế hoạch:
                </Col>
                <Col span={16}>
                  <MzFormInput
                    controllerProps={{
                      control,
                      name: 'name',
                      rules: {
                        required: 'Vui lòng nhập tên kế hoạch',
                        maxLength: { value: 500, message: 'Tên kế hoạch quá dài' },
                        validate: (v) => {
                          if (v.replace(/\s+/g, '').length > 0) {
                            return true;
                          } else {
                            return 'Tên kế hoạch không hợp lệ';
                          }
                        },
                      },
                    }}
                    inputProps={{
                      placeholder: 'Tên kế hoạch',
                      maxLength: 500,
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col
                  span={8}
                  style={{
                    paddingLeft: 20,
                  }}
                >
                  <span style={{ color: 'red' }}>*</span> Mục đích công tác:
                </Col>
                <Col span={16}>
                  <MzFormSelectV2
                    isFormItem={true}
                    controllerProps={{
                      control,
                      name: 'purpose.id',
                      rules: { required: 'Vui lòng nhập mục đích công tác' },
                    }}
                    selectProps={{
                      placeholder: 'Mục đích công tác',
                      disabled: additionalPlan,
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
                    uri={'purposes?isActive.in=1'}
                    uriSearch={'name.contains='}
                    labelObj={['name']}
                    valueObj="id"
                    defaultOption={listDefaul[1]}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Row>
                <Col span={8}>Đơn vị yêu cầu:</Col>
                <Col span={16}>
                  <MzFormSelectV2
                    isFormItem={true}
                    controllerProps={{ control, name: 'department_require.id' }}
                    selectProps={{
                      placeholder: 'Đơn vị yêu cầu',
                      disabled: additionalPlan,
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
                    uri={'departments?isActive.in=1'}
                    uriSearch={'name.contains='}
                    labelObj={['code', 'name']}
                    defaultOption={listDefaul[2]}
                    onChangeValue={() => setValue('user_require.id', null)}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col
                  span={8}
                  style={{
                    paddingLeft: 20,
                  }}
                >
                  Người yêu cầu:
                </Col>
                <Col span={16}>
                  <MzFormSelectV2
                    isFormItem={true}
                    controllerProps={{ control, name: 'user_require.id' }}
                    selectProps={{
                      placeholder: 'Người yêu cầu',
                      disabled: additionalPlan,
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
                    uri={`user-departments/users?departmentId=${watch('department_require.id')}&isActive.in=1`}
                    uriSearch={'fullName.contains='}
                    labelObj={['fullName']}
                    defaultOption={listDefaul[3]}
                    fetchNewUri={true}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
              <Row>
                <Col span={8}>
                  <span style={{ color: 'red' }}>*</span> Đơn vị thực hiện:
                </Col>
                <Col span={16}>
                  <MzFormSelectV2
                    isFormItem={true}
                    controllerProps={{
                      control,
                      name: 'department_process.id',
                      rules: { required: 'Vui lòng nhập đơn vị thực hiện' },
                    }}
                    selectProps={{
                      placeholder: 'Đơn vị thực hiện',
                      disabled: additionalPlan,
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
                    uri={'departments?isActive.in=1'}
                    uriSearch={'name.contains='}
                    labelObj={['code', 'name']}
                    defaultOption={
                      !idEdit && user?.departments?.length
                        ? {
                            label: user?.departments[0]?.code + ' - ' + user?.departments[0]?.name,
                            value: user?.departments[0]?.id,
                          }
                        : listDefaul[4]
                    }
                    onChangeValue={(e) => {
                      setValue('user_process.id', null);
                      setDepartment(e);
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col
                  span={8}
                  style={{
                    paddingLeft: 20,
                  }}
                >
                  <span style={{ color: 'red' }}>*</span> Người thực hiện:
                </Col>
                <Col span={16}>
                  <MzFormSelectV2
                    isFormItem={true}
                    controllerProps={{
                      control,
                      name: 'user_process.id',
                      rules: { required: 'Vui lòng nhập người thực hiện' },
                    }}
                    selectProps={{
                      placeholder: 'Người thực hiện',
                      disabled: additionalPlan,
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
                    uri={`user-departments/users?departmentId=${watch('department_process.id')}&isActive.in=1`}
                    uriSearch={'fullName.contains='}
                    labelObj={['fullName']}
                    defaultOption={
                      !idEdit && user?.id && user?.full_name ? { label: user.full_name, value: user.id } : listDefaul[5]
                    }
                    fetchNewUri={true}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={12}>
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
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={12}>
              <Row>
                <Col
                  span={8}
                  style={{
                    paddingLeft: 20,
                  }}
                >
                  <span style={{ color: 'red' }}>*</span> Ngày kết thúc:
                </Col>
                <Col span={16}>
                  {/* <Controller
                                name={"end_time"}
                                control={control}
                                rules={{ required: "Vui lòng nhập ngày kết thúc" }}
                                render={({ field: { ref, ...field } }) => (
                                    <DatePicker
                                        ref={dateRef}
                                        {...field}
                                        placeholder={"Ngày kết thúc"}
                                        format={"DD/MM/YYYY"}
                                    />
                                )}
                            />
                            <p>{}</p> */}
                  <MzFormDatePicker
                    controllerProps={{
                      control,
                      name: 'end_time',
                      rules: { required: 'Vui lòng nhập ngày kết thúc' },
                    }}
                    datePickerProps={{
                      placeholder: 'Ngày kết thúc',
                      format: 'DD/MM/YYYY',
                    }}
                  />
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
            <Col span={4}>
              <span style={{ color: 'red' }}>*</span> Chi tiết công việc:
            </Col>
            <Col span={20}>
              <MzFormInput
                inputType={'TextArea'}
                controllerProps={{
                  control,
                  name: 'description',
                  rules: { required: 'Vui lòng nhập mô tả', maxLength: { value: 4000, message: 'Mô tả quá dài' } },
                }}
                textAreaProps={{
                  placeholder: 'Chi tiết công việc',
                  disabled: additionalPlan,
                  maxLength: 4000,
                }}
              />
            </Col>
          </Row>
          {additionalPlan && (
            <Row>
              <Col span={4}>
                <span style={{ color: 'red' }}>*</span> Nội dung công tác bổ sung:
              </Col>
              <Col span={20}>
                <MzFormInput
                  inputType={'TextArea'}
                  controllerProps={{
                    control,
                    name: 'note',
                    rules: { required: 'Vui lòng nhập mô tả', maxLength: { value: 4000, message: 'Mô tả quá dài' } },
                  }}
                  textAreaProps={{
                    placeholder: 'Nội dung công tác bổ sung',
                    maxLength: 4000,
                  }}
                />
              </Col>
            </Row>
          )}
        </>
      )}
    </div>
  );
});

export default Infor;

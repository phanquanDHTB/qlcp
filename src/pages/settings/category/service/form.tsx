import { Col, Row, Switch, DatePicker } from 'antd';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect, useRef } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import dayjs from 'dayjs';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/service/service';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, watch, reset, setValue } = useForm();
  const [listDefault, setListDefault] = useState<any>([{}, {}]);
  const [isActive, setIsActive] = useState(true);

  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getService = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      const resetData = { ...res };
      resetData.end_date = dayjs(resetData.end_date);
      resetData.start_date = dayjs(resetData.start_date);
      const service_group: any = {};
      const cost: any = {};
      if (resetData.service_group) {
        service_group.label = resetData.service_group.code + ' - ' + resetData.service_group.name;
        service_group.value = resetData.service_group.id;
      }

      if (resetData.cost) {
        cost.label = resetData.cost.name;
        cost.value = resetData.cost.id;
      }

      setListDefault([service_group, cost]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getService();
    } else {
      reset({ name: null });
    }
  }, [idEdit, closeForm]);

  const startTime = watch('start_date');
  const endTime = watch('end_date');
  const dateRef = useRef<any>();

  useEffect(() => {
    if (startTime && endTime && dayjs(startTime).isAfter(dayjs(endTime))) {
      setValue('end_date', null);
      toast('Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu', {
        type: 'error',
      });
      dateRef.current.focus();
    }
  }, [startTime, endTime]);

  const addOrEditService = async (value: FieldValues) => {
    try {
      const data: any = {
        code: value.code || '',
        description: value.description,
        id: idEdit,
        name: value.name,
        start_date: value.start_date,
        end_date: value.end_date,
        is_add: idEdit ? false : true,
        ins_date: value.ins_date,
        ins_id: value.ins_id,
        upd_date: value.upd_date,
        upd_id: value.upd_id,
        is_active: isActive,
      };

      data.service_group = {
        id: value.service_group.id,
      };
      data.cost = value?.cost?.id ? { id: value.cost.id } : null;

      try {
        const res = (await handleAddOrEditRequest(idEdit,data)) as any;
        console.log(res, 'RES');
        if (closeForm) {
          closeForm();
        }
        if (reloadTable) {
          reloadTable();
        }
        toast(`${idEdit ? 'Sửa' : 'Thêm'} dịch vụ thành công`, {
          type: 'success',
        });
      } catch (error: any) {
        toast(error?.response?.data?.fieldErrors[0].message, { type: 'error' });
      }
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditService)();
    },
  }));
  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã dịch vụ:</Col>
          <Col span={24}>
            {idEdit ? (
              <MzFormInput
                controllerProps={{
                  control,
                  name: "code",
                  rules: {
                    required: "Vui lòng nhập tên",
                    maxLength: {
                      value: 30,
                      message: "Không được phép nhập quá 30 ký tự",
                    },
                  },
                }}
                inputProps={{
                  placeholder: 'Mã dịch vụ',
                  disabled: idEdit ? true : false,
                }}
              />
            ) : (
              <MzFormInput
                controllerProps={{ control, name: "code",
                rules: {
                  maxLength: {
                    value: 30,
                    message: "Không được phép nhập quá 30 ký tự",
                  },
                }, }}
                inputProps={{
                  placeholder: 'Mã dịch vụ',
                }}
              />
            )}
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên dịch vụ:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,

                name: "name",
                rules: { required: "Vui lòng nhập tên", maxLength: {
                  value: 100,
                  message: "Không được phép nhập quá 100 ký tự",
                },
               },
              }}
              inputProps={{
                placeholder: 'Tên dịch vụ',
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Nhóm dịch vụ:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'service_group.id',
                rules: { required: 'Vui lòng nhập nhóm dịch vụ' },
              }}
              selectProps={{
                placeholder: 'Nhóm dịch vụ',
                allowClear: true,
                showSearch: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: '100%',
                },
              }}
              uri={'service-groups?isActive.in=1'}
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[0]}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span>Loại chi phí:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'cost.id',
                rules: { required: 'Vui lòng chọn loại chi phí' },
              }}
              selectProps={{
                placeholder: 'Loại chi phí',
                disabled: false,
                allowClear: true,
                showSearch: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: '100%',
                },
              }}
              uri={`costs`}
              uriSearch={'name.contains='}
              labelObj={['name']}
              valueObj="id"
              defaultOption={listDefault[1]}
            />
          </Col>
        </Row>
        <Row gutter={[8, 0]}>
          <Col span={12} style={{ marginBottom: '18px' }}>
            <Row gutter={[0, 8]}>
              <Col span={24}>
                <span style={{ color: 'red' , marginBottom: 10}}>*</span>Ngày bắt đầu:
              </Col>
              <Col span={24}>
                <Controller
                  name={'start_date'}
                  control={control}
                  rules={{ required: 'Vui lòng nhập ngày kết thúc' }}
                  render={({ field: { ref, ...field }, fieldState: { error } }) => (
                    <div>
                      <DatePicker
                        style={{
                          width: '100%',
                          border: error ? '1px solid red' : '1px solid #d9d9d9',
                        }}
                        ref={dateRef}
                        {...field}
                        placeholder={'Ngày bắt đầu'}
                        format={'DD/MM/YYYY'}
                      />
                      {error && (
                        <p
                          style={{
                            position: 'absolute',
                            top: '32px',
                            color: 'red',
                          }}
                        >
                          {error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </Col>
            </Row>
          </Col>
          <Col span={12} style={{ marginBottom: '18px' }}>
            <Row gutter={[0, 8]}>
              <Col span={24}>
                <span style={{ color: 'red' }}>*</span>Ngày kết thúc:
              </Col>
              <Col span={24}>
                <Controller
                  name={'end_date'}
                  control={control}
                  rules={{ required: 'Vui lòng nhập ngày kết thúc' }}
                  render={({ field: { ref, ...field }, fieldState: { error } }) => (
                    <div>
                      <DatePicker
                        style={{
                          width: '100%',
                          border: error ? '1px solid red' : '1px solid #d9d9d9',
                        }}
                        ref={dateRef}
                        {...field}
                        placeholder={'Ngày kết thúc'}
                        format={'DD/MM/YYYY'}
                      />
                      {error && (
                        <p
                          style={{
                            position: 'absolute',
                            top: '32px',
                            color: 'red',
                          }}
                        >
                          {error.message}
                        </p>
                      )}
                    </div>
                  )}
                />
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mô tả:</Col>
          <Col span={24}>
            <MzFormInput
              inputType={'TextArea'}
              controllerProps={{
                control,
                name: 'description',
                rules: {
                   maxLength: {
                    value: 255,
                    message: "Không được phép nhập quá 255 ký tự",
                  },
                },
              }}
              textAreaProps={{
                placeholder: 'Mô tả',
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}> Trạng thái:</Col>
          <Col span={24}>
            <Switch checked={isActive} onChange={onChangeStatus} />
          </Col>
        </Row>
      </div>
    </>
  );
});

export default Form;

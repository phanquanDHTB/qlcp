import { Col, Radio, Row, Switch, message } from 'antd';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { requestCatchHook } from '@utils/hook/handleError';
import { formatWithTzVN } from '@utils/dateUtils';
import { RangePickerProps } from 'antd/es/date-picker';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormInputNumber } from '@components/forms/FormNumber';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import dayjs from 'dayjs';
import toSlug from '@utils/toSlug';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import './style.scss';
import { isActiveEnum, quotaTypeEnum } from '../../../constants/enumConmon';
import Constants from '../../../constants/Constants';
import { addOrEditmoving, detail } from '../../../apis/moving-quota';

export interface ISelect {
  label: string;
  value: number;
}

interface IProps {
  callback?: (id: number, idParent: number, departmentProcess: any) => void;
  idEdit: number | null;
  funcReload?: () => void;
}

const Infor = forwardRef((props: IProps, ref) => {
  const { idEdit, funcReload } = props;

  const { control, handleSubmit, watch, reset, setValue, getValues } = useForm();
  const [listDefaul, setListDefaul] = useState<any>([Constants.categoryDefault.vietNamCountry, {}, {}]);

  const getMovingQuota = async () => {
    try {
      const res = (await detail(idEdit)) as any;
      const resetData = { ...res };
      const country: any = {};
      setIsActive(resetData?.is_active != null ? resetData?.is_active : true);
      resetData.end_time = dayjs(resetData.end_time);
      resetData.start_time = dayjs(resetData.start_time);
      if (resetData.country) {
        country.code = resetData.country.name;
        country.label = resetData.country.name;
        country.value = resetData.country.id;
        country.id = resetData.country.id;
        country.description =  resetData.country.description;
        country.ins_date =  resetData.country.ins_date;
        country.is_active =  resetData.country.is_active;
        country.upd_date =  resetData.country.upd_date;
        country.upd_id =  resetData.country.upd_id;
      }

      setListDefaul([country]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getMovingQuota();
    } else {
      reset({
        name: null,
        type: quotaTypeEnum.TRONG_NUOC,
        service_group: Constants.categoryDefault.serviceGroup.PHU_CAP_LUU_TRU,
        country: Constants.categoryDefault.vietNamCountry,
      });
    }
  }, [idEdit]);

  useEffect(() => {
    const data = getValues();
    if (watch('type') == quotaTypeEnum.NGOAI_NUOC) {
      if (watch('country.id') == Constants.categoryDefault.vietNamCountry.id) {
        //
        reset(Object.assign(data, { country: null }));
      }
    } else {
      setListDefaul([{ label: 'Vietnam', value: 192, id: 192 }]);
      reset(
        Object.assign(data, {
          country: Constants.categoryDefault.vietNamCountry,
        })
      );
    }
  }, [watch('type')]);

  const [isActive, setIsActive] = useState(true);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditForm)();
    },
  }));

  // eslint-disable-next-line arrow-body-style
  const disabledBeforeDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and todayf
    return current && watch('end_time') ? current >= dayjs(watch('end_time')).endOf('day') : false;
  };

  const disabledAfterDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and today
    return current && watch('start_time')
      ? dayjs(current).endOf('day') < dayjs(watch('start_time')).endOf('day')
      : false;
  };

  const addOrEditForm = async (value: FieldValues) => {
    try {
      const data: any = {
        id: idEdit,
        type: value.type,
        is_active: isActive,
        code: value.code || null,
        start_time: formatWithTzVN(value.start_time),
        end_time: formatWithTzVN(value.end_time),
        country: value?.country ? value?.country : null,
        from_distance: value.from_distance,
        to_distance: value.to_distance,
        amount: value.amount,
        description: value.description,
      };
      addOrEditmoving(idEdit, data)
        .then(() => {
          message.success('Lưu thành công');
          if (funcReload) funcReload();
        })
        .catch((error) => {
          requestCatchHook({ e: error });
        });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };

  console.log(listDefaul);
  return (
    <div className={'form-wrap'}>
      <Row>
        <Col span={12}>
          <Row>
            <Col span={24}>Hình thức công tác:</Col>
            <Col span={24}>
              <Controller
                name={'type'}
                control={control}
                render={({ field }) => (
                  <Radio.Group {...field} defaultValue={quotaTypeEnum.TRONG_NUOC}>
                    <Radio value={quotaTypeEnum.TRONG_NUOC}>Trong nước</Radio>
                    <Radio value={quotaTypeEnum.NGOAI_NUOC}>Nước ngoài</Radio>
                  </Radio.Group>
                )}
              />
            </Col>
          </Row>
        </Col>
        <Col
          span={12}
          style={{
            padding: 20,
          }}
        >
          <Row>
            <Col span={24}>Trạng thái:</Col>
            <Col span={24}>
              <Switch checked={isActive} onChange={(e) => setIsActive(e)}></Switch>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Row>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span>Quốc gia:
            </Col>
            <Col span={24}>
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: 'country',
                  rules: { required: 'Vui lòng chọn Quốc gia' },
                }}
                selectProps={{
                  placeholder: 'Quốc gia',
                  disabled: watch('type') == quotaTypeEnum.TRONG_NUOC,
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
                uri={`countries?isActive.in[]=${isActiveEnum.KICH_HOAT}`}
                uriSearch={'name.contains='}
                labelObj={['name']}
                valueObj="id"
                defaultOption={listDefaul[0]}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      {watch('type') == quotaTypeEnum.TRONG_NUOC ? (
        <Row>
          <Col span={12}>
            <Row>
              <Col span={24}>
                <span style={{ color: 'red' }}>*</span> Từ khoảng cách:
              </Col>
              <Col span={24}>
                <MzFormInputNumber
                  controllerProps={{
                    control,
                    name: 'from_distance',
                    rules: {
                      required: 'Vui lòng nhập Từ khoảng cách',
                    },
                  }}
                  inputNumberProps={{
                    placeholder: 'Từ khoảng cách',
                    style: { width: '100%' },
                    min: 0,
                    formatter: (value: any) => {
                      const parts = value.split('.');
                      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      return parts.join(',');
                    },
                    parser: (value: any) => {
                      value = value.replace(/\./g, '').replace(',', '.');
                      return parseFloat(value);
                    }, 
                    onBlur: (e) => {
                      if (watch('to_distance')) {
                        if (e.target.value > watch('to_distance')) {
                          message.error('Từ khoảng cách phải nhỏ hơn đến khoảng cách');
                          setValue('from_distance', null);
                          return;
                        }
                      }
                      // const f = Number(Number(e.target.value).toFixed(2));
                      // setValue('from_distance', f);
                    },
                  }}
                />
              </Col>
            </Row>
          </Col>
          <Col span={12} style={{ padding: 20 }}>
            <Row>
              <Col span={24}>
                <span style={{ color: 'red' }}>*</span> Đến khoảng cách:
              </Col>
              <Col span={24}>
                <MzFormInputNumber
                  controllerProps={{
                    control,
                    name: 'to_distance',
                    rules: {
                      required: 'Vui lòng nhập Đến khoảng cách',
                    },
                  }}
                  inputNumberProps={{
                    placeholder: 'Đến khoảng cách',
                    style: { width: '100%' },
                    precision: 2,
                    step: 0.01,
                    formatter: (value: any) => {
                      const parts = value.split('.');
                      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                      return parts.join(',');
                    },
                    parser: (value: any) => {
                      value = value.replace(/\./g, '').replace(',', '.');
                      return parseFloat(value);
                    }, 
                    onBlur: (e) => {
                      if (watch('from_distance')) {
                        if (e.target.value < watch('from_distance')) {
                          message.error('Đến khoảng cách phải lớn hơn từ khoảng cách');
                          setValue('to_distance', null);
                          return;
                        }
                      }
                    },
                  }}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      ) : null}

      <Row>
        <Col span={24}>
          <Row>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span> Định mức:
            </Col>
            <Col span={24}>
              <MzFormInputNumber
                controllerProps={{
                  control,
                  name: 'amount',
                  rules: { required: 'Vui lòng nhập định mức' },
                }}
                inputNumberProps={{
                  placeholder: 'Định mức',
                  formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                  parser: (value) => value!.replace(/\$\s?|(\.*)/g, ''),
                  style: { width: '100%' },
                  min: 0,
                  max: 1000000000,
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <Row>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span> Ngày bắt đầu:
            </Col>
            <Col span={24}>
              <MzFormDatePicker
                controllerProps={{
                  control,
                  name: 'start_time',
                  rules: { required: 'Vui lòng nhập ngày bắt đầu' },
                }}
                datePickerProps={{
                  placeholder: 'Ngày bắt đầu',
                  style: { width: '100%' },
                  format: ['DD/MM/YYYY'],
                  disabledDate: disabledBeforeDate,
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col
              span={24}
              style={{
                paddingLeft: 10,
              }}
            >
              <span style={{ color: 'red' }}>*</span> Ngày kết thúc:
            </Col>
            <Col
              span={24}
              style={{
                paddingLeft: 10,
              }}
            >
              <MzFormDatePicker
                controllerProps={{
                  control,
                  name: 'end_time',
                  rules: { required: 'Vui lòng nhập ngày kết thúc' },
                }}
                datePickerProps={{
                  placeholder: 'Ngày kết thúc',
                  style: { width: '100%' },
                  format: ['DD/MM/YYYY'],
                  disabledDate: disabledAfterDate,
                }}
              />
            </Col>
          </Row>
        </Col>
        {watch('service.id') == Constants.categoryDefault.service.PHONG_DOI.id ? (
          <Col
            span={12}
            style={{
              paddingLeft: 20,
            }}
          >
            <Row>
              <Col span={24}>
                <span style={{ color: 'red' }}>*</span> Định mức phòng đơn phát sinh:
              </Col>
              <Col span={24}>
                <MzFormInputNumber
                  controllerProps={{
                    control,
                    name: 'single_room_amount',
                    rules: {
                      required: 'Vui lòng nhập định mức phòng đơn phát sinh',
                    },
                  }}
                  inputNumberProps={{
                    placeholder: 'Định mức',
                    formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                    parser: (value) => value!.replace(/\$\s?|(,*)/g, ''),
                    style: { width: '100%' },
                    min: 0,
                    max: 1000000000,
                  }}
                />
              </Col>
            </Row>
          </Col>
        ) : null}
      </Row>
      <Row>
        <Col span={24}>Mô tả:</Col>
        <Col span={24}>
          <MzFormInput
            inputType={'TextArea'}
            controllerProps={{
              control,
              name: 'description',
              rules: {
                maxLength: {
                  value: 256,
                  message: 'Mô tả quá dài tối đa 256 ký tự',
                },
              },
            }}
            textAreaProps={{
              placeholder: 'Vui lòng nhập mô tả',
            }}
          />
        </Col>
      </Row>
    </div>
  );
});

export default Infor;

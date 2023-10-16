import { Col, Radio, Row, Switch, message } from 'antd';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { requestCatchHook } from '@utils/hook/handleError';
import { formatWithTzVN } from '@utils/dateUtils';
import formatNumber from '@utils/formatNumber';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormInputNumber } from '@components/forms/FormNumber';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import toSlug from '@utils/toSlug';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import getMessageError from '@utils/getMessageError';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import { RangePickerProps } from 'antd/es/date-picker';
import './style.scss';
import { isActiveEnum, quotaTypeEnum } from '../../../constants/enumConmon';
import Constants from '../../../constants/Constants';
import { addOrEditHotel, detail } from '../../../apis/hotel-quota';

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
  const { callback, idEdit, funcReload } = props;

  const { control, handleSubmit, watch, reset, getValues } = useForm();
  const [listDefaul, setListDefaul] = useState<any>([
    Constants.categoryDefault.serviceGroup.PHONG_NGHI,
    {},
    {},
    Constants.categoryDefault.vietNamCountry,
    {},
    {},
    {},
  ]);

  const getHotelQuota = async () => {
    try {
      const res = (await detail(idEdit)) as any;
      const resetData = { ...res };
      const service_group: any = {};
      const service: any = {};
      const position_group: any = {};
      const country: any = {};
      const province: any = {};
      const district: any = {};
      setIsActive(resetData?.is_active != null ? resetData?.is_active : true);
      resetData.end_date = dayjs(resetData.end_date);
      resetData.start_date = dayjs(resetData.start_date);
      if (resetData.service_group) {
        service_group.label = resetData.service_group.name;
        service_group.value = resetData.service_group.id;
        service_group.id = resetData.service_group.id;
      }
      if (resetData.service) {
        service.label = resetData.service.name;
        service.value = resetData.service.id;
        service.id = resetData.service.id;
      }
      if (resetData.position_group) {
        position_group.label = resetData.position_group.name;
        position_group.value = resetData.position_group.id;
        position_group.id = resetData.position_group.id;
      }
      if (resetData.country) {
        country.label = resetData.country.name;
        country.value = resetData.country.id;
        country.id = resetData.country.id;
      }
      if (resetData.province) {
        province.label = resetData.province.name;
        province.value = resetData.province.id;
        province.id = resetData.province.id;
      }
      if (resetData.district) {
        district.label = resetData.district.name;
        district.value = resetData.district.id;
        district.id = resetData.district.id;
      }
      // resetData.amount = formatNumber(resetData.amount);
      // resetData.amount_month = formatNumber(resetData.amount_month);
      // resetData.single_room_amount = formatNumber(resetData.single_room_amount);
      setListDefaul([service_group, service, position_group, country, province, district]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getHotelQuota();
    } else {
      reset({
        type: quotaTypeEnum.TRONG_NUOC,
        service_group: Constants.categoryDefault.serviceGroup.PHONG_NGHI,
        // country: Constants.categoryDefault.vietNamCountry,
      });
    }
  }, [idEdit]);

  // const [additionalPlan, setAdditionalPlan] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditForm)();
    },
  }));

  // eslint-disable-next-line arrow-body-style
  const disabledBeforeDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and today
    return current && watch('end_date') ? current >= dayjs(watch('end_date')).endOf('day') : false;
  };

  const disabledAfterDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days before today and today
    return current && watch('start_date')
      ? dayjs(current).endOf('day') < dayjs(watch('start_date')).endOf('day')
      : false;
  };

  const addOrEditForm = async (value: FieldValues) => {
    console.log(value);
    try {
      value.start_date = value.start_date.format('YYYY-MM-DD');
      value.end_date = value.end_date.format('YYYY-MM-DD');
      value.amount = value.amount?.toString()?.replaceAll('.', '') || 0;
      value.amount_month = value.amount_month?.toString()?.replaceAll('.', '') || 0;
      if (idEdit) {
        value.id = idEdit;
      }
      addOrEditHotel(idEdit, value)
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
            paddingLeft: 20,
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
              <span style={{ color: 'red' }}>*</span>Nhóm dịch vụ:
            </Col>
            <Col span={24}>
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: 'service_group.id',
                  rules: { required: 'Vui lòng chọn nhóm dịch vụ' },
                }}
                selectProps={{
                  placeholder: 'Nhóm dịch vụ',
                  allowClear: true,
                  showSearch: true,
                  disabled: true,
                  filterOption: (input, option) => {
                    const optionValue: string | undefined =
                      option?.label !== undefined ? option?.label?.toString() : '';
                    return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                  },
                  style: {
                    width: '100%',
                  },
                }}
                uri={`service-groups?isActive.in[]=${isActiveEnum.KICH_HOAT}`}
                uriSearch={'name.contains='}
                labelObj={['name']}
                valueObj="id"
                defaultOption={listDefaul[0]}
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
          <Row>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span>Dịch vụ:
            </Col>
            <Col span={24}>
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: 'service.id',
                  rules: { required: 'Vui lòng chọn dịch vụ' },
                }}
                selectProps={{
                  placeholder: 'Dịch vụ',
                  // disabled: watch("service_group.id") == null,
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
                uri={`services?serviceGroupId=${watch('service_group.id') ? watch('service_group.id') : 0}`}
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
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span>Nhóm chức vụ:
            </Col>
            <Col span={24}>
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: 'position_group.id',
                  rules: { required: 'Vui lòng chọn nhóm chức vụ' },
                }}
                selectProps={{
                  placeholder: 'Nhóm chức vụ',
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
                uri={`position-groups?isActive.in[]=${isActiveEnum.KICH_HOAT}`}
                uriSearch={'name.contains='}
                labelObj={['name']}
                valueObj="id"
                defaultOption={listDefaul[2]}
              />
            </Col>
          </Row>
        </Col>
        {/* {watch("type") == quotaTypeEnum.NGOAI_NUOC ? ( */}
        {watch('type') == quotaTypeEnum.NGOAI_NUOC ? (
          <Col
            span={12}
            style={{
              paddingLeft: 20,
            }}
          >
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
                    // disabled: watch("country.id") == null,
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
                  defaultOption={listDefaul[4]}
                />
              </Col>
            </Row>
          </Col>
        ) : null}

        {/* ) : null} */}
      </Row>
      {watch('type') != quotaTypeEnum.NGOAI_NUOC ? (
        <Row>
          <Col span={12}>
            <Row>
              <Col span={24}>
                <span style={{ color: 'red' }}>*</span>Tỉnh:
              </Col>
              <Col span={24}>
                <MzFormSelectV2
                  isFormItem={true}
                  controllerProps={{
                    control,
                    name: 'province.id',
                    rules: { required: 'Vui lòng chọn tỉnh' },
                  }}
                  selectProps={{
                    placeholder: 'Tỉnh',
                    // disabled: watch("country.id") == null,
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
                  uri={`provinces?isActive.in[]=${isActiveEnum.KICH_HOAT}`}
                  uriSearch={'name.contains='}
                  labelObj={['name']}
                  valueObj="id"
                  defaultOption={listDefaul[4]}
                  onChangeValue={(value) => {
                    const data = getValues();
                    reset(
                      Object.assign(data, {
                        province: value ? { id: value.value } : null,
                        district: null,
                      })
                    );
                  }}
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
            <Row>
              <Col span={24}>
                <span style={{ color: 'red' }}>*</span>Quận/Huyện:
              </Col>
              <Col span={24}>
                <MzFormSelectV2
                  isFormItem={true}
                  controllerProps={{
                    control,
                    name: 'district.id',
                    rules: { required: 'Vui lòng chọn Quận/Huyện' },
                  }}
                  selectProps={{
                    placeholder: 'Quận/Huyện',
                    disabled: watch('province.id') == null,
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
                  uri={`districts?isActive.in[]=${isActiveEnum.KICH_HOAT}${
                    watch('province.id') ? `&provinceId=${watch('province.id')}` : `&provinceId=${0}`
                  }`}
                  uriSearch={'name.contains='}
                  labelObj={['name']}
                  valueObj="id"
                  defaultOption={listDefaul[5]}
                />
              </Col>
            </Row>
          </Col>
        </Row>
      ) : null}

      <Row>
        <Col span={12}>
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
                  style: { width: '100%' },
                  formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                  parser: (value: any) => value?.replace(/\$\s?|(\.*)/g, ''),
                  min: 0,
                  max: 1000000000,
                }}
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
          <Row>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span> Định mức theo tháng:
            </Col>
            <Col span={24}>
              <MzFormInputNumber
                controllerProps={{
                  control,
                  name: 'amount_month',
                  rules: { required: 'Vui lòng nhập định mức theo tháng' },
                }}
                inputNumberProps={{
                  placeholder: 'Định mức',
                  style: { width: '100%' },
                  formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                  parser: (value: any) => value?.replace(/\$\s?|(\.*)/g, ''),
                  max: 1000000000,
                  min: 0,
                }}
              />
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col span={6}>
          <Row>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span> Ngày bắt đầu:
            </Col>
            <Col span={24}>
              <MzFormDatePicker
                controllerProps={{
                  control,
                  name: 'start_date',
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
        <Col span={6}>
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
                  name: 'end_date',
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
                    formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                    parser: (value: any) => value?.replace(/\$\s?|(\.*)/g, ''),
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
              // disabled: additionalPlan,
            }}
          />
        </Col>
      </Row>
    </div>
  );
});

export default Infor;

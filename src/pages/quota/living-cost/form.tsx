import { Checkbox, Col, Radio, RadioChangeEvent, Row, Space, Switch, message } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { requestCatchHook } from '@utils/hook/handleError';
import { formatWithTzVN } from '@utils/dateUtils';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormInputNumber } from '@components/forms/FormNumber';
import getMessageError from '@utils/getMessageError';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import toSlug from '@utils/toSlug';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import './style.scss';
import { isActiveEnum, quotaTypeEnum } from '../../../constants/enumConmon';
import Constants from '../../../constants/Constants';
import { addOrEditLivingCost, detail } from '../../../apis/living-cost-quota';

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

  const { control, handleSubmit, watch, reset, setValue, getValues } = useForm();
  const [listDefaul, setListDefaul] = useState<any>([{}, Constants.categoryDefault.serviceGroup.SINH_HOAT_PHI, {}]);

  const getLivingQuota = async () => {
    try {
      const res = (await detail(idEdit)) as any;
      const resetData = { ...res };
      const service_group: any = {};
      const service: any = {};
      const country: any = {};
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

      if (resetData.country) {
        country.label = resetData.country.name;
        country.value = resetData.country.id;
        country.id = resetData.country.id;
      }

      setListDefaul([country, service_group, service]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getLivingQuota();
    } else {
      reset({
        name: null,
        type: quotaTypeEnum.TRONG_NUOC,
        service_group: Constants.categoryDefault.serviceGroup.SINH_HOAT_PHI,
        country: Constants.categoryDefault.vietNamCountry,
      });
    }
  }, [idEdit]);

  useEffect(() => {
    const data = getValues();
    if (watch('type') == quotaTypeEnum.NGOAI_NUOC) {
      if (watch('country.id') == Constants.categoryDefault.vietNamCountry.id) {
        reset(Object.assign(data, { country: null }));
      }
    } else {
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
    try {
      const data: any = {
        id: idEdit,
        type: value.type,
        is_active: isActive,
        code: value.code || null,
        start_date: formatWithTzVN(value.start_date),
        end_date: formatWithTzVN(value.end_date),
        service_group: value.service_group,
        service: value.service,
        amount: value.amount,
        country: value?.country ? value?.country : null,
        description: value.description,
      };

      addOrEditLivingCost(idEdit, data)
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
        <Col span={24}>
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
      </Row>
      <Row>
        <Col span={24}>
          <span style={{ color: 'red' }}>*</span>Quốc gia:
        </Col>
        <Col span={24}>
        <MzFormSelectV2
            isFormItem={true}
            controllerProps={{
              control,
              name: watch('type') === quotaTypeEnum.TRONG_NUOC ? 'country' : 'country.id',
              rules: { required: 'Vui lòng chọn Quốc gia' },
            }}
            selectProps={{
              placeholder: 'Quốc gia',
              disabled: watch('type') == quotaTypeEnum.TRONG_NUOC,
              allowClear: true,
              showSearch: true,
              filterOption: (input, option) => {
                const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
              },
              style: {
                width: '100%',
              },
              defaultValue: Constants.categoryDefault.vietNamCountry,
            }}
            uri={`countries?isActive.in[]=${isActiveEnum.KICH_HOAT}`}
            uriSearch={'name.contains='}
            labelObj={['name']}
            valueObj="id"
            defaultOption={listDefaul[0]}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
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
                defaultOption={listDefaul[1]}
              />
            </Col>
          </Row>
        </Col>
        <Col span={24}>
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
                defaultOption={listDefaul[2]}
              />
            </Col>
          </Row>
        </Col>
      </Row>

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
            }}
            textAreaProps={{
              placeholder: 'Vui lòng nhập mô tả',
            }}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <Row>
            <Col span={24}>Trạng thái:</Col>
            <Col span={24}>
              <Switch checked={isActive} onChange={(e) => setIsActive(e)}></Switch>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
});

export default Infor;

import { Checkbox, Col, InputNumber, Radio, RadioChangeEvent, Row, Space, Switch, message } from 'antd';
import dayjs from 'dayjs';
import { RangePickerProps } from 'antd/es/date-picker';
import { toast } from 'react-toastify';
import { requestCatchHook } from '@utils/hook/handleError';
import { formatWithTzVN } from '@utils/dateUtils';
import toSlug from '@utils/toSlug';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import getMessageError from '@utils/getMessageError';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import './style.scss';
import { isActiveEnum, quotaTypeEnum } from '../../../constants/enumConmon';
import { addOrEditAirQuota, getAirPortQuotaRequest } from '../../../apis/airport-quota/airport-quota';

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
  const [listDefaul, setListDefaul] = useState<any>([{}, {}]);

  const getAirportQuota = async () => {
    try {
      const res = (await getAirPortQuotaRequest(idEdit)) as any;
      const resetData = { ...res };
      const province: any = {};
      const airport: any = {};

      resetData.end_date = dayjs(resetData.end_date);
      resetData.start_date = dayjs(resetData.start_date);
      setIsActive(resetData?.is_active);
      if (resetData.province) {
        province.label = resetData.province.name;
        province.value = resetData.province.id;
        province.id = resetData.province.id;
      }
      if (resetData.airport) {
        airport.label = resetData.airport.name;
        airport.value = resetData.airport.id;
        airport.id = resetData.airport.id;
      }
      setListDefaul([province, airport]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getAirportQuota();
    } else {
      reset({ name: null, type: quotaTypeEnum.TRONG_NUOC });
    }
  }, [idEdit]);

  useEffect(() => {
    // setValue("airport.id", null);
  }, [watch('province.id')]);

  const [additionalPlan, setAdditionalPlan] = useState(false);
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
        province: value.province,
        airport: value.airport,
        amount: value.amount,
        description: value.description,
      };

      addOrEditAirQuota(idEdit, data)
        .then(() => {
          message.success(`Lưu thành công `);
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
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Row>
            <Col span={24}>Hình thức công tác:</Col>
            <Col span={24}>
              <Controller
                name={'type'}
                control={control}
                render={({ field }) => (
                  <Radio.Group {...field} defaultValue={quotaTypeEnum.TRONG_NUOC} disabled={true}>
                    <Radio value={quotaTypeEnum.TRONG_NUOC}>Trong nước</Radio>
                    <Radio value={quotaTypeEnum.NGOAI_NUOC}>Nước ngoài</Radio>
                  </Radio.Group>
                )}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col span={24}>Trạng thái:</Col>
            <Col span={24}>
              <Switch checked={isActive} onChange={(e) => setIsActive(e)}></Switch>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
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
                defaultOption={listDefaul[0]}
                onChangeValue={(value) => {
                  const data = getValues();
                  reset(
                    Object.assign(data, {
                      province: value ? { id: value.value } : null,
                      airport: null,
                    })
                  );
                }}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span>Sân bay:
            </Col>
            <Col span={24}>
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: 'airport.id',
                  rules: { required: 'Vui lòng chọn sân bay' },
                }}
                selectProps={{
                  placeholder: 'Sân bay',
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
                uri={`airports?provinceId= ${watch('province.id') ? watch('province.id') : 0}`}
                uriSearch={'name.contains='}
                labelObj={['name']}
                valueObj="id"
                defaultOption={listDefaul[1]}
              />
            </Col>
          </Row>
        </Col>
      </Row>
      <Row></Row>

      <Row gutter={[16, 16]}>
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
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span> Ngày kết thúc:
            </Col>
            <Col span={24}>
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
      </Row>
      <Row>
        <Col span={24}>
          <span style={{ color: 'red' }}>*</span> Định mức:
        </Col>
        <Col span={24}>
          <Controller
            name='amount'
            control={control}
            render={({ field }) => (
              <InputNumber
                {...field}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value) => value!.replace(/\$\s?|(\.*)/g, '')}
                style={{
                  width: '100%'
                }}
                max={1000000000}
              />
            )}
          />
        </Col>
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
              disabled: additionalPlan,
            }}
          />
        </Col>
      </Row>
    </div>
  );
});

export default Infor;

import { Col, Row, Switch, Radio } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import type { RangePickerProps } from 'antd/es/date-picker';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import dayjs from 'dayjs';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { MzFormInputNumber } from '@components/forms/FormNumber';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/policy-limit/policy-limit';

interface Props {
  idEdit?: number | null; 
  reloadTable?: () => void; 
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, watch, reset, setValue } = useForm();
  const [listDefault, setListDefault] = useState<any>([{}, {}, {}]);
  const [isActive, setIsActive] = useState(true);
  const [type, setType] = useState(1);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const changeRadio = (e) => {
    setType(e.target.value);
  };
  const service_group = watch('service_group.id');
  const getPolicyLimit = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      const resetData = { ...res };
      resetData.end_time = dayjs(resetData.end_time);
      resetData.start_time = dayjs(resetData.start_time);

      const position_group: any = {};
      const service_group: any = {};
      const service: any = {};
      if (resetData.position_group) {
        position_group.label = resetData.position_group.code + ' - ' + resetData.position_group.name;
        position_group.value = resetData.position_group.id;
      }
      if (resetData.service_group) {
        service_group.label = resetData.service_group.code + ' - ' + resetData.service_group.name;
        service_group.value = resetData.service_group.id;
      }
      if (resetData.service) {
        service.label = resetData.service.code + ' - ' + resetData.service.name;
        service.value = resetData.service.id;
      }

      setListDefault([position_group, service_group, service]);
      setType(res.type);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getPolicyLimit();
    } else {
      reset({ name: null });
    }
  }, [idEdit, closeForm]);

  const addOrEditPolicyLimit = async (value: FieldValues) => {
    try {
      const data: any = {
        code: value.code || '',
        description: value.description,
        name: value.name ? value.name : '',
        id: idEdit,
        start_time: value.start_time,
        end_time: value.end_time,
        is_add: idEdit ? false : true,
        ins_date: value.ins_date,
        ins_id: value.ins_id,
        upd_date: value.upd_date,
        upd_id: value.upd_id,
        is_active: isActive,
        limit_amount: value.limit_amount,
        type: type,
      };
      data.position_group = value?.position_group?.id
        ? {
            id: value.position_group.id,
          }
        : null; 
      data.service_group = {
        id: value.service_group.id,
      };
      data.service = {
        id: value.service.id,
      };
      const res = (await handleAddOrEditRequest(idEdit, data)) as any;
      if (closeForm) { 
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }
      toast(`${idEdit ? 'Sửa' : 'Thêm'} chính sách hạn mức thành công`, {
        type: 'success',
      });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditPolicyLimit)();
    },
  }));

  const disabledBeforeDate: RangePickerProps['disabledDate'] = (current) => {
    return current && watch('end_time') ? current >= dayjs(watch('end_time')).endOf('day') : false;
  };

  const disabledAfterDate: RangePickerProps['disabledDate'] = (current) => {
    return current && watch('start_time')
      ? dayjs(current).endOf('day') < dayjs(watch('start_time')).endOf('day')
      : false;
  };

  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 10]}>
          <Row>Hình thức công tác :</Row>
          <Radio.Group onChange={changeRadio} value={type}>
            <Row>
              <Col>
                <Radio value={1}>Công tác trong nước</Radio>
              </Col>
              <Col>
                <Radio value={2} disabled>
                  Công tác nước ngoài
                </Radio>
              </Col>
            </Row>
          </Radio.Group>
        </Row>
        <Row gutter={[0, 10]} style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Col span={5}> Trạng thái:</Col>
          <Col span={19}>
            <Switch checked={isActive} onChange={onChangeStatus} />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>Nhóm chức vụ:</Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: "position_group.id",
              }}
              selectProps={{
                placeholder: 'Nhóm chức vụ',
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
              uri={'position-groups?isActive.in=1'}
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[0]}
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
              defaultOption={listDefault[1]}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Loại dịch vụ:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'service.id',
                rules: { required: 'Vui lòng nhập loại dịch vụ' },
              }}
              selectProps={{
                placeholder: 'Loại dịch vụ',
                allowClear: true,
                showSearch: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: '100%',
                },
                disabled: service_group ? false : true,
              }}
              uri={`services?serviceGroupId=${service_group}&isActive.in=1`}
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[2]}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Hạn mức đơn giá:
          </Col>
          <Col span={24}>
            <MzFormInputNumber
              controllerProps={{
                control,
                name: 'limit_amount',
                rules: {
                  required: 'Vui lòng nhập hạn mức đơn giá',
                },
              }}
              inputNumberProps={{
                min: 0,
                style: { width: '100%', borderRadius: 0 },
                placeholder: 'Số tiền yêu cầu',
                formatter: (value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.'),
                parser: (value) => value?.replace(/\$\s?|(\.*)/g, '') as any,
                max: 1000000000,
              }}
            />
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
                  maxLength: { value: 4000, message: 'chỉ được nhập tối đa 4000 ký tự' },
                },
              }}
              textAreaProps={{
                placeholder: 'Mô tả',
              }}
            />
          </Col>
        </Row>
      </div>
    </>
  );
});

export default Form;

import { Col, Row, Switch, Radio } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { requestCatchHook } from '@utils/hook/handleError';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { MzFormInputNumber } from '@components/forms/FormNumber';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/distance-quota/distance-quota';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void; 
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, watch, reset, getValues } = useForm();
  const [listDefault, setListDefault] = useState<any>([{}, {}, {}, {}]);
  const [isActive, setIsActive] = useState(true);
  const [type, setType] = useState(1);
  const from_province = watch('from_province.id');
  // const from_district = watch("from_district.id");
  // const to_province = watch("to_province.id");
  const changeProvince = (e, province_field) => {
    const data = getValues();
    if (type !== 1) {
      data[province_field].id = e;
    } else {
      data['from_province'].id = e;
      // data["to_province"].id = e;
      data['from_district'].id = undefined;
      data['to_district'].id = undefined;
    }
    reset(data);
  };
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const changeRadio = (e) => {
    setType(e.target.value);
  };
  const getDistanceQuota = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      const resetData = { ...res };

      const from_province: any = {};
      const from_district: any = {};
      const to_province: any = {};
      const to_district: any = {};
      if (resetData.from_province) {
        from_province.label = resetData.from_province.code + ' - ' + resetData.from_province.name;
        from_province.value = resetData.from_province.id;
      }
      if (resetData.from_district) {
        from_district.label = resetData.from_district.code + ' - ' + resetData.from_district.name;
        from_district.value = resetData.from_district.id;
      }
      if (resetData.to_province) {
        to_province.label = resetData.to_province.code + ' - ' + resetData.to_province.name;
        to_province.value = resetData.to_province.id;
      }
      if (resetData.to_district) {
        to_district.label = resetData.to_district.code + ' - ' + resetData.to_district.name;
        to_district.value = resetData.to_district.id;
      }
      setType(resetData.type);
      setListDefault([from_province, from_district, to_province, to_district]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getDistanceQuota();
    } else {
      reset({ name: null });
    }
  }, [idEdit]);
  const addOrEditDistanceQuota = async (value: FieldValues) => {
    if (type !== 1 && value.from_province.id === value.to_province.id) {
      toast('Không được chọn trùng tỉnh đi và tỉnh đến', { type: 'error' });
    } else {
      try {
        const data: any = {
          code: value.code || '',
          description: value.description,
          distance: value.distance,
          name: value.name ? value.name : '',
          id: idEdit,
          is_add: idEdit ? false : true,
          ins_date: value.ins_date,
          ins_id: value.ins_id,
          upd_date: value.upd_date,
          upd_id: value.upd_id,
          is_active: isActive,
          type: type,
        };
        if (type == 1) {
          data.from_province = {
            id: value.from_province.id,
          };
          data.to_province = {
            id: value.from_province.id,
          };
          data.from_district = {
            id: value.from_district.id,
          };
          data.to_district = {
            id: value.to_district.id,
          };
        } else {
          data.from_province = {
            id: value.from_province.id,
          };
          data.to_province = {
            id: value.to_province.id,
          };
          data.from_district = null;
          data.to_district = null;
        }
        const res = (await handleAddOrEditRequest(idEdit, data)) as any;
        if (closeForm) {
          closeForm();
        }
        if (reloadTable) {
          reloadTable();
        }
        toast(`${idEdit ? 'Sửa' : 'Thêm'} khoảng cách thành công`, {
          type: 'success',
        });
      } catch (e: any) { 
        requestCatchHook({ e: e });
      }
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditDistanceQuota)();
    },
  }));

  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 10]}>
          <Col span={16}>
            <Col span={24}>Loại :</Col>
            <Col span={24} style={{ marginTop: '10px' }}>
              <Radio.Group onChange={changeRadio} value={type}>
                <Radio value={1}>Trong tỉnh</Radio>
                <Radio value={2}>Ngoài tỉnh</Radio>
              </Radio.Group>
            </Col>
          </Col>
          <Col span={8}>
            <Col span={24}> Trạng thái:</Col>
            <Col span={24} style={{ marginTop: '10px' }}>
              <Switch checked={isActive} onChange={onChangeStatus} />
            </Col>
          </Col>
        </Row>
        <Row gutter={[0, 8]} style={{ marginTop: 20 }}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Tỉnh đi:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'from_province.id',
                rules: { required: 'Vui lòng chọn tỉnh đi' },
              }}
              selectProps={{
                placeholder: 'Tỉnh đi',
                allowClear: true,
                showSearch: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: '100%',
                },
                onChange: (e, record: any) => {
                  if (record) {
                    setListDefault((pre) => {
                      pre[2] = {
                        label: `${record?.code} - ${record?.name}`,
                        value: record?.id,
                        id: record?.id,
                      };
                      return pre;
                    });
                  } else {
                    setListDefault((pre) => {
                      pre[2] = {};
                      return pre;
                    });
                  }
                  changeProvince(e, 'from_province');
                },
              }}
              uri={'provinces?countryId=192&isActive.in=1'}
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[0]}
            />
          </Col>
        </Row>
        {type === 1 && (
          <Row gutter={[0, 8]}>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span> Quận/huyện đi:
            </Col>
            <Col span={24}>
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: 'from_district.id',
                  rules: { required: 'Vui lòng chọn quận/huyện đi' },
                }}
                selectProps={{
                  placeholder: 'Quận/huyện đi',
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
                  disabled: from_province ? false : true,
                }}
                uri={`districts?provinceId=${from_province}&isActive.in=1`}
                uriSearch={'keyWord='}
                labelObj={['code', 'name']}
                defaultOption={listDefault[1]}
              />
            </Col>
          </Row>
        )}
        {type !== 1 && (
          <Row gutter={[0, 8]}>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span> Tỉnh đến:
            </Col>
            <Col span={24}>
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: 'to_province.id',
                  rules: { required: 'Vui lòng chọn tỉnh đến' },
                }}
                selectProps={{
                  placeholder: 'Tỉnh đến',
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
                  onChange: (e, record: any) => {
                    if (record) {
                      setListDefault((pre) => {
                        pre[0] = {
                          label: `${record?.code} - ${record?.name}`,
                          value: record?.id,
                          id: record?.id,
                        };
                        return pre;
                      });
                    } else {
                      setListDefault((pre) => {
                        pre[0] = {};
                        return pre;
                      });
                    }
                    changeProvince(e, 'to_province');
                  },
                }}
                uri={'provinces?countryId=192&isActive.in=1'}
                uriSearch={'keyWord='}
                labelObj={['code', 'name']}
                defaultOption={listDefault[2]}
              />
            </Col>
          </Row>
        )}
        {type === 1 && (
          <Row gutter={[0, 8]}>
            <Col span={24}>
              <span style={{ color: 'red' }}>*</span> Quận/huyện đến:
            </Col>
            <Col span={24}>
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: 'to_district.id',
                  rules: { required: 'Vui lòng chọn quận/huyện đến' },
                }}
                selectProps={{
                  placeholder: 'Quận/huyện đến',
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
                  disabled: from_province ? false : true,
                }}
                uri={`districts?provinceId=${from_province}&isActive.in=1`}
                uriSearch={'keyWord='}
                labelObj={['code', 'name']}
                defaultOption={listDefault[3]}
              />
            </Col>
          </Row>
        )}

        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Khoảng cách:
          </Col>
          <Col span={24}>
            <MzFormInputNumber
              controllerProps={{
                control,
                name: 'distance',
                rules: {
                  required: 'Vui lòng nhập khoảng cách',
                },
              }}
              inputNumberProps={{
                style: { width: '100%' },
                precision: 2,
                step: 0.01,
                placeholder: 'Khoảng cách',
                formatter: (value: any) => {
                  const parts = value.split('.');
                  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                  return parts.join(',');
                },
                parser: (value: any) => {
                  value = value.replace(/\./g, '').replace(',', '.');
                  return parseFloat(value);
                }, 
              }}
            />
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
                    message: "Không được nhập quá 255 ký tự",
                  },
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

import { Col, Row, Switch } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';

import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleGetDetailsForEditRequest, handleAddOrEditRequest } from '../../../../apis/guest-house/guest-house';
import { IDefaulOption } from 'type';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, setValue, reset, watch } = useForm();
  const [isActive, setIsActive] = useState(true);
  const [listDefault, setListDefault] = useState<IDefaulOption[]>([{}]);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const gethotel = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      console.log(res, 'DATA');
      const resetData = { ...res };
      const province: any = {};
      if (resetData.province) {
        province.label = resetData.province.code + ' - ' + resetData.province.name;
        province.value = resetData.province.id;
        province.id = resetData.province.id;
      }
      const district: any = {};
      if (resetData.district) {
        district.label = resetData.district.code + ' - ' + resetData.district.name;
        district.value = resetData.district.id;
        district.id = resetData.district.id;
      }
      const ward: any = {};
      if (resetData.ward) {
        ward.label = resetData.ward.code + ' - ' + resetData.ward.name;
        ward.value = resetData.ward.id;
        ward.id = resetData.ward.id;
      }
      setListDefault([province, district, ward]);
      reset(resetData);
    } catch (e) {
      // toast(getMessageError(e), { type: "error" });
    }
  };

  useEffect(() => {
    if (idEdit) {
      gethotel();
    } else {
      reset({ name: null });
    }
  }, [idEdit, closeForm]);

  const addOrEdithotel = async (value: FieldValues) => {
    try {
      const data: any = {
        id: idEdit,
        code: value.code || '',
        name: value.name,
        phone_number: value.phone_number,
        staff_name: value.staff_name,
        province: value.province,
        district: value.district,
        ward: value.ward,
        address: value.address,
        is_active: isActive,
      };

      try {
        const res = await handleAddOrEditRequest(idEdit,data).then(() => {
          if (closeForm) {
            closeForm();
          }
          if (reloadTable) {
            reloadTable();
          } 
        });
        toast(`${idEdit ? 'Sửa' : 'Thêm'} nhà khách thành công`, {
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
      handleSubmit(addOrEdithotel)();
    },
  }));

  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã nhà khách:</Col>
          <Col span={24}>
            {idEdit ? (
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'code',
                  rules: {
                    required: "Vui lòng nhập mã nhà khách",
                    maxLength: {
                      value: 30,
                      message: "Không được phép nhập quá 30 ký tự",
                    },
                  }
                }}
                inputProps={{
                  placeholder: 'Mã nhà khách',
                  disabled: idEdit ? true : false,
                }}
              />
            ) : (
              <MzFormInput
                controllerProps={{
                  control,
                  name: "code",
                  rules: {
                    maxLength: {
                      value: 30,
                      message: "Không được phép nhập quá 30 ký tự",
                    },
                  }
                }}
                inputProps={{
                  placeholder: 'Mã nhà khách',
                }}
              />
            )}
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên nhà khách:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: 'name',
                rules: {
                  required: 'Vui lòng nhập tên nhà khách',
                  maxLength: {
                    value: 100,
                    message: 'Không được phép nhập quá 100 ký tự',
                  },
                },
              }}
              inputProps={{
                placeholder: 'Tên nhà khách',
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Số điện thoại:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: 'phone_number',
                rules: {
                  required: 'Vui lòng nhập số điện thoại',
                  maxLength: {
                    value: 11,
                    message: 'Vui lòng nhập đúng định dạng số điện thoại',
                  },
                },
              }}
              inputProps={{
                placeholder: 'Số điện thoại',
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên nhân viên:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: 'staff_name',
                rules: {
                  required: 'Vui lòng nhập tên nhân viên',
                  maxLength: {
                    value: 255,
                    message: "Không được phép nhập quá 255 ký tự",
                  },
                },
              }}
              inputProps={{
                placeholder: 'Tên nhân viên',
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Tỉnh:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'province.id',
                rules: { required: 'Vui lòng nhập tỉnh' },
              }}
              selectProps={{
                placeholder: 'Tỉnh',
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
              onChangeValue={() => {
                setValue('district.id', null);
              }}
              uri={'provinces?isActive.in=1'}
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[0]}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Quận/Huyện:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'district.id',
                rules: { required: 'Vui lòng nhập Quận/Huyện' },
              }}
              selectProps={{
                placeholder: 'Quận/Huyện',
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
              uri={`districts?provinceId=${watch('province.id')}`}
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[1]}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Xã/Phường:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'ward.id',
                rules: {
                  required: 'Vui lòng nhập Xã/Phường',
                },
              }}
              selectProps={{
                placeholder: 'Xã/Phường',
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
              uri={`wards?districtId=${watch('district.id')}`}
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[2]}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}></span> Địa chỉ:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: 'address',
                rules: {
                  maxLength: {
                    value: 255,
                    message: 'Không được phép nhập quá 255 ký tự',
                  },
                },
              }}
              inputProps={{
                placeholder: 'Địa chỉ',
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

import { Col, Row, Switch, Radio } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { MzFormInput } from '@components/forms/FormInput';
// import { MzFormSelectV2 } from "@components/forms/FormSelectV2";
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/ward/ward';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, watch, reset, setValue } = useForm({
    defaultValues: { country: { id: 192 } } as any,
  });
  const [listDefault, setListDefault] = useState<any>([{}, {}, {}]);
  const [isActive, setIsActive] = useState(true);
  const [districtType, setDistrictType] = useState<number>(1);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getDistrict = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      const resetData = { ...res };
      const district: any = {};
      if (resetData.district) {
        district.label = resetData.district.code + ' - ' + resetData.district.name;
        district.value = resetData.district.id;
      }
      const province: any = {};
      if (resetData.province) {
        province.label = resetData.province.code + ' - ' + resetData.province.name;
        province.value = resetData.province.id;
      }
      const country: any = {};
      if (resetData.country) {
        country.label = resetData.country.code + " - " + resetData.country.name;
        country.value = resetData.country.id;
      }
      setDistrictType(res.type);
      setListDefault([district, province, country]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getDistrict();
    } else {
      reset({ name: null });
    }
  }, [idEdit, closeForm]);
  const addOrEditDistrict = async (value: FieldValues) => {
    try {
      const data: any = {
        code: value.code || null,
        description: value.description,
        id: idEdit,
        name: value.name,
        is_add: idEdit ? false : true,
        ins_date: value.ins_date,
        ins_id: value.ins_id,
        upd_date: value.upd_date,
        upd_id: value.upd_id,
        is_active: isActive,
        type: districtType,
      };

      data.country = {
        id: value.country.id,
      };
      data.province = {
        id: value.province.id,
      };
      data.district = {
        id: value.district.id,
      };

      await handleAddOrEditRequest(idEdit,data);
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }

      toast(`${idEdit ? 'Sửa' : 'Thêm'} xã thành công`, { type: 'success' });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditDistrict)();
    },
  }));
  return (
    <>
      <div className={"infor-wrap"}>
        {idEdit ? (
          <Row gutter={[0, 8]}>
            <Col span={24}>Mã xã:</Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: "code",
                  rules: {
                    required: "Vui lòng nhập mã xã",
                    maxLength: {
                      value: 30,
                      message: "Không được phép nhập quá 30 ký tự",
                    },
                  },
                }}
                inputProps={{
                  placeholder: "Mã xã",
                  disabled: idEdit ? true : false,
                }}
              />
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 8]}>
            <Col span={24}>Mã xã:</Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: "code",
                  rules: {
                    maxLength: {
                      value: 30,
                      message: "Không được phép nhập quá 30 ký tự",
                    },
                  },
                }}
                inputProps={{
                  placeholder: "Mã xã",
                }}
              />
            </Col>
          </Row>
        )}
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Tên xã:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: "name",
                rules: {
                  required: "Vui lòng nhập tên",
                  maxLength: {
                    value: 100,
                    message: "Không được phép nhập quá 100 ký tự",
                  },
                },
              }}
              inputProps={{
                placeholder: 'Tên xã',
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Quốc gia:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'country.id',
                rules: { required: 'Vui lòng nhập quốc gia' },
              }}
              selectProps={{
                placeholder: 'Quốc gia',
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
                setValue("province.id", null);
                setValue("district.id", null);
              }}
              uri={"countries?isActive.in=1"}
              uriSearch={"name.contains="}
              labelObj={["code", "name"]}
              defaultOption={
                Object.keys(listDefault[1]).length
                  ? listDefault[1]
                  : { label: "VN - Vietnam", value: 192, id: 192 }
              }
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
                setValue("district.id", null);
              }}
              uri={`provinces?countryId=${watch('country.id')}`}
              uriSearch={'name.contains='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[0]}
              fetchNewUri={true}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Huyện:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'district.id',
                rules: { required: 'Vui lòng nhập huyện' },
              }}
              selectProps={{
                placeholder: 'Huyện',
                allowClear: true,
                showSearch: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: '100%',
                },
                disabled: !watch("province.id"),
              }}
              uri={`districts?provinceId=${watch('province.id')}`}
              uriSearch={'name.contains='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[0]}
              fetchNewUri={true}
            />  
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>Kiểu:</Col>
          <Radio.Group
            onChange={(e) => setDistrictType(e.target.value)}
            value={districtType}
          >
            <Radio value={1}>Xã</Radio>
            <Radio value={2}>Phường</Radio>
            <Radio value={3}>Thị trấn</Radio>
          </Radio.Group>
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

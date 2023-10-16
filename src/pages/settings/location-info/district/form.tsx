import { Col, Row, Switch, Radio } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/district/district';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, reset, watch, setValue } = useForm();
  const [listDefault, setListDefault] = useState<any>([{}]);
  const [isActive, setIsActive] = useState(true);
  const [districtType, setDistrictType] = useState<number>(2);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getDistrict = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      const resetData = { ...res };
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
      setIsActive(res.is_active);
      setDistrictType(res.type);
      setListDefault([province, country]);
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
        code: value.code || '',
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

      await handleAddOrEditRequest(idEdit, data);
      reset({ country: { id: 192 } });
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }

      toast(`${idEdit ? 'Sửa' : 'Thêm'} huyện thành công`, { type: 'success' });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditDistrict)();
    },
  }));

  useEffect(() => {
    setValue("country.id", 192);
  }, []);
  return (
    <>
      <div className={"infor-wrap"}>
        {idEdit ? (
          <Row gutter={[0, 8]}>
            <Col span={24}>Mã huyện:</Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: "code",
                  rules: {
                    required: "Vui lòng nhập mã huyện",
                    maxLength: {
                      value: 30,
                      message: "Không được phép nhập quá 30 ký tự",
                    },
                  },
                }}
                inputProps={{
                  placeholder: "Mã huyện",
                  disabled: idEdit ? true : false,
                }}
              />
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 8]}>
            <Col span={24}>Mã huyện:</Col>
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
                  placeholder: "Mã huyện",
                }}
              />
            </Col>
          </Row>
        )}
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên huyện:
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
                placeholder: 'Tên huyện',
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
              uri={"countries?isActive.in=1"}
              uriSearch={"name.contains="}
              labelObj={["code", "name"]}
              defaultOption={
                listDefault[1] || { label: "VN - Vietnam", value: 192, id: 192 }
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
              uri={`provinces?countryId=${watch('country.id')}`}
              uriSearch={'name.contains='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[0]}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>Kiểu:</Col>
          <Radio.Group
            onChange={(e) => setDistrictType(e.target.value)}
            value={districtType}
          >
            <Radio value={1}>Quận</Radio>
            <Radio value={2}>Huyện</Radio>
            <Radio value={3}>Thành phố</Radio>
            <Radio value={4}>Thị xã</Radio>
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

import { Col, Row, Switch} from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/airport/airport';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, watch, reset } = useForm();
  const [listDefault, setListDefault] = useState<any>([{}]);
  const [isActive, setIsActive] = useState(true);
  const [districtType, setDistrictType] = useState<number>(1);
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
        country.label = resetData.country.code + ' - ' + resetData.country.name;
        country.value = resetData.country.id;
      }
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
      };

      data.country = {
        id: value.country.id,
      };
      data.province = {
        id: value.province.id,
      };

      const res = (await handleAddOrEditRequest(idEdit, data)) as any;
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }

      toast(`${idEdit ? 'Sửa' : 'Thêm'} sân bay thành công`, {
        type: 'success',
      });
    } catch (e) {
      toast("Đã tồn tại Tên/Mã sân bay", { type: "error" });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditDistrict)();
    },
  }));
  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã sân bay:</Col>
          <Col span={24}>
            {idEdit ? (
              <MzFormInput
                controllerProps={{
                  control,
                  name: "code",
                  rules: {
                    required: "Vui lòng mã sân bay",
                    maxLength: {
                      value: 30,
                      message: "Không được phép nhập quá 30 ký tự",
                    },
                  },
                }}
                inputProps={{
                  placeholder: "Mã sân bay",
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
                  },
                }}
                inputProps={{
                  placeholder: "Mã sân bay",
                }}
              />
            )}
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên sân bay:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: "name",
                rules: { required: "Vui lòng nhập tên",
                maxLength: {
                  value: 100,
                  message: "Không được phép nhập quá 100 ký tự",
                }, },
              }}
              inputProps={{
                placeholder: 'Tên sân bay',
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
              uriSearch={"keyWord="}
              labelObj={["code", "name"]}
              defaultOption={listDefault[1]}
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
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={listDefault[0]}
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

import { Col, Row, Switch, Radio } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/province/province';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, reset } = useForm();
  const [listDefault, setListDefault] = useState<any>([{}]);
  const [isActive, setIsActive] = useState(true);
  const [provinceType, setProvinceType] = useState<number>(1);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getProvince = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;

      const resetData = { ...res };
      const country: any = {};
      if (resetData.country) {
        country.label = resetData.country.code + ' - ' + resetData.country.name;
        country.value = resetData.country.id;
        country.id = resetData.country.id;
      }
      setProvinceType(res.type);
      setListDefault([country]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getProvince();
    } else {
      reset({ name: null });
    }
  }, [idEdit, closeForm]);
  const addOrEditProvince = async (value: FieldValues) => {
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
        type: provinceType,
      };

      data.country = {
        id: value.country.id,
      };

      await handleAddOrEditRequest(idEdit, data)
      reset({});
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }

      toast(`${idEdit ? 'Sửa' : 'Thêm'} tỉnh thành công`, { type: 'success' });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditProvince)();
    },
  }));
  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã tỉnh:</Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{ control, name: 'code' }}
              inputProps={{
                placeholder: 'Mã tỉnh',
                disabled: idEdit ? true : false,
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên tỉnh:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: 'name',
                rules: { required: 'Vui lòng nhập tên' },
              }}
              inputProps={{
                placeholder: 'Tên tỉnh',
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
              uri={'countries?isActive.in=1'}
              uriSearch={'name.contains='}
              labelObj={['code', 'name']}
              valueObj="id"
              defaultOption={listDefault[0]}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>Kiểu:</Col>
          <Radio.Group onChange={(e) => setProvinceType(e.target.value)} value={provinceType}>
            <Radio value={1}>Tỉnh</Radio>
            <Radio value={2}>Thành phố</Radio>
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

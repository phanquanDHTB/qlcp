import { Col, Row, Switch, } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from "../../../../apis/role/role";
interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, reset } = useForm();
  const [isActive, setIsActive] = useState(true);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getDistrict = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      const resetData = { ...res };
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
        upd_date: value.upd_date,
        upd_id: value.upd_id,
        is_active: isActive,
      };

      await handleAddOrEditRequest(idEdit,data);
      reset({});
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }

      toast(`${idEdit ? 'Sửa' : 'Thêm'} vai trò thành công`, { type: 'success' });
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
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã vai trò:</Col>
          <Col span={24}>
            {idEdit ? (
              <MzFormInput
                controllerProps={{ control, name: 'code', rules: { required: 'Vui lòng nhập tên vai trò' } }}
                inputProps={{
                  placeholder: 'Mã vai trò',
                  disabled: idEdit ? true : false,
                }}
              />
            ) : (
              <MzFormInput
                controllerProps={{ control, name: 'code' }}
                inputProps={{
                  placeholder: 'Mã vai trò',
                }}
              />
            )}
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên vai trò:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: 'name',
                rules: { required: 'Vui lòng nhập tên vai trò' },
              }}
              inputProps={{
                placeholder: 'Tên vai trò',
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

import { Col, Row, Switch } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/country/country';

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
  const getCountry = async () => {
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
      getCountry();
    } else {
      reset({ name: null });
    }
  }, [idEdit, closeForm]);
  const addOrEditCountry = async (value: FieldValues) => {
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

      (await handleAddOrEditRequest(idEdit, data)) as any;
      reset({});
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }
      toast(`${idEdit ? "Sửa" : "Thêm"} quốc gia thành công`, {
        type: "success",
      });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditCountry)();
    },
  }));
  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã quốc gia:</Col>
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
                placeholder: 'Mã quốc gia',
                disabled: idEdit ? true : false,
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên quốc gia:
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
                placeholder: 'Tên quốc gia',
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

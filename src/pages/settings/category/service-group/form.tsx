import { Col, Row, Switch } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/service-group/service-group';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, watch, reset } = useForm();
  const [isActive, setIsActive] = useState(true);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getVehicle = async () => {
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
      getVehicle();
    } else {
      reset({ name: null });
    }
  }, [idEdit, closeForm]);
  const addOrEditVehicle = async (value: FieldValues) => {
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
      const res = (await handleAddOrEditRequest(idEdit, data)) as any;
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }
      toast(`${idEdit ? 'Sửa' : 'Thêm'} nhóm dịch vụ thành công`, { type: 'success' });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditVehicle)();
    },
  }));

  const NameLength = watch('name');

  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã nhóm dịch vụ:</Col>
          <Col span={24}>
            {idEdit ? (<MzFormInput 
              controllerProps={{ control, name: "code",
                rules: { required: "Vui lòng nhập mã nhóm dịch vụ",
                        validate: (v) =>{
                          if(v?.length > 30){
                            return "Không được phép nhập quá 30 kí tự";
                          }else{
                            return true
                          }
                        }
               },
              }}
              inputProps={{
                placeholder: "Mã nhóm dịch vụ",
                disabled: idEdit ? true : false,
              }}
            />) : (<MzFormInput
              controllerProps={{ control, name: "code",
                rules:{
                  maxLength: {
                    value: 30,
                    message: "Không được phép nhập quá 30 ký tự",
                  },
                }
             }}
              inputProps={{
                placeholder: "Mã nhóm dịch vụ",
              }}
            />)}
            
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên nhóm dịch vụ:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control, 
                name: "name",
                rules: { required: "Vui lòng nhập tên",
                validate: () => {
                  if (NameLength.length > 100) {
                    return "Không được phép nhập quá 100 kí tự";
                  } else {
                    return true;
                  }
                },        
                },
              }}
              inputProps={{
                placeholder: 'Tên nhóm dịch vụ',
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
                  maxLength: { value: 255, message: 'Không được phép nhập quá 255 kí tự' },
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

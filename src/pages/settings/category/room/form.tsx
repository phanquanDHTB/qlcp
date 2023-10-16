import { Col, Row, Switch } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';

import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/room/room';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, reset } = useForm();
  const [isActive, setIsActive] = useState(true);
  const [additionalPlan, setAdditionalPlan] = useState(false);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getRoom = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      console.log(res, 'DATA');
      const resetData = { ...res };
      setIsActive(resetData?.is_active != null ? resetData?.is_active : true);
      reset(resetData);
    } catch (e) {
      // toast(getMessageError(e), { type: "error" });
    }
  };

  useEffect(() => {
    if (idEdit) {
      getRoom();
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
        is_active: isActive,
        description: value.description,
        // status: status
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
        toast(`${idEdit ? "Sửa" : "Thêm"} phòng nghỉ thành công`, {
          type: "success",
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
          <Col span={24}>Mã phòng nghỉ:</Col>
          <Col span={24}>
            {idEdit ? (
              <MzFormInput
                controllerProps={{
                  control,
                  name: "code",
                  rules: {
                    required: "Vui lòng nhập mã phòng nghỉ",
                    maxLength: {
                      value: 30,
                      message: "Không nhập quá 30 ký tự",
                    },
                  },
                }}
                inputProps={{
                  placeholder: 'Mã phòng nghỉ',
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
                      message: "Không nhập quá 30 ký tự",
                    },
                  },
                }}
                inputProps={{
                  placeholder: 'Mã phòng nghỉ',
                }}
              />
            )}
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên phòng nghỉ:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: "name",
                rules: { required: "Vui lòng nhập tên",maxLength: {
                  value: 100,
                  message: "Không nhập quá 100 ký tự",
                }, },
              }}
              inputProps={{
                placeholder: 'Tên phòng nghỉ',
              }}
            />
          </Col>
        </Row>

        <Row>
          <Col span={24} style={{ marginTop: 10 }}>
            Mô tả:
          </Col>
          <Col span={24} style={{ marginTop: 10 }}>
            <MzFormInput
              inputType={"TextArea"}
              controllerProps={{
                control,
                name: "description",
                rules: {
                  maxLength: {
                    value: 255,
                    message: "Không được phép nhập quá 255 ký tự",
                  },
                },
              }}
              textAreaProps={{
                placeholder: 'Mô tả',
                disabled: additionalPlan,
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={12}>
            <Row>
              <Col span={12}>Trạng thái:</Col>
              <Col span={12}>
                <Switch checked={isActive} onChange={onChangeStatus}></Switch>
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </>
  );
});

export default Form;

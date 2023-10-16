import { Col, Row, Switch } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';

import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/vehicle/vehicle';

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
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getVehicle = async () => {
    try {
      const res = await handleGetDetailsForEditRequest(idEdit) as any;
      // console.log(res,"DATA")
      const resetData = { ...res };
      const vehicle_group: any = {};
      if (resetData.vehicle_group) {
        vehicle_group.label = resetData.vehicle_group.code + ' - ' + resetData.vehicle_group.name;
        vehicle_group.value = resetData.vehicle_group.id;
      }

      setListDefault([vehicle_group]);
      reset(resetData);
    } catch (e) {
      // toast(getMessageError(e), { type: "error" });
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
        code: value.code,
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
      data.vehicle_group = {
        id: value.vehicle_group.id,
      };
      try {
        const res = await handleAddOrEditRequest(idEdit, data)
        .then(() => {
          if (closeForm) {
            closeForm();
          }
          if (reloadTable) {
            reloadTable();
          }
        toast(`${idEdit ? 'Sửa' : 'Thêm'} phương tiện thành công`, { type: 'success' });
      });
      } catch (error: any) {
        console.log(error)
        if(idEdit){
          toast(error?.response?.data?.fieldErrors[0].message, { type: 'error' });
        }else{
          toast(error?.response?.data?.message, { type: 'error' });
        }
      }
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditVehicle)();
    },
  }));
  return (
    <>
      <div className={'infor-wrap'}>
        {idEdit ? (
          <Row gutter={[0, 8]}>
            <Col span={24}>Mã phương tiện:</Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'code',
                  rules: {
                    required: 'Vui lòng nhập mã phương tiện',
                    maxLength: {
                      value: 30,
                      message: 'Không được phép nhập quá 30 ký tự',
                    },
                  },
                }}
                inputProps={{ placeholder: 'Mã phương tiện', disabled: idEdit ? true : false, }}
              />
            </Col>
          </Row>
        ) : (
          <Row gutter={[0, 8]}>
            <Col span={24}>Mã phương tiện:</Col>
            <Col span={24}>
              <MzFormInput
                controllerProps={{
                  control,
                  name: 'code',
                  rules: {
                    maxLength: {
                      value: 30,
                      message: 'Không được phép nhập quá 30 ký tự',
                    },
                  },
                }}
                inputProps={{ placeholder: 'Mã phương tiện' }}
              />
            </Col>
          </Row>
        )}
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên phương tiện:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: 'name',
                rules: {
                  required: 'Vui lòng nhập tên phương tiện',
                  maxLength: {
                    value: 100,
                    message: 'Không được phép nhập quá 100 ký tự',
                  },
                },
              }}
              inputProps={{
                placeholder: 'Tên phương tiện',
              }}
            />
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Nhóm phương tiện:
          </Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'vehicle_group.id',
                rules: { required: 'Vui lòng nhập nhóm phương tiện' },
              }}
              selectProps={{
                placeholder: 'Nhóm phương tiện',
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
              uri={'vehicle-groups?isActive.in=1'}
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

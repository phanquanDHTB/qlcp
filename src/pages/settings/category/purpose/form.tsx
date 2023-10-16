import { Col, Row, Switch, Radio } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { requestCatchHook } from '@utils/hook/handleError';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/purpose/purpose';

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
  const [isCost, setIsCost] = useState(true);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const changeRadio = (e) => {
    setIsCost(e.target.value);
  };
  const getPurpose = async () => {
    try {
        await handleGetDetailsForEditRequest(idEdit).then((res: any) => {
        const resetData = { ...res };
        const service_group: any[] = [];
        if (Array.isArray(resetData.purpose_service_group) && resetData.purpose_service_group.length > 0) {
          resetData.service_group = resetData.purpose_service_group.map((item) => {
            return {
              ...item?.service_group,
              label: item?.service_group.name,
              value: item?.service_group.id,
            };
          });
        }
        setIsActive(resetData.is_active);
        setIsCost(resetData.is_cost);
        setListDefault([service_group]);
        reset(resetData);
      });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getPurpose();
    } else {
      setIsActive(true);
      setIsCost(true);
      reset({ name: null });
    }
  }, [idEdit, closeForm]);
  const addOrEditPurpose = async (value: FieldValues) => {
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
        is_cost: isCost,
        is_active: isActive,
        purpose_service_group: value.service_group
          ? value.service_group.map((item) => {
              return { service_group: { id: item.id ? item.id : item } };
            })
          : null,
      };
      await handleAddOrEditRequest(idEdit, data)
        .then(() => {
          if (closeForm) {
            closeForm();
          }
          if (reloadTable) {
            reloadTable();
          }
          toast(`${idEdit ? 'Sửa' : 'Thêm'} mục đích thành công`, {
            type: 'success',
          });
        })
        .catch((error) => {
          requestCatchHook({ e: error });
        });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditPurpose)();
    },
  }));

  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã mục đích:</Col>
          <Col span={24}>
            {idEdit ? (
              <MzFormInput
                controllerProps={{
                  control,
                  name: "code",
                  rules: {
                    required: "Không được bỏ trống mã mục đích",
                    maxLength: {
                      value: 30,
                      message: "Không được phép nhập quá 30 ký tự",
                    },
                  },
                }}
                inputProps={{
                  placeholder: 'Mã mục đích',
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
                  placeholder: 'Mã mục đích',
                }}
              />
            )}
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Tên mục đích:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: 'name',
                rules: {
                  required: 'Vui lòng nhập tên mục đích',
                  maxLength: {
                    value: 100,
                    message: 'Tên mục đích không quá 100 ký tự',
                  },
                },
              }}
              inputProps={{
                placeholder: 'Tên mục đích',
              }}
            />
          </Col>
        </Row>
        <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
          <Col span={24}>
            <Radio.Group onChange={changeRadio} value={isCost}>
              <Radio value={true}>Lập dự toán chi phí</Radio>
              <Radio value={false}>Không dự toán chi phí</Radio>
            </Radio.Group>
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            <span style={{ color: 'red' }}>*</span> Chi phí áp dụng:
          </Col>
          <Col span={24}>
            {isCost === false ? (
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: "service_group",
                }}
                selectProps={{
                  disabled: !isCost,
                  mode: "multiple",
                  placeholder: "Chi phí áp dụng",
                  allowClear: true,
                  showSearch: true,
                  style: {
                    width: "100%",
                  },
                }}
              />
            ) : (
              <MzFormSelectV2
                isFormItem={true}
                controllerProps={{
                  control,
                  name: "service_group",
                  rules: { required: "Vui lòng chọn chi phí áp dụng" },
                }}
                selectProps={{
                  disabled: !isCost,
                  mode: "multiple",
                  placeholder: "Chi phí áp dụng",
                  allowClear: true,
                  showSearch: true,
                  filterOption: (input, option) => {
                    const optionValue: string | undefined =
                      option?.label !== undefined
                        ? option?.label?.toString()
                        : "";
                    return (
                      toSlug(optionValue ?? "").indexOf(toSlug(input)) > -1
                    );
                  },
                  style: {
                    width: "100%",
                  },
                }}
                uri={"service-groups?isActive.in=1&isDefault.in=true"}
                uriSearch={"name.contains="}
                labelObj={["code", "name"]}
                defaultOption={listDefault[0]}
              />
            )}
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mô tả:</Col>
          <Col span={24}>
            <MzFormInput
              inputType={'TextArea'}
              controllerProps={{
                control,
                name: "description",
                rules: {
                  maxLength: {
                    value: 255,
                    message: "Không nhập quá 255 ký tự",
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

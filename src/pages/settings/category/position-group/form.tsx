import { Col, Row, Switch, Radio } from 'antd';
import { FieldValues, useForm } from 'react-hook-form';
import { useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { requestCatchHook } from '@utils/hook/handleError';
import { IPosition } from 'type';
import { handleGetDetailsForEditRequest, handleAddOrEditRequest } from '../../../../apis/position-group/position-group';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, reset, watch } = useForm();
  const [listDefault, setListDefault] = useState<any>([{}, []]);
  const [isActive, setIsActive] = useState(true);
  const [isCostPrediction, setIsCostPrediction] = useState(true);
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const changeRadio = (e) => {
    setIsCostPrediction(e.target.value);
  };
  const getPositionGroup = async () => {
    try {
      const res = (await handleGetDetailsForEditRequest(idEdit)) as any;
      const resetData = { ...res, ...{ position: [] } };
      const position: any = [];
      // const department: any = {};
      if (resetData.positions && resetData.positions.length > 0) {
        resetData.positions?.map((p: any) => {
          const item: any = {
            label: p?.code + ' - ' + p?.name,
            value: p.id,
            id: p.id,
          };
          position.push(item);
          resetData.position.push(item);
        });
      }
      // if (resetData.department) {
      //   department.label =
      //     resetData.department.code + " - " + resetData.department.name;
      //   department.value = resetData.department.id;
      // }
      setListDefault([position]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getPositionGroup();
    } else {
      reset({ name: null });
    }
  }, [idEdit, closeForm]);
  const addOrEditPositionGroup = async (value: FieldValues) => {
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
        is_cost_prediction: isCostPrediction,
        is_active: isActive,
        positions: [],
      };

      // data.department = value.department.id
      //   ? {
      //       id: value.department.id,
      //     }
      //   : null;
      if (value.position && value.position.length > 0) {
        value.position.map((p) => {
          if(p.id){
            const item = { id: p.id };
            data.positions.push(item);
          }else{
            const item = { id: p };
            data.positions.push(item);
          }
        });
      }
      const res = (await handleAddOrEditRequest(idEdit, data)) as IPosition;
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable(); 
      }
      toast(`${idEdit ? 'Sửa' : 'Thêm'} nhóm chức vụ thành công`, {
        type: 'success',
      });
    } catch (e) {
      // toast(getMessageError(e), { type: "error" });
      requestCatchHook({ e: e });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditPositionGroup)();
    },
  }));

  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[0, 8]}>
          <Col span={24}>Mã nhóm chức vụ:</Col>
          <Col span={24}>
            {idEdit ? <MzFormInput
              controllerProps={{ control, name: "code", 
                rules: { required: "Vui lòng nhập mã nhóm chức vụ",
                maxLength: {
                  value: 30,
                  message: "Không được phép nhập quá 30 ký tự",
                },
               }  

               }}
              inputProps={{
                placeholder: "Mã nhóm chức vụ",
                disabled: idEdit ? true : false,
              }}
            />  : <MzFormInput
            controllerProps={{ control, name: "code",rules: {
            maxLength: {
              value: 30,
              message: "Không được phép nhập quá 30 ký tự",
            },
           }   }}
            inputProps={{
              placeholder: "Mã nhóm chức vụ",
            }}
          />}
          </Col>
        </Row>
        <Row gutter={[0, 8]}>
          <Col span={24}>
            {' '}
            <span style={{ color: 'red' }}>*</span> Tên nhóm chức vụ:
          </Col>
          <Col span={24}>
            <MzFormInput
              controllerProps={{
                control,
                name: "name",
                rules: { required: "Vui lòng nhập tên nhóm chức vụ", maxLength: {
                  value: 100,
                  message: "Không được phép nhập quá 100 ký tự",
                } },
              }}
              inputProps={{
                placeholder: 'Tên nhóm chức vụ',
              }}
            />
          </Col>
        </Row>
        <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
          <Col span={24}>
            <Radio.Group onChange={changeRadio} value={isCostPrediction}>
              <Radio value={true}>Dự toán chi phí</Radio>
              <Radio value={false}>Không dự toán chi phí</Radio>
            </Radio.Group>
          </Col>
        </Row>
        {/* <Row gutter={[0, 8]}>
          <Col span={24}>Đơn vị:</Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{  
                control,
                name: "department.id",
                // rules: { required: "Vui lòng chọn đơn vị" },
              }}
              selectProps={{
                placeholder: "Đơn vị",
                allowClear: true,
                showSearch: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined =
                    option?.label !== undefined
                      ? option?.label?.toString()
                      : "";
                  return toSlug(optionValue ?? "").indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: "100%",
                },
              }}
              uri={"departments?isActive.in=1"}
              uriSearch={"name.contains="}
              labelObj={["code", "name"]}
              valueObj="id"
              defaultOption={listDefault[0]}
            />
          </Col>
        </Row> */}
        <Row gutter={[0, 8]}>
          <Col span={24}>Chức vụ:</Col>
          <Col span={24}>
            <MzFormSelectV2
              isFormItem={true}
              controllerProps={{
                control,
                name: 'position',
              }}
              selectProps={{
                placeholder: 'Chức vụ',
                allowClear: true,
                showSearch: true,
                mode: 'multiple',
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: '100%',
                },
              }}
              uri={'positions?isActive.in=1'}
              uriSearch={'keyWord='}
              labelObj={['code', 'name']}
              defaultOption={watch("position.id")}
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
                  validate: (v) => {
                    if (v?.length > 255) {
                      return 'Không được phép nhập quá 255 kí tự';
                    } else {
                      return true;
                    }
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

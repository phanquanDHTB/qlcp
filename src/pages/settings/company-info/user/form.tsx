
import { Modal, Col, Row, Switch, Upload, UploadFile } from 'antd';
import { RcFile, UploadProps } from 'antd/es/upload';
import { FieldValues, useForm } from 'react-hook-form';
import { PlusOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import {useState, useImperativeHandle, forwardRef, useEffect } from 'react';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import toSlug from '@utils/toSlug';
import getMessageError from '@utils/getMessageError';
import { MzFormPassword } from '@components/forms/FormPassword';
import './formCss.css';
import { handleAddOrEditRequest, handleGetDetailsForEditRequest } from '../../../../apis/user/user';

interface Props {
  idEdit?: number | null;
  reloadTable?: () => void;
  closeForm?: () => void;
}
const Form = forwardRef((props: Props, ref) => {
  const { idEdit, reloadTable, closeForm } = props;
  const { control, handleSubmit, reset } = useForm();
  const [isActive, setIsActive] = useState(true);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const onChangeStatus = (checked) => {
    setIsActive(checked);
  };
  const getDistrict = async () => {
    try {
      const res = (handleGetDetailsForEditRequest(idEdit)) as any;
      const resetData = { ...res };

      // setListDefault([ward,district,province,country]);
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
        is_active: isActive,
      };

      const res = (await handleAddOrEditRequest(idEdit,data)) as any;
      if (closeForm) {
        closeForm();
      }
      if (reloadTable) {
        reloadTable();
      }

      toast(`${idEdit ? 'Sửa' : 'Thêm'} nhân viên thành công`, {
        type: 'success',
      });
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditDistrict)();
    },
  }));
  const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  const handlePreview = async (file: UploadFile) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj as RcFile);
    }

    setPreviewImage(file.url || (file.preview as string));
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
  };
  const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);
  const handleCancel = () => setPreviewOpen(false);
  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh</div>
    </div>
  );
  return (
    <>
      <div className={'infor-wrap'}>
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6}> Ảnh đại diện:</Col>
              <Col span={18}>
                {
                  <Upload listType="picture-card" fileList={fileList} onPreview={handlePreview} onChange={handleChange}>
                    {fileList.length >= 8 ? null : uploadButton}
                  </Upload>
                }

                <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
                  <img alt="example" style={{ width: '100%' }} src={previewImage} />
                </Modal>
              </Col>
            </Row>
            <Row style={{ marginBottom: '8px' }}>
              <Col span={6}> Trạng thái:</Col>
              <Col span={18}>
                <Switch checked={isActive} onChange={onChangeStatus} />
              </Col>
            </Row>
          </Col>
          <Col span={16}>
            <Col span={24} style={{ marginBottom: '8px' }}>
              <Col span={8}>
                <span className="col_form_custom">Thông tin nhân viên:</span>
              </Col>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={6}>Họ và tên:</Col>
                <Col span={18}>
                  <MzFormInput
                    controllerProps={{
                      control,
                      name: 'full_name',
                      rules: { required: 'Vui lòng nhập họ và tên' },
                    }}
                    inputProps={{
                      placeholder: 'Họ và tên',
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={6}>Số điện thoại:</Col>
                <Col span={18}>
                  <MzFormInput
                    controllerProps={{
                      control,
                      name: 'phone_number',
                      rules: { required: 'Vui lòng nhập số điện thoại' },
                    }}
                    inputProps={{
                      placeholder: 'Số điện thoại',
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={6}>Email:</Col>
                <Col span={18}>
                  <MzFormInput
                    controllerProps={{
                      control,
                      name: 'email',
                      rules: { required: 'Vui lòng nhập email' },
                    }}
                    inputProps={{
                      placeholder: 'Email',
                    }}
                  />
                </Col>
              </Row>
            </Col>
            <Col span={24} style={{ marginBottom: '8px' }}>
              <Col span={8}>
                <span className="col_form_custom">Thông tin tài khoản:</span>
              </Col>
            </Col>
            <Col span={24}>
              <Row>
                <Col span={6}>
                  <span style={{ color: 'red' }}>*</span>Tài khoản:
                </Col>
                <Col span={18}>
                  <MzFormInput
                    controllerProps={{
                      control,
                      name: 'username',
                      rules: { required: 'Vui lòng nhập tài khoản' },
                    }}
                    inputProps={{
                      placeholder: 'tài khoản',
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={6}>
                  <span style={{ color: 'red' }}>*</span>Mật khẩu:
                </Col>
                <Col span={18}>
                  <MzFormPassword
                    controllerProps={{
                      control,
                      name: 'password',
                      rules: {
                        required: 'Vui lòng nhập mật khẩu',
                      },
                    }}
                    inputProps={{
                      allowClear: true,
                      placeholder: 'Mật khẩu',
                      size: 'middle',
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={6}>
                  <span style={{ color: 'red' }}>*</span>Xác nhận mật khẩu:
                </Col>
                <Col span={18}>
                  <MzFormPassword
                    controllerProps={{
                      control,
                      name: 'password',
                      rules: {
                        required: 'Vui lòng xác nhận mật khẩu',
                      },
                    }}
                    inputProps={{
                      allowClear: true,
                      placeholder: 'Xác nhận mật khẩu',
                      size: 'middle',
                    }}
                  />
                </Col>
              </Row>
              <Row>
                <Col span={6}>Quyền:</Col>
                <Col span={18}>
                  <MzFormSelectV2
                    isFormItem={true}
                    controllerProps={{
                      control,
                      name: 'role.id',
                      // rules: { required: "Vui lòng chọn tỉnh" },
                    }}
                    selectProps={{
                      placeholder: 'Quyền',
                      allowClear: true,
                      showSearch: true,
                      filterOption: (input, option) => {
                        const optionValue: string | undefined =
                          option?.label !== undefined ? option?.label?.toString() : '';
                        return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                      },
                      style: {
                        width: '100%',
                      },
                    }}
                    uri={`roles?isActive.in[]=${1}`}
                    uriSearch={'name.contains='}
                    labelObj={['name']}
                    valueObj="id"
                    // defaultOption={listDefaul[0]}
                    // onChangeValue={(value) => {
                    //   const data = getValues();
                    //   reset(
                    //     Object.assign(data, {
                    //       province: value ? { id: value.value } : null,
                    //       airport: null,
                    //     })
                    //   );
                    // }}
                  />
                </Col>
              </Row>
            </Col>
          </Col>
        </Row>
      </div>
    </>
  );
});

export default Form;

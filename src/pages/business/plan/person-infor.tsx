import TableData from '@components/TableData';
import { Button, Col, Collapse, Row, Spin } from 'antd';
import { PlusCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { regexTest } from '@utils/validate';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { DeleteOutlined } from '@ant-design/icons';
import toSlug from '@utils/toSlug';
import { MzFormSelectV2 } from '@components/forms/FormSelectV2';
import { v4 } from 'uuid';
import FormInput from '@components/FormInput';
import { addOrEditPlanUser, deleteUserRequest, getPlanUserRequest } from '../../../apis/page/business/plan/person-infor';

const { Panel } = Collapse;

export const personType = {
  nhan_vien: 1,
  doi_tac: 2
}
interface IPersonInfor {
  idEdit?: number | null;
  idParent?: number | null;
  callbackSuccess: () => void;
  callbackLoading?: (loading: boolean) => void;
}

const PersonInfor = forwardRef((props: IPersonInfor, ref) => {
  const { idEdit, callbackSuccess, idParent, callbackLoading } = props;

  const [loading, setLoading] = useState<boolean>(false);

  const { control, setValue, watch, handleSubmit, setError, clearErrors } = useForm({
    mode: 'onTouched',
  });
  const [isAdd, setIsAdd] = useState(true);

  const personfields = useFieldArray({
    control,
    name: 'listPerson',
    keyName: '_id',
  });

  const partnerFields = useFieldArray({
    control,
    name: 'listPartner',
    keyName: '_id',
  });

  const department = useFieldArray({
    control,
    name: 'department',
    keyName: '_id',
  });

  // const defaulPosition = useFieldArray({
  //     control,
  //     name: 'defaulPosition',
  //     keyName: '_id'
  // })

  const columnsEmployee = [
    {
      title: 'STT',
      dataIndex: 'name',
      key: 'name',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Đơn vị',
      key: 'age',
      width: 200,
      render: (_, __, index) => {
        return (
          <div style={{ width: '250px' }}>
            <MzFormSelectV2
              labelObj={['code', 'name']}
              valueObj={'id'}
              defaultOption={watch(`department.${index}`) || {}}
              controllerProps={{
                control,
                name: `listPerson.${index}.department.id`,
                rules: { required: 'Vui lòng chọn cán bộ đi công tác' },
              }}
              selectProps={{
                placeholder: 'Đơn vị yêu cầu',
                allowClear: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: '100%',
                },
              }}
              uri={'departments?isActive.in=1'}
              uriSearch={'name.contains='}
              onChangeValue={(e) => {
                setValue(`department.${index}`, e);
                if (e === undefined) {
                  personfields.update(index, {});
                } else {
                  personfields.update(index, { department: e });
                }
                setValue(`listPerson.${index}.user.id`, null);
                setValue(`userSelect.${index}`, {});
              }}
            />
          </div>
        );
      },
    },
    {
      title: 'Mã nhân viên',
      dataIndex: 'address',
      key: 'address',
      width: 230,
      render: (_, __, index) => {
        return (
          <>
            <MzFormSelectV2
              labelObj={['code', 'fullName']}
              valueObj={'id'}
              defaultOption={watch(`userSelect.${index}`) || {}}
              controllerProps={{
                control,
                name: `listPerson.${index}.user.id`,
                rules: { required: 'Vui lòng chọn cán bộ đi công tác' },
              }}
              selectProps={{
                allowClear: true,
                filterOption: (input, option) => {
                  const optionValue: string | undefined = option?.label !== undefined ? option?.label?.toString() : '';
                  return toSlug(optionValue ?? '').indexOf(toSlug(input)) > -1;
                },
                style: {
                  width: '100%',
                },
                placeholder: 'Mã nhân viên',
                onSelect: (_, options) => {
                  const data = {
                    name: options.fullName,
                    phone_number: options.phone_number,
                    account_number: options.bank_account_number,
                    bank: options.bank_name,
                    gender: options.gender,
                    email: options.email,
                    plan: { id: idEdit },
                    user: { id: options.id },
                    position: options.position?.name,
                    code: options.code,
                  };
                  personfields.update(
                    index,
                    Object.assign(personfields.fields[index], data, {
                      department: {
                        id: watch(`listPerson.${index}.department.id`),
                      },
                    })
                  );
                },
              }}
              uri={`user-departments/users?departmentId=${watch(`listPerson.${index}.department.id`)}&isActive.in=1`}
              uriSearch={'name.contains='}
              onChangeValue={async (e) => {
                console.log(e);
                if (e?.value) {
                  setValue(`userSelect.${index}`, e);
                  const id = watch('listPerson')?.find((i: any) => i.user?.id === e.value);
                  if (id) {
                    setTimeout(() => {
                      setValue(`listPerson.${index}.user.id`, null);
                      personfields.update(index, {
                        department: {
                          id: watch(`listPerson.${index}.department.id`),
                        },
                      });
                    }, 100);
                    toast('Nhân viên đã được tham gia vào kế hoạch', { type: 'error' });
                    return;
                  }
                }
                if (!e) {
                  setTimeout(() => {
                    personfields.update(index, {
                      department: {
                        id: watch(`listPerson.${index}.department.id`),
                      },
                    });
                  }, 100);
                }
                if ((e && e?.gender === 'O') || e?.gender === null) {
                  setError(`error.${index}`, { message: 'Vui lòng cập nhật giới tính của nhân viên' });
                  return;
                } else {
                  clearErrors(`error.${index}`);
                }
              }}
            />
          </>
        );
      },
    },
    {
      title: 'Chức vụ',
      dataIndex: 'position',
      width: 200,
    },
    {
      title: 'Họ tên',
      dataIndex: 'name',
      render: (v) => v || '--',
      width: 200,
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      width: 200,
      render: (v) => {
        if (v === 'M') {
          return 'Nam';
        } else if (v === 'G') {
          return 'Nữ';
        } else {
          return '--';
        }
      },
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bank',
      render: (v) => v || '--',
      width: 300
    },
    {
      title: 'Tài khoản',
      dataIndex: 'account_number',
      render: (v) => v || '--',
      width: 300
    },
    {
      title: 'SĐT',
      dataIndex: 'phone_number',
      render: (v) => (v ? <a href={`tel:${v}`}>{v}</a> : '--'),
      width: 150,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (v) => (v ? <a href={`mailto:${v}`}>{v}</a> : '--'),
      width: 200,
    },
    {
      title: 'Hành động',
      dataIndex: 'id',
      key: 'address',
      width: 200,
      render: (v, _, index) => (
        <div style={{ textAlign: 'center' }}>
          <Button
            icon={<DeleteOutlined />}
            onClick={async () => {
              if (v) {
                try {
                  await deleteUserRequest(v);
                  personfields.remove(index);
                  department.remove(index);
                } catch (err: any) {
                  toast.error(err.response.data.message);
                }
              } else {
                personfields.remove(index);
                department.remove(index);
              }
              clearErrors(`error.${index}`);
            }}
          ></Button>
        </div>
      ),
    },
  ];

  function isValid(string) {
    return regexTest.test(string);
  }
  const columnsPartner = [
    {
      title: 'STT',
      dataIndex: '',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: () => (
        <Row>
          <Col style={{ color: 'red' }}>*</Col>
          <Col>Họ tên</Col>
        </Row>
      ),
      dataIndex: 'name',
      render: (_, __, index) => (
        <FormInput
          name={`listPartner.${index}.name`}
          control={control}
          rules={{
            required: 'Nhập đầy đủ họ tên',
            validate: (value) => {
              if (value) {
                if (isValid(value.replace(/\s+/g, ''))) {
                  return true;
                } else {
                  return 'Tên không hợp lệ';
                }
              } else {
                return true;
              }
            },
          }}
          isToast={true}
          style={{
            width: '100%',
          }}
          placeholder={'Họ tên'}
          maxLength={99}
        />
      ),
    },
    {
      title: 'Cơ quan đơn vị',
      dataIndex: 'department_name',
      render: (_, __, index) => (
        <FormInput
          name={`listPartner.${index}.department_name`}
          control={control}
          rules={{
            validate: (value) => {
              if (value) {
                if (value.length <= 100) {
                  return true;
                } else {
                  return 'Tên cơ quan quá dài';
                }
              } else {
                return true;
              }
            },
          }}
          isToast={true}
          placeholder={'Tên cơ quan đơn vị'}
          maxLength={99}
        />
      ),
    },
    // {
    //     title: "Chức vụ",
    //     dataIndex: "position",
    //     render: (_, __, index) => (
    //         <FormInput
    //             name={`listPartner.${index}.position`}
    //             control={control}
    //             rules={{
    //                 validate: (value) => {
    //                     if (value) {
    //                         if (value.length <= 100) {
    //                             return true;
    //                         } else {
    //                             return "Tên chức vụ quá dài";
    //                         }
    //                     } else {
    //                         return true;
    //                     }
    //                 },
    //             }}
    //             isToast={true}
    //             placeholder={'Tên chức vụ'}
    //             maxLength={99}
    //         />
    //     ),
    // },
    {
      title: 'SĐT',
      dataIndex: 'phone_number',
      render: (_, __, index) => (
        <FormInput
          name={`listPartner.${index}.phone_number`}
          control={control}
          rules={{
            validate: (value) => {
              if (value) {
                if (value.includes('-')) {
                  return 'Sai định dạng số điện thoại';
                } else if (/([0-9]{1,12})\b/.test(value)) {
                  return true;
                } else {
                  return 'Sai định dạng số điện thoại';
                }
              } else {
                return true;
              }
            },
          }}
          isToast={true}
          placeholder={'Số điện thoại'}
          maxLength={12}
        />
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      render: (_, __, index) => (
        <FormInput
          name={`listPartner.${index}.email`}
          control={control}
          rules={{
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: 'Sai định dạng email',
            },
          }}
          isToast={true}
          placeholder={'Email'}
          maxLength={99}
        />
      ),
    },
    // {
    //     title: () => (
    //         <Row>
    //             <Col>Nhóm chức vụ</Col>
    //         </Row>
    //     ),
    //     dataIndex: "position_group",
    //     render: (_, __, index) => {
    //         return (
    //             <MzFormSelectV2
    //                 controllerProps={{
    //                     control,
    //                     name: `listPartner.${index}.position_group.id`,
    //                 }}
    //                 uri={"position-groups?isActive.in=1"}
    //                 uriSearch={"&name.contains="}
    //                 labelObj={["name"]}
    //                 valueObj={"id"}
    //                 defaultOption={watch(`defaulPosition.${index}`)}
    //                 selectProps={{
    //                     placeholder: "Nhóm chức vụ",
    //                     allowClear: true,
    //                     filterOption: (input, option) => {
    //                         const optionValue: string | undefined =
    //                             option?.label !== undefined ? option?.label?.toString() : "";
    //                         return toSlug(optionValue ?? "").indexOf(toSlug(input)) > -1;
    //                     },
    //                     style: {
    //                         width: "100%",
    //                     },
    //                     onSelect: (_, record) => defaulPosition.update(index, record)
    //                 }}
    //             />
    //         );
    //     },
    //     width: 200,
    // },
    {
      title: 'Hành động',
      dataIndex: 'id',
      render: (v, __, index) => (
        <div style={{ textAlign: 'center' }}>
          <Button
            icon={<DeleteOutlined />}
            onClick={async () => {
              if (v) {
                try {
                  await deleteUserRequest(v);
                  partnerFields.remove(index);
                  // defaulPosition.remove(index)
                } catch (err) {
                  console.log(err)
                }
              } else {
                partnerFields.remove(index);
                // defaulPosition.remove(index)
              }
            }}
          ></Button>
        </div>
      ),
      width: 120,
    },
  ];

  useImperativeHandle(ref, () => ({
    addOrEditPlanUserRef: () => {
      handleSubmit(
        (data) => {
          addOrEditPlanUser(data, isAdd, idEdit, callbackLoading, callbackSuccess);
        },
        (err: any) => {
          if (err) {
            if (err.listPerson) {
              const e = err.listPerson.filter((i) => i !== null)[0];
              const b = Object.values(e)[0] as any;
              toast(b.id.message, { type: 'error' });
            }
            if (err.listPartner) {
              const e = err.listPartner[0];
              const b = Object.values(e)[0] as any;
              if (b?.id) {
                toast(b.id?.message, { type: 'error' });
              } else {
                toast(b.message, { type: 'error' });
              }
            }
            if (err.error) {
              const error = err.error?.filter((i: any) => i !== null);
              if (error?.length) {
                toast(error[0]?.message, { type: 'error' });
              }
            }
            // toast("Vui lòng nhập đầy đủ thông tin", { type: "error" });
          }
        }
      )();
    },
  }));

  const getPlanUser = async (
    params: string,
    count = 1,
    idParent?: number | null,
    idEdit?: number | null,
  ) => {
    try {
      setLoading(true)
      const res = await getPlanUserRequest(params) as any;
      if (count < 0) {
        return;
      }
      if (res.content.length === 0 && idParent) {
        getPlanUser(`plan-users?planId=${idParent}&parentId=${idEdit}`, count - 1);
      } else if (res.content.length > 0) {
        const listPerson = res.content?.filter((i: any) => i.type === personType.nhan_vien);
        const listPartner = res.content?.filter((i: any) => i.type === personType.doi_tac);
        if (count === 0) {
          listPerson.map((i: any) => {
            delete i.id;
            return i;
          });
          listPartner.map((i: any) => {
            delete i.id;
            return i;
          });
        } else {
          if (setIsAdd) {
            setIsAdd(false);
          }
        }
        if (setValue) {
          setValue('listPerson', listPerson);
          setValue('listPartner', listPartner);
        }
        const defaulPosition = listPartner?.map((i: any) => {
          return {
            id: i.position_group?.id,
            label: i.position_group?.name,
            value: i.position_group?.id,
          };
        });
        if (setValue) {
          setValue('defaulPosition', defaulPosition);
        }
        const userSelect = listPerson?.map((i: any) => {
          if (i?.user) {
            i.user.label = i.user.code + ' - ' + i.user.fullName;
            i.user.value = i.user.id;
          }
          return i.user;
        });
        setValue && setValue('userSelect', userSelect);
        if (listPerson.length > 0) {
          const list = listPerson.map((item: any) => {
            return {
              value: item.department?.id,
              label: item.department?.code + ' - ' + item.department?.name,
            };
          });
          setValue && setValue('department', list);
        }
      }

      if (res.content.length === 0 && count === 0) {
        setIsAdd && setIsAdd(true);
      }
      setLoading(false)
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
      setLoading(false)
    }
  };

  useEffect(() => {
    getPlanUser('plan-users?planId=' + idEdit, 1, idParent, idEdit);
  }, []);

  const tablePartner = useMemo(() => {
    return (
      <TableData
        tableProps={{
          columns: columnsPartner,
          dataSource: partnerFields.fields,
          rowKey: '_id',
          scroll: {
            x: 1720
          },
          loading: loading
        }}
      />
    );
  }, [partnerFields.fields]);

  const tablePerson = useMemo(() => {
    return (
      <TableData
        tableProps={{
          columns: columnsEmployee,
          dataSource: personfields.fields,
          rowKey: '_id',
          // scroll: {
          //   x: 1720
          // },
          loading: loading,
          // loading: (idEdit ? loading : undefined),
        }}
      />
    );
  }, [personfields.fields]);

  const [active, setActive] = useState<any>(['1']);

  return (
    <div style={{ marginTop: 30 }}>
      <Collapse defaultActiveKey={active} onChange={(e) => setActive(e)}>
        <Panel header={<h3>Danh sách cán bộ đi công tác</h3>} key={'1'}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '10vh' }}>
              <Spin size="large" />
            </div>
          ) : (
            <div
            >
              {tablePerson}
            </div>
          )}
          <Row>
            <Col span={24}>
              <Button
                style={{ width: '100%', marginTop: '15px', borderRadius: 0 }}
                type="dashed"
                icon={<PlusCircleOutlined />}
                onClick={() => {
                  personfields.append({ _id: v4() });
                }}
              >
                Thêm nhân viên
              </Button>
            </Col>
          </Row>
        </Panel>
        <Panel header={<h3>Danh sách đối tác</h3>} key={'2'}>
          {loading ? (
            <div style={{ textAlign: 'center', marginTop: '10vh' }}>
              <Spin size="large" />
            </div>
          ) : (
            <>
              {tablePartner}
            </>
          )}
          <Row>
            <Col span={24}>
              <Button
                style={{ width: '100%', marginTop: '15px', borderRadius: 0 }}
                type="dashed"
                icon={<PlusCircleOutlined />}
                onClick={() => partnerFields.append({ _id: v4() })}
              >
                Thêm đối tác
              </Button>
            </Col>
          </Row>
        </Panel>
      </Collapse>
    </div>
  );
});

export default PersonInfor;

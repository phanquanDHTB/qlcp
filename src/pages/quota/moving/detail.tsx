import {  Col, Radio, Row, Switch, message } from 'antd';
import dayjs from 'dayjs';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'react-toastify';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import getMessageError from '@utils/getMessageError';
import { formatDate } from '@utils/formatDate';
import './style.scss';
import {  quotaTypeEnum } from '../../../constants/enumConmon';
import Constants from '../../../constants/Constants';
import formatNumber from '@utils/formatNumber';
import { addOrEditmoving, detail } from '../../../apis/moving-quota';

export interface ISelect {
  label: string;
  value: number;
}

interface IProps {
  callback?: (id: number, idParent: number, departmentProcess: any) => void;
  idEdit: number | null;
}

const Infor = forwardRef((props: IProps, ref) => {
  const { callback, idEdit } = props;

  const { control, handleSubmit, watch, reset, setValue } = useForm();
  const [listDefaul, setListDefaul] = useState<any>([{}, {}, {}]);

  const getMovingQuota = async () => {
    try {
      const res = (await detail(idEdit)) as any;
      const resetData = { ...res };
      const country: any = {};
      setIsActive(resetData?.is_active != null ? resetData?.is_active : true);
      if (resetData.country) {
        country.label = resetData.country.name;
        country.value = resetData.country.id;
      }

      setListDefaul([country]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getMovingQuota();
    } else {
      reset({
        name: null,
        type: quotaTypeEnum.TRONG_NUOC,
        service_group: Constants.categoryDefault.serviceGroup.PHU_CAP_LUU_TRU,
        country: Constants.categoryDefault.vietNamCountry,
      });
    }
  }, [idEdit]);

  useEffect(() => {
    // setValue("airport.id", null);
  }, [watch('province.id')]);

  const [isActive, setIsActive] = useState(true);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditForm)();
    },
  }));

  const addOrEditForm = async (value: FieldValues) => {
    try {
      const data = {
        id: idEdit,
        type: value.type,
        is_active: isActive,
        code: value.code || null,
        start_time: dayjs(value.start_time).toISOString(),
        end_time: dayjs(value.end_time).toISOString(),
        country: value?.country ? value?.country : null,
        from_distance: value.from_distance,
        to_distance: value.to_distance,
        amount: value.amount,
        description: value.description,
      };

      addOrEditmoving(idEdit, data)
        .then(() => {
          message.success('Lưu thành công');
        })
        .catch((error) => {
          console.log(error);
        });

      // if (callback) {
      //   callback(res.id, watch("parent.id"), {});
      // }
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };

  return (
    <div className={'form-wrap'}>
      <Row>
        <Col span={12}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={24} style={{ fontWeight: '600' }}>
              Hình thức công tác:
            </Col>
            <Col span={24}>
              <Controller
                name={'type'}
                control={control}
                render={({ field }) => (
                  <Radio.Group {...field} defaultValue={quotaTypeEnum.TRONG_NUOC} disabled={true}>
                    <Radio value={quotaTypeEnum.TRONG_NUOC}>Trong nước</Radio>
                    <Radio value={quotaTypeEnum.NGOAI_NUOC}>Nước ngoài</Radio>
                  </Radio.Group>
                )}
              />
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={24} style={{ fontWeight: '600' }}>
              Trạng thái:
            </Col>
            <Col span={24}>
              <Switch checked={isActive} onChange={(e) => setIsActive(e)} disabled={true}></Switch>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={24} style={{ fontWeight: '600' }}>
              Quốc gia:
            </Col>
            <Col span={24}>
              <span>{watch('country') ? watch('country.name') : '--'}</span>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col span={12}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={24} style={{ fontWeight: '600' }}>
              Từ khoảng cách:
            </Col>
            <Col span={24}>
              <span>{watch('from_distance') ? watch('from_distance') : '--'}</span>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={24} style={{ fontWeight: '600' }}>
              Đến khoảng cách:
            </Col>
            <Col span={24}>
              <span>{watch('to_distance') ? watch('to_distance') : '--'}</span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col span={24}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={24} style={{ fontWeight: '600' }}>
              Định mức:
            </Col>
            <Col span={24}>
              <span>{watch('amount') ? formatNumber(watch('amount')) : '--'}</span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row>
        <Col span={12}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col span={24} style={{ fontWeight: '600' }}>
              Ngày bắt đầu:
            </Col>
            <Col span={24}>
              <span>{watch('start_time') ? formatDate(watch('start_time')) : '--'}</span>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
            <Col
              span={24}
              style={{
                fontWeight: '600',
              }}
            >
              Ngày kết thúc:
            </Col>
            <Col span={24}>
              <span>{watch('end_time') ? formatDate(watch('end_time')) : '--'}</span>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
        <Col span={24} style={{ fontWeight: '600' }}>
          Mô tả:
        </Col>
        <Col span={24}>
          <span>{watch('description') ? watch('description') : '--'}</span>
        </Col>
      </Row>
    </div>
  );
});

export default Infor;

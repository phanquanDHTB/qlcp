import { Col, Radio, Row, Switch, message } from 'antd';
import dayjs from 'dayjs';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import './style.scss'; 
import { quotaTypeEnum } from '../../../constants/enumConmon';
import formatNumber from '@utils/formatNumber';
import { addOrEditAirQuota, getAirPortQuotaRequest } from '../../../apis/airport-quota/airport-quota';

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
  const [listDefaul, setListDefaul] = useState<any>([{}, {}]);

  const getAirportQuota = async () => {
    try {
      const res = await getAirPortQuotaRequest(idEdit) as any;
      const resetData = { ...res };
      
      const province: any = {};
      const airport: any = {};
      setIsActive(resetData?.is_active);
      resetData.end_date = dayjs(resetData.end_date).format('DD/MM/YYYY');
      resetData.start_date = dayjs(resetData.start_date).format('DD/MM/YYYY');
      if (resetData.province) {
        province.label = resetData.province.name;
        province.value = resetData.province.id;
      }
      if (resetData.airport) {
        airport.label = resetData.airport.name;
        airport.value = resetData.airport.id;
      }
      setListDefaul([province, airport]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getAirportQuota();
    } else {
      reset({ name: null });
    }
  }, [idEdit]);

  useEffect(() => {
    // setValue("airport.id", null);
  }, [watch('province.id')]);

  console.log(listDefaul);
  const [additionalPlan, setAdditionalPlan] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useImperativeHandle(ref, () => ({
    submitForm: () => {
      handleSubmit(addOrEditForm)();
    },
  }));

  const addOrEditForm = async (value: FieldValues) => {
    try {
      const data: any = {
        id: idEdit,
        type: value.type,
        is_active: isActive,
        code: value.code || null,
        start_date: dayjs(value.start_date).toISOString(),
        end_date: dayjs(value.end_date).toISOString(),
        province: value.province,
        airport: value.airport,
        amount: value.amount,
        description: value.description,
      };

      const res = await addOrEditAirQuota(idEdit, data) as any;
      message.success('Lưu thành công');

      if (callback) {
        callback(res.id, watch('parent.id'), {});
      }
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };

  return (
    <div className={'form-wrap'}>
      <Row style={{ marginBottom: '12px' }} gutter={[16, 16]}>
        <Col span={12}>
          <Row>
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
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Trạng thái:
            </Col>
            <Col span={24}>
              <Switch checked={isActive} onChange={(e) => setIsActive(e)} disabled={true}></Switch>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ marginBottom: '12px' }} gutter={[16, 16]}>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Tỉnh:
            </Col>
            <Col span={24}>
              <span>{watch('province.name') ? watch('province.name') : '--'}</span>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Sân bay:
            </Col>
            <Col span={24}>
              <span>{watch('airport.name') ? watch('airport.name') : '--'}</span>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row></Row>

      <Row style={{ marginBottom: '12px' }} gutter={[16, 16]}>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Ngày bắt đầu:
            </Col>
            <Col span={24}>{watch('start_date') ? watch('start_date') : '--'}</Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col
              span={24}
              style={{
                fontWeight: '600',
              }}
            >
              Ngày kết thúc:
            </Col>
            <Col span={24}>{watch('end_date') ? watch('end_date') : '--'}</Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ marginBottom: '12px' }} gutter={[16, 16]}>
        <Col span={24} style={{ fontWeight: '600' }}>
          Định mức:
        </Col>
        <Col span={24}>{watch('amount') ? formatNumber(watch('amount')) : '0'}</Col>
      </Row>
      <Row style={{ marginBottom: '12px' }} gutter={[16, 16]}>
        <Col span={24} style={{ fontWeight: '600' }}>
          Mô tả:
        </Col>
        <Col span={24}>{watch('description') ? watch('description') : '--'}</Col>
      </Row>
    </div>
  );
});

export default Infor;

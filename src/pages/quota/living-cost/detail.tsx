import { Checkbox, Col, Radio, RadioChangeEvent, Row, Space, Switch, message } from 'antd';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { MzFormInput } from '@components/forms/FormInput';
import { MzFormInputNumber } from '@components/forms/FormNumber';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { formatDate } from '@utils/formatDate';
import './style.scss';
import { quotaTypeEnum } from '../../../constants/enumConmon';
import Constants from '../../../constants/Constants';
import formatNumber from '@utils/formatNumber';
import { detail } from '../../../apis/living-cost-quota';

export interface ISelect {
  label: string;
  value: number;
}

interface IProps {
  callback?: (id: number, idParent: number, departmentProcess: any) => void;
  idEdit: number | null;
}

const Infor = forwardRef((props: IProps) => {
  const { callback, idEdit } = props;

  const { control, handleSubmit, watch, reset, setValue } = useForm();
  const [listDefaul, setListDefaul] = useState<any>([{}, {}, {}]);

  const getLivingQuota = async () => {
    try {
      const res = (await detail(idEdit)) as any;
      const resetData = { ...res };
      const service_group: any = {};
      const service: any = {};
      const country: any = {};
      setIsActive(resetData?.is_active != null ? resetData?.is_active : true);
      if (resetData.service_group) {
        service_group.label = resetData.service_group.name;
        service_group.value = resetData.service_group.id;
      }
      if (resetData.service) {
        service.label = resetData.service.name;
        service.value = resetData.service.id;
      }

      if (resetData.country) {
        country.label = resetData.country.name;
        country.value = resetData.country.id;
      }

      setListDefaul([country, service_group, service]);
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getLivingQuota();
    } else {
      reset({
        name: null,
        type: quotaTypeEnum.TRONG_NUOC,
        service_group: Constants.categoryDefault.serviceGroup.PHU_CAP_LUU_TRU,
        country: Constants.categoryDefault.vietNamCountry,
      });
    }
  }, [idEdit]);

  const [isActive, setIsActive] = useState(true);

  return (
    <div className={'form-wrap'}>
      <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
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
      <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
        <Col span={12}>
          <Col span={24} style={{ fontWeight: '600' }}>
            Quốc gia:
          </Col>
          <Col span={24}>
            <span>{watch('country.name') ? watch('country.name') : '--'}</span>
          </Col>
        </Col>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Nhóm dịch vụ:
            </Col>
            <Col span={24}>
              <span>{watch('service_group') ? watch('service_group.name') : '--'}</span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Định mức:
            </Col>
            <Col span={24}>
              <span>{watch('amount') ? formatNumber(watch('amount')) : '--'}</span>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Dịch vụ:
            </Col>
            <Col span={24}>
              <span>{watch('service') ? watch('service.name') : '--'}</span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Ngày bắt đầu:
            </Col>
            <Col span={24}>
              <span>{watch('start_date') ? formatDate(watch('start_date')) : '--'}</span>
            </Col>
          </Row>
        </Col>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Ngày kết thúc:
            </Col>
            <Col span={24}>
              <span>{watch('end_date') ? formatDate(watch('end_date')) : '--'}</span>
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

import { Col, Radio, Row, Switch, message } from 'antd';
import dayjs from 'dayjs';
import { Controller, FieldValues, useForm } from 'react-hook-form';
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { toast } from 'react-toastify';
import getMessageError from '@utils/getMessageError';
import { formatDate } from '@utils/formatDate';
import './style.scss';
import { quotaTypeEnum } from '../../../constants/enumConmon';
import Constants from '../../../constants/Constants';
import formatNumber from '@utils/formatNumber';
import { addOrEditHotel, detail } from '../../../apis/hotel-quota';

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

  const getHotelQuota = async () => { 
    try {
      const res = (await detail(idEdit)) as any;
      const resetData = { ...res };
      const service_group: any = {};
      const service: any = {};
      const position_group: any = {};
      const country: any = {};
      const province: any = {};
      const district: any = {};

      setIsActive(resetData?.is_active != null ? resetData?.is_active : true);
      if (resetData.service_group) {
        service_group.label = resetData.service_group.name;
        service_group.value = resetData.service_group.id;
      }
      if (resetData.service) {
        service.label = resetData.service.name;
        service.value = resetData.service.id;
      }
      if (resetData.position_group) {
        position_group.label = resetData.position_group.name;
        position_group.value = resetData.position_group.id;
      }
      if (resetData.country) {
        country.label = resetData.country.name;
        country.value = resetData.country.id;
      }
      if (resetData.province) {
        province.label = resetData.province.name;
        province.value = resetData.province.id;
      }
      if (resetData.district) {
        district.label = resetData.district.name;
        district.value = resetData.district.id;
      }
      setListDefaul([service_group, service, position_group, country, province, district]);
      console.log(resetData, '//resetData');
      reset(resetData);
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };
  useEffect(() => {
    if (idEdit) {
      getHotelQuota();
    } else {
      reset({
        name: null,
        type: quotaTypeEnum.TRONG_NUOC,
        service_group: Constants.categoryDefault.phongNghiServiceGroup,
        country: Constants.categoryDefault.vietNamCountry,
      });
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
        service_group: value.service_group,
        service: value.service,
        amount: value.amount,
        amount_month: value.amount_month,
        single_room_amount: value?.single_room_amount,
        country: value?.country ? value?.country : null,
        province: value?.province ? value?.province : null,
        district: value?.district ? value?.district : null,
        description: value.description,
      };

      const res = (await addOrEditHotel(idEdit, data)) as any;
      message.success('Lưu thành công');

      // if (callback) {
      //   callback(res.id, watch("parent.id"), {});
      // }
    } catch (e) {
      toast(getMessageError(e), { type: 'error' });
    }
  };

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
        <Col
          span={12}
          style={{
            paddingLeft: 20,
          }}
        >
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
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Nhóm dịch vụ:
            </Col>
            <Col span={24}>
              <span>{watch('service_group.name')}</span>
            </Col>
          </Row>
        </Col>
        <Col
          span={12}
          style={{
            paddingLeft: 20,
          }}
        >
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Dịch vụ:
            </Col>
            <Col span={24}>
              <span>{watch('service.name') ? watch('service.name') : '--'}</span>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Nhóm chức vụ:
            </Col>
            <Col span={24}>
              <span>{watch('position_group.name') ? watch('position_group.name') : '--'}</span>
            </Col>
          </Row>
        </Col>
        {watch('type') == quotaTypeEnum.NGOAI_NUOC ? (
          <Col
            span={12}
            style={{
              paddingLeft: 20,
            }}
          >
            <Row>
              <Col span={24} style={{ fontWeight: '600' }}>
                Quốc gia:
              </Col>
              <Col span={24}>
                <span>{watch('country.name') ? watch('country.name') : '--'}</span>
              </Col>
            </Row>
          </Col>
        ) : null}
      </Row>
      {watch('type') == quotaTypeEnum.TRONG_NUOC ? (
        <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
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
          <Col
            span={12}
            style={{
              paddingLeft: 20,
            }}
          >
            <Row>
              <Col span={24} style={{ fontWeight: '600' }}>
                Quận/Huyện:
              </Col>
              <Col span={24}>
                <span>{watch('district.name') ? watch('district.name') : '--'}</span>
              </Col>
            </Row>
          </Col>
        </Row>
      ) : null}

      <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
        <Col span={12}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Định mức:
            </Col>
            <Col span={24}>
              <span>{watch('amount') ? formatNumber(watch('amount')) : '0'}</span>
            </Col>
          </Row>
        </Col>

        <Col
          span={12}
          style={{
            paddingLeft: 20,
          }}
        >
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Định mức theo tháng:
            </Col>
            <Col span={24}>
              <span>{watch('amount_month') ? formatNumber(watch('amount_month')) : '0'}</span>
            </Col>
          </Row>
        </Col>
      </Row>

      <Row style={{ marginBottom: '12px' }} gutter={[0, 8]}>
        <Col span={6}>
          <Row>
            <Col span={24} style={{ fontWeight: '600' }}>
              Ngày bắt đầu:
            </Col>
            <Col span={24}>
              <span>{watch('start_date') ? formatDate(watch('start_date')) : '--'}</span>
            </Col>
          </Row>
        </Col>
        <Col span={6}>
          <Row>
            <Col
              span={24}
              style={{
                paddingLeft: 10,
                fontWeight: '600',
              }}
            >
              Ngày kết thúc:
            </Col>
            <Col
              span={24}
              style={{
                paddingLeft: 10,
              }}
            >
              <span>{watch('end_date') ? formatDate(watch('end_date')) : '0'}</span>
            </Col>
          </Row>
        </Col>
        {watch('service.id') == Constants.categoryDefault.service.PHONG_DOI.id ? (
          <Col
            span={12}
            style={{
              paddingLeft: 20,
            }}
          >
            <Row>
              <Col span={24} style={{ fontWeight: '600' }}>
                Định mức phòng đơn phát sinh:
              </Col>
              <Col span={24}>
                <span>{watch('single_room_amount') ? formatNumber(watch('single_room_amount')) : '0'}</span>
              </Col>
            </Row>
          </Col>
        ) : null}
      </Row>
      <Row>
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

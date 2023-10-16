import { Button, Checkbox, Modal, Space, Spin, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useEffect, useState, useRef } from 'react';
import Text from 'antd/es/typography/Link';
import { toast, ToastContainer } from 'react-toastify';
import dayjs from 'dayjs';
import BasePage, { ColumnTypeCustom } from '@components/BasePage';
import planTitle from '@columnTitles/plan_confirm';
import { formatDate } from '@utils/formatDate';
import getMessageError from '@utils/getMessageError';
import './styles.scss';
import {
  getDataEditRequest,
  getFileRequest,
  updateStatusRequest,
} from '../../../apis/page/business/confirm-plan/index';
import { UserPlan } from '../plan/confirm-info';
import utc from 'dayjs';
import tz from 'dayjs';

dayjs.extend(utc)
dayjs.extend(tz)

const statusText = ['Chờ xác nhận', 'Xác nhận', 'Từ chối'];
export const enum planConfirmStatus { // planConfirm
  init = 1, // or null
  confirm = 2,
  refuse = 3,
}
const ConfirmPlanPage = () => {
  const [modalImg, setModalImg] = useState(false);
  const [loadingImg, setLoadingImg] = useState(false);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [idEdit, setIdEdit] = useState<null | number>(null);
  const [idView, setIdView] = useState<null | number>(null);
  const [dataEdit, setDataEdit] = useState<null | UserPlan>(null);
  const [dataRealisticTravel, setDataRealisticTravel] = useState<any>(null);
  const [dataUser, setDataUser] = useState<any>(null);

  const columnsRealisticTravel: any = [
    { title: 'STT', dataIndex: 'index', render: (value, item, index) => index + 1 },
    { title: 'Thành phố đi', dataIndex: 'fromProvince' },
    { title: 'Quận/ Huyện', dataIndex: 'fromDistrict' },
    { title: 'Thành phố đến', dataIndex: 'toProvince' },
    { title: 'Quận/ Huyện', dataIndex: 'toDistrict' },
    { title: 'Phương tiện công tác', dataIndex: 'vehicle' },
  ];

  const dowloadFileImg = async (file: string, index: number) => {
    const img = document.createElement('img');
    img.id = `img-${index}`;
    img.style.width = '100%';
    img.style.objectFit = 'contain';
    img.style.padding = '0px auto';
    const wrapImg: any = document.getElementById('img-wrap');
    if (wrapImg) {
      wrapImg.appendChild(img);
    }
    try {
      setLoadingImg(true);
      const res = (await getFileRequest(file)) as any;
      const urlCreator = window.URL || window.webkitURL;
      const immg: any = document.getElementById(`img-${index}`);
      if (immg) {
        immg.src = urlCreator.createObjectURL(res);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoadingImg(false);
    }
  };

  const columnsUser: any = [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    { title: 'STT', dataIndex: 'id', render: (_, __, index) => index + 1 },
    { title: 'Mã nhân viên', dataIndex: 'code' },
    { title: 'Họ tên', dataIndex: 'full_name' },
    { title: 'Đi công tác', dataIndex: 'business', render: (v) => <Checkbox checked={v} disabled={true} /> },
    { title: 'Ở nhà khách', dataIndex: 'is_guest_house', render: (v) => <Checkbox checked={v} disabled={true} /> },
    {
      title: 'Từ ngày',
      dataIndex: 'from_date',
      render: (v) => (v ? formatDate(v) : ''),
    },
    {
      title: 'Đến ngày',
      dataIndex: 'to_date',
      render: (v) => (v ? formatDate(v) : ''),
    },
    {
      title: 'Số ngày nghỉ qua đêm',
      dataIndex: 'total_night',
      width: 200,
    },
    {
      title: 'Thời gian checkIn',
      dataIndex: 'plan_checkin',
      render: (v) => {
        return v?.checkin_time ? dayjs.utc(v?.checkin_time).tz('Asia/Ho_Chi_Minh').format('DD-MM-YYYY HH:mm:ss') : '--';
      },
    },
    {
      title: 'Địa điểm checkIn',
      dataIndex: 'plan_checkin',
      render: (v) =>
        v?.checkin_location ? (
          <a
            target="blank"
            href={`https://www.google.com/maps/@${v?.checkin_latitude + ',' + v?.checkin_longitude}z?entry=ttu`}
          >
            {v?.checkin_location}
          </a>
        ) : (
          '--'
        ),
    },
    {
      title: 'Link ảnh checkIn',
      dataIndex: 'plan_checkin',
      render: (v) =>
        v?.checkin_file_id ? (
          <a
            onClick={() => {
              setModalImg(true);
              setTimeout(() => {
                const listUrl = v.checkin_file_id.split(',');
                if (listUrl.length) {
                  listUrl.forEach((i: string, index) => {
                    dowloadFileImg(i, index);
                  });
                }
              }, 500);
            }}
          >
            {v?.checkin_file_id}
          </a>
        ) : (
          '--'
        ),
    },
  ];

  const [view, setView] = useState(false);
  const columns: ColumnTypeCustom<any>[] = [
    {
      width: 250,
      dataIndex: 'code',
      fixed: 'left',
      // isCodeIndex: true,
      render: (value, record) => (
        <Button
          onClick={() => {
            setIdView(record?.id);
            setIsOpenModal(true);
            setView(true);
          }}
          type="link"
        >
          {value}
        </Button>
      ),
    },
    {
      width: 250,
      dataIndex: 'name_of_plan_id',
      nameOfRender: 'code',
    },
    {
      width: 250,
      dataIndex: 'name_of_department_require_id',
    },
    {
      width: 200,
      dataIndex: 'status',
      dataType: 'list',
      dataSource: [
        {
          value: 1,
          text: 'Chờ xác nhận',
        },
        {
          value: 2,
          text: 'Xác nhận',
        },
        {
          value: 3,
          text: 'Từ chối',
        },
      ],
    },
    {
      width: 220,
      dataIndex: 'name_of_user_require_id',
      nameOfRender: 'fullName',
    },
    {
      width: 300,
      dataIndex: 'name_of_plan_route_id',
    },
    {
      width: 200,
      dataIndex: 'start_time',
      dataType: 'date',
    },
    {
      width: 200,
      dataIndex: 'end_time',
      dataType: 'date',
    },
    {
      width: 120,
      dataIndex: 'id',
      align: 'center',
      render: (v, record) =>
        record.status === 1 && (
          <Space>
            <Button
              onClick={() => {
                setIdEdit(v);
                setIsOpenModal(true);
              }}
            >
              <EditOutlined />
            </Button>
          </Space>
        ),
    },
  ];

  const onCloseModal = () => {
    setIdView(null);
    setIdEdit(null);
    setDataUser(null);
    setDataRealisticTravel(null);
    setIsOpenModal(false);
    setView(false);
  };

  useEffect(() => {
    if (idEdit || idView) {
      try {
        const id = idEdit ?? idView;
        const getDataEdit = async () => {
          const response = (await getDataEditRequest(id)) as UserPlan;
          const objDataRealisticTravel = [
            {
              fromProvince: response?.from_province?.name,
              fromDistrict: response?.from_district?.name,
              toProvince: response?.to_province?.name,
              toDistrict: response?.to_district?.name,
              vehicle: response?.vehicle?.name,
              id: 1,
            },
          ] as any;
          if (Array.isArray(response?.plan_confirm_user)) {
            setDataUser(response?.plan_confirm_user);
          }
          setDataRealisticTravel(objDataRealisticTravel);
          setDataEdit(response);
        };
        getDataEdit();
      } catch (e) {
        console.log(e);
      }
    }
    // if (idEdit && dataEdit?.status !== 1) {
    //     toast.error("Phiếu đã xác nhận không thể chỉnh sửa");
    // }
  }, [idEdit, idView]);

  const basePageRef = useRef<{ reloadToStartPage?: () => void; reloadBasePage?: () => void }>();
  const updateStatus = async (status: number) => {
    try {
      await updateStatusRequest(dataEdit, status);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      basePageRef.current?.reloadBasePage();
      toast('Thành công', { type: 'success' });
      onCloseModal();
    } catch (err) {
      toast(getMessageError(err), { type: 'error' });
    }
  };

  console.log(dataEdit)
  return (
    <>
      <Modal
        onCancel={() => setModalImg(false)}
        open={modalImg}
        footer={[<Button onClick={() => setModalImg(false)}>Đóng</Button>]}
        zIndex={999999999999999}
      >
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          {loadingImg && (
            <div style={{ position: 'absolute', top: '45%', left: '45%' }}>
              <Spin size="large" />
            </div>
          )}
          <div id={'img-wrap'} style={{ height: '70vh', overflowY: 'scroll' }}></div>
        </div>
      </Modal>
      <ToastContainer position={'top-center'} />
      <BasePage
        isDeleteButton={true}
        uriFetch="plan-confirms"
        columnTiles={planTitle}
        columns={columns}
        headerTitle={'Xác nhận kế hoạch công tác'}
        ref={basePageRef}
        hiddenRowSelection={true}
      ></BasePage>
      <Modal
        bodyStyle={{
          height: 'calc(100vh - 120px)',
          padding: '0px',
        }}
        style={{
          top: 0,
          height: '100vh',
          maxWidth: '100vw',
        }}
        width={'100vw'}
        open={isOpenModal}
        onCancel={() => onCloseModal()}
        title={idEdit ? 'Sửa xác nhận công tác' : 'Xác nhận công tác'}
        footer={[
          dataEdit && dataEdit.status === 1 && !view ? (
            <>
              <Button key={2} onClick={() => updateStatus(planConfirmStatus.confirm)}>
                Xác nhận
              </Button>
              <Button key={3} onClick={() => updateStatus(planConfirmStatus.refuse)}>
                Từ chối
              </Button>
            </>
          ) : (
            <></>
          ),
          <Button key={1} onClick={() => onCloseModal()} type={'primary'}>
            Đóng
          </Button>,
        ]}
      >
        <div className={'modal-scroll'}>
          <div style={{ display: 'flex', padding: '20px 0' }}>
            <div style={{ width: '50%' }}>
              <div className={'confirm-plan-space'}>
                <div className={'confirm-plan-space__label-left'}>Kế hoạch công tác :</div>
                {dataEdit?.plan?.name}
              </div>
              <div className={'confirm-plan-space'}>
                <div className={'confirm-plan-space__label-left'}> Lộ trình công tác :</div>
                {dataEdit?.plan_route?.name}
              </div>
              <div className={'confirm-plan-space'}>
                <div className={'confirm-plan-space__label-left'}> Đơn vị công tác :</div>
                {dataEdit?.plan_route?.to_department?.name || dataEdit?.plan_route?.to_department_name || '--'}
              </div>
            </div>
            <div style={{ width: '50%' }}>
              <div className={'confirm-plan-space'}>
                Trạng thái :
                <Text style={{ marginLeft: 10 }} type={'danger'}>
                  {dataEdit ? statusText[dataEdit.status - 1] : ''}
                </Text>
              </div>
            </div>
          </div>
          <label className={'confirm-plan-label-tbl'}>Chặng di chuyển thực tế</label>
          <Table
            className={'confirm-plan-table'}
            rowKey={'id'}
            columns={columnsRealisticTravel}
            dataSource={dataRealisticTravel}
            pagination={false}
          />
          <label className={'confirm-plan-label-tbl'}>Danh sách cán bộ</label>
          <Table
            className={'confirm-plan-table'}
            rowKey={'id'}
            columns={columnsUser}
            dataSource={dataUser}
            pagination={false}
          />
        </div>
      </Modal>
    </>
  );
};

export default ConfirmPlanPage;

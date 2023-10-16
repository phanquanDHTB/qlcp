import { Button, Card, Checkbox, Col, Modal, Row, Typography } from 'antd';

import { useEffect, useState } from 'react';

import TableData from '@components/TableData';
import {
    IDocumentType,
    IDocument,
    IDocumentFileList,
    IDocumentUserList,
    IDomain,
    IDocumentContent,
  } from 'type/advance-request-sign-details';
import { downloadFile, getDocumentsApi } from '../../../apis/page/business/plan/advance-request-sign-details';
import { pdfSignPosition } from '../../../constants/enumConmon';

const { Text } = Typography;

interface Props {
  open: boolean;
  title: string;
  idDetails: number | null;
  onCloseModalAdvanceRequestSign: () => void;
}

export const AdvanceRequestSignModal = (props: Props) => {
  const { open, idDetails, onCloseModalAdvanceRequestSign } = props;

  const [data, setData] = useState<IDocument>();
  const [domain, setDomain] = useState<IDomain>();
  const [user, setUser] = useState<IDocumentUserList[] | undefined>([]);
  const [documentAppendix, setDocumentAppendix] = useState<IDocumentFileList[] | undefined>([]);
  const [documentSign, setDocumentSign] = useState<IDocumentFileList[] | undefined>([]);
  const [documentType, setDocumentType] = useState<IDocumentType>();
  const [isAutoPromulgate, setPromulgate] = useState<boolean>();

  const columnFile = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Tên file',
      dataIndex: 'file_name',
      key: 'file_name',
      width: 50,
      render: (v, record) =>
        v && (
          <a
            onClick={async () => {
              try {
                await downloadFile(record);
              } catch (err) {
                console.log(err);
              }
            }}
          >
            {v}
          </a>
        ),
    },
  ];

  const column = [
    {
      title: 'STT',
      dataIndex: 'STT',
      key: 'STT',
      width: 50,
      render: (_, __, index) => index + 1,
    },
    {
      title: 'Nhân viên',
      dataIndex: 'full_name',
      key: 'full_name',
      width: 50,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 50,
      render: (value) => {
        return <a href={`mailto:${value}`}>{value}</a>;
      },
    },
    {
      title: 'Đơn vị - Chức vụ',
      dataIndex: 'position',
      key: 'position',
      width: 100,
    },
    {
      title: 'Hiển thị chữ ký',
      dataIndex: 'is_display',
      key: 'is_display',
      width: 50,
      render: (v) => <Checkbox disabled checked={v}></Checkbox>,
    },
  ];

  const documentStatusLabel = (status: number) => {
    switch (status) {
      case 0:
        return 'Chờ phê duyệt';
      case 1:
        return 'Văn thư từ chối';
      case 2:
        return 'Từ chối';
      case 3:
        return 'Đã ký';
      case 4:
        return 'Hủy';
      case 5:
        return 'Đã kí và ban hành';
      default:
        return status;
    }
  };

  const priorityLabel = (priority: number) => {
    switch (priority) {
      case 1:
        return 'Bình thường';
      case 2:
        return 'Khẩn';
      case 3:
        return 'Hỏa tốc';
      case 4:
        return 'Thượng khẩn';
      default:
        return priority;
    }
  };

  const getData = async () => {
    try {
      const res = (await getDocumentsApi(idDetails)) as IDocumentContent;
      setData(res?.content[0]);
      setDomain(res.content[0]?.domain);
      setUser(res.content[0]?.document_user_list);
      setDocumentSign(res.content[0]?.document_file_list?.filter((item) => item?.position === pdfSignPosition.KE_HOACH_CONG_TAC || item?.position === pdfSignPosition.DE_NGHI_TAM_UNG));
      setDocumentAppendix(res.content[0]?.document_file_list?.filter((item) => item?.position === pdfSignPosition.PHU_LUC_CHI_PHI || item?.position === pdfSignPosition.TONG_HOP_THANH_TOAN));
      setDocumentType(res.content[0]?.document_type);
      setPromulgate(res.content[0]?.isAutoPromulgate);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    if (idDetails) {
      getData();
    }
  }, [idDetails]);

  return (
    <Modal
      open={open}
      title="Chi tiết trình ký"
      style={{ top: 0, height: '100vh', maxWidth: '100vw' }}
      width={'100vw'}
      onCancel={onCloseModalAdvanceRequestSign}
      onOk={onCloseModalAdvanceRequestSign}
      footer={[
        <Button type="primary" key={1} onClick={onCloseModalAdvanceRequestSign}>
          Đóng
        </Button>,
      ]}
    >
      <Card className="card-border" bordered={false} title="Danh sách lộ trình">
        <Row>
          <Col span={12}>
            <Row>
              <Col span={8} className="advance-col">
                {' '}
                <b>Trích yếu nội dung văn bản:</b>
              </Col>
              <Col span={16} className="advance-col">
                {' '}
                <p>{data?.title}</p>{' '}
              </Col>
            </Row>
            <Row>
              <Col span={8} className="advance-col">
                {' '}
                <b>Hình thức văn bản:</b>{' '}
              </Col>
              <Col span={16} className="advance-col">
                {' '}
                {documentType?.name}
              </Col>
            </Row>
            <Row>
              <Col span={8} className="advance-col">
                {' '}
                <b>Độ khẩn:</b>{' '}
              </Col>
              <Col span={16} className="advance-col">
                {' '}
                {data?.priority_id ? priorityLabel(data?.priority_id) : '--'}{' '}
              </Col>
            </Row>
          </Col>
          <Col span={12}>
            <Row>
              <Col span={8} className="advance-col">
                {' '}
                <b>Trạng thái trình ký:</b>{' '}
              </Col>
              <Col span={16} className="advance-col">
                {' '}
                {data?.status !== undefined ? documentStatusLabel(data?.status) : '--'}{' '}
              </Col>
            </Row>
            <Row>
              <Col span={8} className="advance-col">
                {' '}
                <b>Nội dung:</b>{' '}
              </Col>
              <Col span={16} className="advance-col">
                {' '}
                {data?.description}{' '}
              </Col>
            </Row>
            <Row>
              <Col span={8} className="advance-col">
                {' '}
                <b>Ngành:</b>{' '}
              </Col>
              <Col span={16} className="advance-col">
                {' '}
                {domain?.name}{' '}
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>
      <Card className="card-border" bordered={false} title="Danh sách người ký">
        <TableData tableProps={{ columns: column, dataSource: user, rowKey: '_id' }} />
        <Checkbox disabled checked={isAutoPromulgate}>
          {' '}
          <Text strong> Tự động ban hành </Text>
        </Checkbox>
      </Card>
      <Row>
        <Col span={12}>
          <Card className="card-border" bordered={false} title="Văn bản trình ký">
            <TableData tableProps={{ columns: columnFile, dataSource: documentSign, rowKey: '_id' }} />
          </Card>
        </Col>
        <Col span={12}>
          <Card className="card-border" bordered={false} title="Văn bản phụ lục">
            <TableData tableProps={{ columns: columnFile, dataSource: documentAppendix, rowKey: '_id' }} />
          </Card>
        </Col>
      </Row>
    </Modal>
  );
};

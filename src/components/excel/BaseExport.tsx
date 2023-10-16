import { Button, Empty, Table, Tag, Pagination, Popconfirm, Modal } from 'antd';
import { useState, type PropsWithChildren, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { CloudDownloadOutlined } from '@ant-design/icons';
import camelCase from 'lodash/camelCase';
import FileSaver from 'file-saver';
import { call } from '../../apis/baseRequest';
import Title from '../../config/columns/entitiesTitle/excel';

export type BaseExportProps = PropsWithChildren<{
  entity?: string;
  selected?: any;
}>;

const BaseExport = forwardRef(({ entity, selected }: BaseExportProps, ref) => {
  const { handleSubmit, control, unregister } = useForm();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({}));
  const exportExcel = (payload: any) => {
    call({
      method: 'GET',
      uri: entity + `/export`,
      hasToken: true,
      configRequest: {
        params: payload,
        responseType: 'blob',
      },
    })
      .then((response: any) => {
        const fileName = `Danh_sach_${payload.title}.xlsx`;
        FileSaver.saveAs(new Blob([response]), fileName);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleExportExcel = () => {
    const payload = {
      action: 'update',
      title: Title.title[camelCase(entity)] || 'danh_mục',
    };
    payload[`id.in`] = selected;
    exportExcel(payload);
  };

  return (
    <span>
      <Button onClick={() => setIsModalOpen(true)} style={{ marginRight: 10 }}>
        <CloudDownloadOutlined />
        Xuất Excel
      </Button>
      <Modal
        destroyOnClose={true}
        title="Xuất Excel"
        open={isModalOpen}
        onOk={handleExportExcel}
        onCancel={() => setIsModalOpen(false)}
        okText={'Xuất Excel'}
        cancelText={'Trở lại'}
      >
        <p>{`Bạn có muốn xuất ${Array.isArray(selected) ? selected.length : ''} bản ghi `}</p>
      </Modal>
    </span>
  );
});

export default BaseExport;

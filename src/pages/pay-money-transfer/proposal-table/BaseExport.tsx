import { Button, Modal } from 'antd';
import { useState, type PropsWithChildren, useImperativeHandle, forwardRef } from 'react';
import { useForm } from 'react-hook-form';
import { CloudDownloadOutlined } from '@ant-design/icons';
import FileSaver from 'file-saver';
import { handleExportExcelRequest } from '../../../apis/proposal-table/proposal-table';

export type BaseExportProps = PropsWithChildren<{
  entity?: string;
  selected?: any;
}>;

const BaseExport = forwardRef(({ entity, selected }: BaseExportProps, ref) => {
  const { handleSubmit, control, unregister } = useForm();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useImperativeHandle(ref, () => ({}));
  
  const exportExcel = (payload: any) => {
    handleExportExcelRequest(entity, payload)
      .then((response: any) => {
        const fileName = `Danh_sach_giao_dich.xlsx`;
        FileSaver.saveAs(new Blob([response]), fileName);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const handleExportExcel = () => {
    const payload: any = {};
    payload[`id.in`] = selected;
    exportExcel(payload);
  };

  return (
    <span>
      <Button
        onClick={() => handleExportExcel()}
        style={{ marginLeft: '10px', marginRight: '10px', backgroundColor: 'rgb(237, 27, 47)', color: 'white' }}
      >
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

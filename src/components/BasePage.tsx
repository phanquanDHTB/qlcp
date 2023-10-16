import { useRef } from 'react';
import { Button, Empty, Table, Tag, Pagination, Popconfirm, Select, InputNumber } from 'antd';
import { useState, type PropsWithChildren, useEffect, useImperativeHandle, forwardRef, useMemo } from 'react';
import { PlusOutlined, UndoOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import { call } from '../apis/baseRequest';
import { useVT } from 'virtualizedtableforantd4';
import { useWindowSize } from 'usehooks-ts';
import formatNumber from '@utils/formatNumber';
import { SearchOutlined } from '@ant-design/icons';
import { Controller, useForm } from 'react-hook-form';
import FormInput from '@components/FormInput.tsx';
import FormCheckBoxGroup from '@components/FormCheckBoxGroup.tsx';
import Text from 'antd/es/typography/Link';
import { MzFormDatePicker } from '@components/forms/FormDatePicker';
import { formatDate } from '@utils/formatDate';
import { toast, ToastContainer } from 'react-toastify';
import { formatCurrency } from '@utils/common';
import BaseExport from '../components/excel/BaseExport';
import BaseImport from '../components/excel/BaseImport';
import { v4 } from 'uuid';
import { useOnClickOutside } from 'usehooks-ts';
import { WrapFilterTable } from './WrapFilterTable';
import { removeDuplicates } from '@utils/removeDuplicatesArr';
import { statusHandle } from '@utils/statusHandle';
import { deleteRequest, fetchDataRequest } from '../apis/component/base-page';
import { handleColor } from '@utils/handleColor';

export interface ColumnTypeCustom<T> extends ColumnType<T> {
  dataType?: string;
  dataSource?: any;
  nameOfRender?: string;
}

export type BasePageProps = PropsWithChildren<{
  headerTitle?: string;
  isAddButton?: boolean;
  isDeleteButton?: boolean;
  onAddClick?: () => void;
  columns: ColumnTypeCustom<any>[];
  columnTiles: any;
  uriFetch: string;
  hiddenGroupAction?: boolean;
  hiddenRowSelection?: boolean;
  fetchParams?: any;
  isExport?: boolean;
  isImport?: boolean;
  entity?: string;
  rowKey?: string;
  isMultipleDelete?: boolean;
  buttonCustom?: () => any;
  setRecordSelected?: (data: Array<any>) => void;
  disabledRowCheck?: (data: any) => boolean;
}>;

interface PageResponse {
  totalElements: number;
  totalPages: number;
  size: number;
}

const BasePage = forwardRef(
  (
    {
      headerTitle,
      isAddButton = false,
      isDeleteButton = false,
      onAddClick,
      columns,
      columnTiles,
      uriFetch,
      hiddenGroupAction = false,
      hiddenRowSelection = false,
      fetchParams = {},
      isExport = false,
      isImport = false,
      isMultipleDelete = true,
      entity,
      rowKey = '',
      setRecordSelected,
      disabledRowCheck,
      buttonCustom = () => {
        return;
      },
    }: BasePageProps,
    ref
  ) => {
    const [recordDelete, setRecordDelete] = useState<any>([]);

    const { handleSubmit, control, reset, getValues, setValue } = useForm();

    const [isLoading, setIsLoading] = useState<boolean>(false);

    const [dataSource, setDataSource] = useState<any>([]);

    const [pageResponse, setPageResponse] = useState<PageResponse>();

    const [currentPage, setCurrentPage] = useState<number>(1);

    const [currentSize, setCurrentSize] = useState<number>(50);

    const [checkedDelete, setCheckedDelete] = useState<React.Key[]>([]);

    const handleRefresh = (page: any) => {
      const top = document.querySelector('.ant-table-body');
      if (top) {
        top.scrollTop = 0;
      }
      fetchData({ pageIndex: page, pageSize: currentSize });
      reset({});
    };

    useImperativeHandle(ref, () => ({
      reloadBasePage: () => {
        fetchData({
          pageIndex: currentPage - 1,
          pageSize: currentSize,
          ...fetchParams,
        });
      },
      reloadToStartPage: () => {
        handleRefresh(0);
        setCurrentPage(1);
      },
    }));

    const scrollNumber = useRef<number>(0);

    useEffect(() => {
      const slider = document.querySelector('thead.ant-table-thead tr');
      const body = document.querySelector('.ant-table-container .ant-table-body');
      let isDown = false;
      let startX;
      let scrollLeft;

      if (slider && body) {
        body.addEventListener('mousedown', (e) => {
          isDown = true;
          body.classList.add('active-scroll');
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          startX = e.pageX - body.offsetLeft;
          scrollLeft = body.scrollLeft;
          scrollNumber.current = body.scrollLeft;
        });
        body.addEventListener('mouseleave', () => {
          isDown = false;
          body.classList.remove('active-scroll');
        });
        body.addEventListener('mouseup', () => {
          isDown = false;
          body.classList.remove('active-scroll');
        });
        body.addEventListener('mousemove', (e) => {
          if (!isDown) return;
          e.preventDefault();
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const x = e.pageX - body.offsetLeft;
          const walk = (x - startX) * 2; //scroll-fast
          const scroll = scrollLeft - walk;
          body.scrollLeft = scroll;
          scrollNumber.current = scroll;
        });
        body.addEventListener('scroll', (e) => {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          scrollNumber.current = e.currentTarget.scrollLeft
        });
      }
    }, []);

    console.log(scrollNumber.current)
    const fetchData = async (params?: any, uriParams?: string) => {
      setIsLoading(true);
      const url = uriParams ? uriFetch + '?' + uriParams : uriFetch;
      try {
        const response = (await fetchDataRequest(url, params)) as any;
        setIsLoading(false);
        setDataSource(response.content);
        delete response.content;
        setPageResponse(response);
        const body = document.querySelector('.ant-table-container .ant-table-body');
        const slider = document.querySelector('.ant-table-container .ant-table-header');
        if (slider && body) {
          setTimeout(() => {
            body.scrollLeft = scrollNumber.current;
            slider.scrollLeft = scrollNumber.current;
          }, 100);
        }
      } catch (error) {
        setIsLoading(false);
        console.error(error);
      }
    };

    useEffect(() => {
      fetchData(fetchParams);
    }, []);

    const convertAndRemoveUnderscore = (str: string) => {
      const convertedStr = str.replace(/_./g, (match) => {
        return match.charAt(1).toUpperCase();
      });

      const finalStr = convertedStr.replace(/_/g, '');

      return finalStr;
    };

    const searchField = (obj: any) => {
      if (obj === null || obj === undefined) {
        return null;
      }
      if (typeof obj !== 'object') {
        return obj;
      }
      if (Array.isArray(obj)) {
        return obj.map((item) => searchField(item));
      }
      const processedObj: any = {};
      let queryString = '';
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          const value = obj[key];
          if (value !== null && value !== undefined && !Array.isArray(value)) {
            const processedKey = convertAndRemoveUnderscore(key).replace(/-/g, '.');
            if (Object.keys(value)?.length === 12) {
              processedObj[processedKey] = value.format('YYYY-MM-DD');
            } else {
              processedObj[processedKey] = value;
            }
          }
          // if (value instanceof Date) {
          //     const processedKey = convertAndRemoveUnderscore(key).replace(
          //         /-/g,
          //         "."
          //     );
          //     const date = new Date(value);
          //     const startTime = `${date.getFullYear()}-${date.getMonth() + 1
          //         }-${date.getDate()}`;
          //     const parts = startTime.split("-");
          //     const year = parts[0];
          //     const month = parts[1].padStart(2, "0");
          //     const day = parts[2].padStart(2, "0");
          //     processedObj[processedKey] = `${year}-${month}-${day}`;
          // }
          if (Array.isArray(value)) {
            if (queryString.length > 0) {
              queryString += '&';
            }
            const convertKey = convertAndRemoveUnderscore(key);
            queryString += value.map((status) => `${convertKey}.in[]=${status}`).join('&');
          }
        }
      }
      processedObj.pageSize = currentSize;
      processedObj.pageIndex = currentPage - 1;
      fetchData(Object.assign(processedObj, fetchParams), queryString);
    };

    columns = columns.map((v: any, index) => {
      const title = columnTiles.attribute[v?.dataIndex];
      v.key = v4();
      if (title) {
        v.title = title;
      }
      if (columns.length - 1 === index && !hiddenGroupAction) {
        v.title = 'Hành động';
        v.dataType = 'actions';
        v.fixed = 'right';
      }
      if (v.dataType) {
        switch (v?.dataType) {
          case 'list':
            v.filterDropdown = ({ confirm, close }: any) => {
              return (
                <WrapFilterTable onClickOutSide={close}>
                  <form
                    onSubmit={handleSubmit(searchField)}
                    style={{ padding: '5px 0' }}
                    onKeyDown={(e: any) => e.stopPropagation()}
                  >
                    <FormCheckBoxGroup
                      name={v.dataIndex}
                      control={control}
                      options={v?.dataSource.map((it: any) => ({
                        label: it.text,
                        value: it.value,
                      }))}
                    />
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Button htmlType="submit" type={'text'} onClick={confirm}>
                        <Text>Tìm kiếm</Text>
                      </Button>
                      <Button
                        htmlType="submit"
                        onClick={() => {
                          setValue(`${v.dataIndex}`, null);
                          confirm();
                        }}
                        type={'text'}
                      >
                        <Text>Hủy</Text>
                      </Button>
                    </div>
                  </form>
                </WrapFilterTable>
              );
            };
            v.filterIcon = (active) => {
              return <SearchOutlined style={{ color: active ? 'red' : '#108EE9' }} />;
            };
            v.render = (recordValue) => {
              return (
                <Tag style={v?.dataSource?.color ? { backgroundColor: v?.dataSource?.color } : {}}>
                  {v.dataSource.find((x) => x.value === recordValue)?.text}
                </Tag>
              );
            };
            break;
          case 'date':
            v.filterDropdown = ({ confirm, close }: any) => {
              // eslint-disable-next-line react-hooks/rules-of-hooks
              const [isClose, setIsClose] = useState(true);
              return (
                <WrapFilterTable
                  onClickOutSide={() => {
                    if (isClose) {
                      close();
                    }
                  }}
                >
                  <form
                    onSubmit={handleSubmit(searchField)}
                    style={{ padding: 8 }}
                    onKeyDown={(e: any) => e.stopPropagation()}
                  >
                    <MzFormDatePicker
                      controllerProps={{
                        name: `${v.dataIndex}-equals`,
                        control,
                      }}
                      datePickerProps={{
                        style: { borderRadius: 2, width: 250 },
                        placeholder: 'Chọn thời điểm',
                        format: 'DD/MM/YYYY',
                        onFocus: () => setIsClose(false),
                        onSelect: () => setIsClose(true),
                      }}
                    />
                    <div
                      style={{
                        marginTop: 5,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Button
                        style={{
                          borderRadius: 2,
                          width: 120,
                          height: 28,
                          padding: 0,
                        }}
                        htmlType="submit"
                        onClick={() => {
                          confirm();
                        }}
                        type={'primary'}
                      >
                        <SearchOutlined />
                        Tìm kiếm
                      </Button>
                      <Button
                        htmlType="submit"
                        onClick={() => {
                          setValue(`${v.dataIndex}-equals`, undefined);
                          confirm();
                        }}
                        style={{
                          borderRadius: 2,
                          width: 120,
                          height: 28,
                          padding: 0,
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                </WrapFilterTable>
              );
            };
            v.filterIcon = () => {
              return <SearchOutlined style={{ color: '#108EE9' }} />;
            };
            v.render = (recordValue) => formatDate(recordValue);
            break;
          case 'number':
            v.filterDropdown = ({ confirm, close }: any) => {
              return (
                <WrapFilterTable onClickOutSide={close}>
                  <form onSubmit={handleSubmit(searchField)} style={{ padding: 8 }}>
                    <FormInput
                      name={`${v.dataIndex}-equals`}
                      control={control}
                      style={{ borderRadius: 2, width: 250 }}
                      placeholder={'Tìm kiếm'}
                    />
                    <div
                      style={{
                        marginTop: 5,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Button
                        style={{
                          borderRadius: 2,
                          width: 120,
                          height: 28,
                          padding: 0,
                        }}
                        htmlType="submit"
                        onClick={() => {
                          confirm();
                        }}
                        type={'primary'}
                      >
                        <SearchOutlined />
                        Tìm kiếm
                      </Button>
                      <Button
                        htmlType="submit"
                        onClick={() => {
                          setValue(`${v.dataIndex}-equals`, null);
                          confirm();
                        }}
                        style={{
                          borderRadius: 2,
                          width: 120,
                          height: 28,
                          padding: 0,
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                </WrapFilterTable>
              );
            };
            v.filterIcon = () => {
              return <SearchOutlined style={{ color: '#108EE9' }} />;
            };
            v.render = (recordValue) => {
              return formatNumber(recordValue);
            };
            break;
          case 'bool':
            v.render = (recordValue) => v.dataSource.find((x) => x.value === recordValue)?.text;
            break;
          case 'currency':
            v.filterDropdown = ({ confirm, close }: any) => {
              return (
                <WrapFilterTable onClickOutSide={close}>
                  <form onSubmit={handleSubmit(searchField)} style={{ padding: 8 }}>
                    <Controller
                      name={`${v.dataIndex}-equals`}
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          {...field}
                          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                          parser={(value) => value!.replace(/\$\s?|(\.*)/g, '')}
                          style={{
                            width: '100%',
                          }}
                        />
                      )}
                    />
                    <div
                      style={{
                        marginTop: 5,
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Button
                        style={{
                          borderRadius: 2,
                          width: 120,
                          height: 28,
                          padding: 0,
                        }}
                        htmlType="submit"
                        onClick={() => {
                          confirm();
                        }}
                        type={'primary'}
                      >
                        <SearchOutlined />
                        Tìm kiếm
                      </Button>
                      <Button
                        htmlType="submit"
                        onClick={() => {
                          setValue(`${v.dataIndex}-equals`, null);
                          confirm();
                        }}
                        style={{
                          borderRadius: 2,
                          width: 120,
                          height: 28,
                          padding: 0,
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  </form>
                </WrapFilterTable>
              );
            };
            v.filterIcon = () => {
              return <SearchOutlined style={{ color: '#108EE9' }} />;
            };
            v.render = (recordValue) => (recordValue >= 0 ? formatNumber(recordValue) : '--');
            break;
          default:
            break;
        }
      } else {
        v.filterDropdown = ({ confirm, close }: any) => {
          return (
            <WrapFilterTable onClickOutSide={close}>
              <form onSubmit={handleSubmit(searchField)} style={{ padding: 8 }}>
                <FormInput
                  name={`${v.dataIndex}-contains`}
                  control={control}
                  style={{ borderRadius: 2, width: 250 }}
                  placeholder={'Tìm kiếm'}
                />
                <div
                  style={{
                    marginTop: 5,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <Button
                    style={{
                      borderRadius: 2,
                      width: 120,
                      height: 28,
                      padding: 0,
                    }}
                    htmlType="submit"
                    onClick={() => {
                      confirm();
                    }}
                    type={'primary'}
                  >
                    <SearchOutlined />
                    Tìm kiếm
                  </Button>
                  <Button
                    htmlType="submit"
                    onClick={() => {
                      setValue(`${v.dataIndex}-contains`, null);
                      confirm();
                    }}
                    style={{
                      borderRadius: 2,
                      width: 120,
                      height: 28,
                      padding: 0,
                    }}
                  >
                    Hủy
                  </Button>
                </div>
              </form>
            </WrapFilterTable>
          );
        };
        v.filterIcon = () => {
          return <SearchOutlined style={{ color: '#108EE9' }} />;
        };
      }
      const dataIndex = v.dataIndex as string;
      if (dataIndex.includes('name_of_')) {
        const name = dataIndex.replace('name_of_', '').replace('_id', '');
        v.render = (_, record) => <span>{record[name] ? record[name][v.nameOfRender ?? 'name'] : '--'}</span>;
      }
      return v;
    });

    const onPageChange = (page: number) => {
      if (page !== currentPage) {
        const paramsSearch: any = {};
        let queryString = '';
        for (const key in getValues()) {
          if (Object.prototype.hasOwnProperty.call(getValues(), key)) {
            const value = getValues()[key];
            if (value !== null && value !== undefined && !Array.isArray(value)) {
              const processedKey = convertAndRemoveUnderscore(key).replace(/-/g, '.');
              if (Object.keys(value)?.length === 12) {
                paramsSearch[processedKey] = value.format('YYYY-MM-DD');
              } else {
                paramsSearch[processedKey] = value;
              }
            }
            if (Array.isArray(value)) {
              if (queryString.length > 0) {
                queryString += '&';
              }
              const convertKey = convertAndRemoveUnderscore(key);
              queryString += value.map((status) => `${convertKey}.in[]=${status}`).join('&');
            }
          }
        }
        setCurrentPage(page);
        paramsSearch.pageSize = currentSize;
        paramsSearch.pageIndex = page - 1;
        fetchData(paramsSearch, queryString || '');
      }
    };

    const onSizeChange = (size: number) => {
      setCurrentSize(size);
      fetchData({ pageIndex: 0, pageSize: size });
    };

    const { height } = useWindowSize();

    const scrollHeight = height - 260;

    const [vt] = useVT(() => ({ scroll: { y: scrollHeight } }), [scrollHeight]);

    const onDeleteData = async () => {
      const arrError: string[] = [];
      let total = 0;
      for await (const value of checkedDelete) {
        try {
          await deleteRequest(uriFetch, value);
          total += 1;
        } catch (err: any) {
          if (!arrError.includes(err.response.data.message)) {
            arrError.push(err.response.data.message);
          }
        }
      }
      if (arrError.length) {
        toast.error(arrError.join(', '))
      }
      if (total > 0) {
        setCheckedDelete([]);
        fetchData();
        toast.success(`Xóa thành công ${total} bản ghi`);
      }
    };

    const renderButton = () => {
      if (isAddButton && checkedDelete.length === 0) {
        return (
          <Button
            onClick={() => {
              if (onAddClick) onAddClick();
            }}
            type="primary"
            icon={<PlusOutlined />}
          >
            {'Thêm'}
          </Button>
        );
      } else if (isDeleteButton && checkedDelete.length > 0) {
        let listCode = '';
        checkedDelete.map((item, index) => {
          if (index === 0) {
            listCode += dataSource.find((x) => x.id === item)?.code;
          } else {
            listCode += `, ${dataSource.find((x) => x.id === item)?.code}`;
          }
        });
        return isMultipleDelete ? (
          <div>
            <span style={{ marginRight: 10 }}>Đã chọn: {checkedDelete.length}</span>

            {isExport ? <BaseExport entity={entity} selected={checkedDelete} /> : null}
            <span style={{ marginRight: 8 }}>
              <Button
                type="primary"
                onClick={() => {
                  setCheckedDelete([]);
                }}
              >
                {'Bỏ chọn'}
              </Button>
            </span>
            <Popconfirm
              title={'Xóa dữ liệu'}
              description={`Bạn có chắc chắn muốn xóa ${columnTiles?.name} ${listCode} ?`}
              okText="Xác nhận"
              cancelText="Hủy"
              onConfirm={() => onDeleteData()}
            >
              <Button type="primary">Xóa</Button>
            </Popconfirm>
          </div>
        ) : null;
      } else {
        return;
      }
    };
    const columnsTitleCustom = (columns: any[]) => {
      return columns.map((element) => {
        switch (element.dataType) {
          case 'number':
            element.align = 'right';
            break;
          case 'currency':
            element.align = 'right';
            break;
          case 'date':
            element.align = 'center';
            break;
          case 'list':
            element.align = 'left';
            break;
          default:
            element.align = 'left';

            break;
        }
        return element;
      });
    };

    const table = document.querySelector('.ant-table-body') as HTMLElement;

    const tableData = useMemo(() => (
      <Table
        rowKey={rowKey && rowKey !== '' ? rowKey : 'id'}
        rowSelection={
          hiddenRowSelection
            ? undefined
            : {
              onChange: (v, record) => {
                if (v.length === dataSource.length) {
                  setCheckedDelete((pre) => removeDuplicates([...pre, ...v]));
                  setRecordDelete((pre) => removeDuplicates([...pre, ...record], 'id'));
                } else if (v.length === 0) {
                  setCheckedDelete((pre) =>
                    pre?.filter((i: any) => {
                      if (!dataSource?.map((item: any) => item.id).includes(i)) {
                        return i;
                      }
                    })
                  );
                  setRecordDelete((pre) =>
                    pre?.filter((i: any) => {
                      if (!dataSource?.map((item: any) => item.id).includes(i.id)) {
                        return i;
                      }
                    })
                  );
                } else {
                  setCheckedDelete((pre) => removeDuplicates([...pre, ...v]));
                  setRecordDelete((pre) => removeDuplicates([...pre, ...record], 'id'));
                }
                setRecordSelected ? setRecordSelected(record) : null;
              },
              getCheckboxProps: (record: any) => ({
                disabled: disabledRowCheck ? disabledRowCheck(record) : false,
              }),
              selectedRowKeys: checkedDelete,
              onSelect: (record, isAdd) => {
                if (isAdd) {
                  setCheckedDelete((pre) => [...pre, record.id]);
                  setRecordDelete((pre) => [...pre, record]);
                } else {
                  setCheckedDelete((pre) => pre?.filter((i: any) => i !== record?.id));
                  setRecordDelete((pre) => pre?.filter((i: any) => i?.id !== record?.id));
                }
              },
            }
        }
        components={vt}
        loading={isLoading}
        pagination={false}
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'Chưa có dữ liệu'} />,
        }}
        scroll={{ y: scrollHeight }}
        columns={columnsTitleCustom(columns)}
        dataSource={dataSource}
      />
    ), [isLoading, dataSource, checkedDelete])

    return (
      <div style={{ height: '100%' }}>
        <ToastContainer position={'top-center'} autoClose={1000} />
        <div className="base-page-header">
          <div className="base-page-header__group-header">
            <h1>{headerTitle}</h1>
            <UndoOutlined
              onClick={() => {
                setCheckedDelete([]);
                setRecordDelete([]);
                fetchData({
                  pageIndex: currentPage - 1,
                  pageSize: currentSize,
                  ...fetchParams,
                });
                reset({});
                table.scrollTop = 0;
              }}
            />
          </div>
          {renderButton()}
          {buttonCustom()}
        </div>
        <div style={{ paddingLeft: 20, marginTop: isImport ? -15 : 0 }}>
          {isImport ? (
            <BaseImport
              entity={entity}
              onReload={() => {
                fetchData({
                  pageIndex: currentPage - 1,
                  pageSize: currentSize,
                });
              }}
            />
          ) : null}
        </div>
        {
          tableData
        }
        <div
          style={{
            width: '100%',
            display: 'flex',
            padding: 10,
            justifyContent: 'flex-end',
          }}
        >
          <Pagination
            total={pageResponse?.totalPages ? pageResponse?.totalPages * 10 : 0}
            defaultCurrent={1}
            current={currentPage}
            onChange={onPageChange}
            showTotal={() =>
              `${currentPage * currentSize - currentSize + 1}-${pageResponse?.totalPages === currentPage ? pageResponse.totalElements : currentPage * currentSize
              } / ${pageResponse?.totalElements || ''} bản ghi`
            }
            showSizeChanger={false}
          />
          <Select
            options={[
              {
                label: '50 / trang',
                value: 50,
              },
              {
                label: '100 / trang',
                value: 100,
              },
            ]}
            defaultValue={{
              label: '50 / trang',
              value: 50,
            }}
            onSelect={(size) => {
              onSizeChange(+size);
              setCurrentPage(1);
              setRecordDelete([]);
              setCheckedDelete([]);
            }}
          />
        </div>
      </div>
    );
  }
);

export default BasePage;

import { memo, useEffect, useRef, useState } from 'react';
import { Form, Select, SelectProps, Spin } from 'antd';
import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { useDebounce } from 'usehooks-ts';
import { removeDuplicates } from '@utils/removeDuplicatesArr';
import { call } from '../../apis/baseRequest';

const { Option } = Select;

type FormSelectProps = {
  controllerProps: UseControllerProps<FieldValues, any>;
  selectProps?: SelectProps;
  uri?: string;
  uriSearch?: string;
  labelObj?: string[];
  valueObj?: string;
  defaultOption?: any;
  onChangeValue?: (value: any) => void;
  isFormItem?: boolean;
  label?: string;
  displayLoading?: boolean;
  remove?: boolean;
  fetchNewUri?: boolean;
  hasDefaul?: boolean;
  disabledValueObj?: (value: any) => void;
};
function FormSelect({
  controllerProps,
  selectProps,
  uri = '',
  uriSearch = '',
  labelObj = ['name'],
  valueObj = 'id',
  defaultOption = {},
  onChangeValue,
  isFormItem = false,
  label = '',
  displayLoading = false,
  remove = false,
  fetchNewUri = false,
  hasDefaul = true,
  disabledValueObj,
}: FormSelectProps) {
  const { field, fieldState } = useController(controllerProps);
  const [loading, setLoading] = useState(false);

  const { onBlur, onChange, value } = field;
  const { error } = fieldState;

  const page = useRef(0);
  let height = 0;

  const [search, setSearch] = useState<string>('');
  const [listOption, setListOption] = useState<any>([]);

  // useEffect(() => {
  //     setListOption(removeDuplicates([defaultOption, ...listOption], valueObj))
  // }, [defaultOption?.value])

  // if(defaultOption.value === 824){
  //   console.log(defaultOption)
  // }

  const getListOptions = async (page) => {
    try {
      setLoading(true);
      const res = (await call({
        uri,
        hasToken: true,
        method: 'GET',
        configRequest: {
          params: {
            pageIndex: page,
            pageSize: 20,
          },
        },
      })) as any;

      const options = removeDuplicates(
        [
          ...listOption,
          // eslint-disable-next-line no-unsafe-optional-chaining
          ...res?.map((i: any) => {
            i.label = labelObj.map((item: any) => i[item]).join(' - '); 
            i.value = i[valueObj];
            if (disabledValueObj) {
              i.disabled = disabledValueObj(i);
            }
            return i;
          }),
        ],
        valueObj
      );

      if (page === 0) {
        setListOption(res?.filter((i) => i[valueObj] !== defaultOption[valueObj]));
      }
      if (page !== 0 && remove) {
        setListOption(removeDuplicates(options, valueObj));
      } else if (page !== 0 && !remove) {
        setListOption(options);
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  const getListOptionsNewUri = async () => {
    page.current = 0;
    try {
      const res = (await call({
        uri: uri,
        hasToken: true,
        method: 'GET',
        configRequest: {
          params: {
            pageIndex: 0,
            pageSize: 20,
          },
        },
      })) as any;
      const options = res?.map((i: any) => {
        i.label = labelObj.map((item: any) => i[item]).join(' - ');
        i.value = i[valueObj];
        return i;
      });
      if (options.length) {
        setListOption(options);
      } else {
        setListOption([]);
      }
    } catch (e) {}
  };

  useEffect(() => {
    if (!uri.includes('undefined') && !uri.includes('null') && fetchNewUri) {
      getListOptionsNewUri();
    }
  }, [uri]);

  const debounceSearch = useDebounce(search, 500);

  const getListOptionsSearch = async () => {
    try {
      setLoading(true);
      const res = (await call({
        uri: uri + `&${uriSearch}` + debounceSearch,
        hasToken: true,
        method: 'GET',
        configRequest: {
          params: {
            pageIndex: 0,
            pageSize: 200,
          },
        },
      })) as any;

      const options = res?.map((i: any) => {
        i.label = labelObj.map((item: any) => i[item]).join(' - ');
        i.value = i[valueObj];
        return i;
      });
      setListOption(options);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (debounceSearch.length !== 0) {
      getListOptionsSearch();
    }
  }, [debounceSearch]);

  const onScroll = (e: any) => {
    const target = e.target;
    if (
      (target.scrollTop + target.offsetHeight).toFixed() ==
        target.scrollHeight ||
      (target.scrollTop + target.offsetHeight).toFixed() <=
        target.scrollHeight - 5
    ) {
      getListOptions(page.current);
      if (target.scrollHeight > height) {
        height = target.scrollHeight;
        page.current++;
      }
    }
  };

  const onChangeSelect = (e, record) => {
    onChangeValue(record);
    onChange(e);
  };

  return isFormItem ? (
    <Form.Item labelCol={{ span: 24 }} label={label} validateStatus={error && 'error'} help={error && error.message}>
      <Select
        onChange={onChangeSelect}
        onBlur={onBlur}
        value={value}
        {...selectProps}
        options={
          loading && page.current === 0
            ? []
            : Object.keys(defaultOption).length
            ? removeDuplicates(hasDefaul ? [defaultOption, ...listOption] : listOption, valueObj)
            : listOption
        }
        onPopupScroll={onScroll}
        getPopupContainer={(trigger) => trigger.parentNode}
        showSearch
        onSearch={(e) => {
          setSearch(e);
          if (e.length === 0) {
            page.current = 0;
            setListOption([]);
            getListOptions(0);
          }
        }}
        onClear={() => {
          page.current = 0;
          getListOptions(0);
        }}
        onFocus={() => {
          if (!uri.includes('undefined')) {
            getListOptions(page.current);
          }
        }}
        notFoundContent={loading && displayLoading ? <Spin size="small" /> : null}
      />
    </Form.Item>
  ) : (
    <Select
      onChange={onChangeSelect}
      onBlur={onBlur}
      value={value}
      {...selectProps}
      options={
        loading && page.current === 0
          ? []
          : Object.keys(defaultOption).length
          ? removeDuplicates(hasDefaul ? [defaultOption, ...listOption] : listOption, valueObj)
          : listOption
      }
      onPopupScroll={onScroll}
      getPopupContainer={(trigger) => trigger.parentNode}
      showSearch
      onSearch={(e) => {
        setSearch(e);
        if (e.length === 0) {
          setListOption([]);
          getListOptions(0);
        }
      }}
      onClear={() => {
        page.current = 0;
        getListOptions(0);
      }}
      onFocus={() => {
        if (!uri.includes('undefined')) {
          getListOptions(page.current);
        }
      }}
      notFoundContent={loading && displayLoading ? <Spin size="small" /> : null}
    />
  );
}

FormSelect.displayName = 'FormSelect';
export const MzFormSelectV3 = memo(FormSelect);

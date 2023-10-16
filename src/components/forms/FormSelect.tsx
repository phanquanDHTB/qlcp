import { memo, useEffect, useRef, useState } from 'react';
import { ColProps, Form, Select, SelectProps } from 'antd';
import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { useDebounce } from 'usehooks-ts';

type FormSelectProps = {
  controllerProps: UseControllerProps<FieldValues, any>;
  label?: string;
  labelCol?: ColProps | undefined;
  selectProps?: SelectProps;
  callBack?: (page: number) => void;
  callbackChange?: (v: string) => void;
  onChangeValue?: (e: any) => void;
};
function FormSelect({
  controllerProps,
  label,
  labelCol = { span: 24 },
  selectProps,
  callBack = () => null,
  callbackChange = () => null,
  onChangeValue = () => null,
}: FormSelectProps) {
  const { field, fieldState } = useController(controllerProps);

  const { error } = fieldState;

  const { onBlur, onChange, value } = field;

  const page = useRef(1);
  let height = 0;

  const [search, setSearch] = useState<string>('');

  const debounceSearch = useDebounce(search, 500);
  useEffect(() => {
    callbackChange(search);
  }, [debounceSearch]);

  const onChangeSelect = (e) => {
    onChangeValue(e);
    onChange(e);
  };
  return (
    <Form.Item labelCol={labelCol} label={label} validateStatus={error && 'error'} help={error && error.message}>
      <Select
        onChange={onChangeSelect}
        onBlur={onBlur}
        value={value}
        {...selectProps}
        onPopupScroll={(e: any) => {
          const target = e.target;
          if (
            (target.scrollTop + target.offsetHeight).toFixed() == target.scrollHeight ||
            (target.scrollTop + target.offsetHeight).toFixed() <= target.scrollHeight - 5
          ) {
            callBack(page.current);
            if (target.scrollHeight > height) {
              height = target.scrollHeight;
              page.current++;
            }
          }
        }}
        getPopupContainer={(trigger) => trigger.parentNode}
        onSearch={(e) => setSearch(e)}
        aria-autocomplete='none'
      />
    </Form.Item>
  );
}

FormSelect.displayName = 'FormSelect';
export const MzFormSelect = memo(FormSelect);

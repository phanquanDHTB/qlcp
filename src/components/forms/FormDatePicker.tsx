import { memo } from 'react';
import { ColProps, Form, DatePicker, DatePickerProps } from 'antd';
import { FieldValues, useController, UseControllerProps } from 'react-hook-form';

type FormDatePickerProps = {
  controllerProps: UseControllerProps<FieldValues, any>;
  label?: string;
  labelCol?: ColProps | undefined;
  datePickerProps?: DatePickerProps;
  isForm?: boolean;
};
function FormDatePicker({
  controllerProps,
  label,
  labelCol = { span: 24 },
  datePickerProps,
  isForm = true,
}: FormDatePickerProps) {
  const { field, fieldState } = useController(controllerProps);

  const { error } = fieldState;

  const { onChange, value, ref } = field;

  return isForm ? (
    <Form.Item labelCol={labelCol} label={label} validateStatus={error && 'error'} help={error && error.message}>
      <DatePicker
        ref={ref}
        onChange={onChange}
        value={value}
        format={'DD-MM-YYYY'}
        {...datePickerProps}
        aria-autocomplete="none"
        autoComplete='off'
      />
    </Form.Item>
  ) : (
    <DatePicker
      ref={ref}
      onChange={onChange}
      value={value}
      format={'DD-MM-YYYY'}
      {...datePickerProps}
      aria-autocomplete="none"
      autoComplete='off'
    />
  );
}

FormDatePicker.displayName = 'FormDatePicker';
export const MzFormDatePicker = memo(FormDatePicker);

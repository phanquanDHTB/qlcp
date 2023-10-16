import { memo } from 'react';
import { ColProps, Form, Input as AntInput, InputProps ,} from 'antd';
import { FieldValues, useController, UseControllerProps } from 'react-hook-form';
import { TextAreaProps, SearchProps } from 'antd/es/input';

type FormInputProps = {
  controllerProps: UseControllerProps<FieldValues, any>;
  label?: string;
  labelCol?: ColProps | undefined;
  inputProps?: InputProps;
  textAreaProps?: TextAreaProps;
  searchProps?: SearchProps;
  inputType?: 'Input' | 'TextArea' | 'Search';
};

const { TextArea } = AntInput;
const Search = AntInput.Search;

function FormInput({
  controllerProps,
  label,
  labelCol = { span: 24 },
  inputProps,
  textAreaProps,
  searchProps,
  inputType = 'Input',
}: FormInputProps) {
  const { field, fieldState } = useController(controllerProps);

  const { error } = fieldState;

  const { onBlur, onChange, value } = field;
  return (
    <Form.Item labelCol={labelCol} label={label} validateStatus={error && 'error'} help={error && error.message}>
      {inputType === 'TextArea' ? (
        <TextArea onChange={onChange} onBlur={onBlur} value={value} {...textAreaProps} autoComplete="off" />
      ) : inputType === 'Search' ? (
        <Search onChange={onChange} onBlur={onBlur} value={value} {...searchProps} autoComplete="off" />
      ) : (
        <AntInput onChange={onChange} onBlur={onBlur} value={value} {...inputProps} autoComplete="off" />
      )}
    </Form.Item>
  );
}

FormInput.displayName = 'FormInput';
export const MzFormInput = memo(FormInput);

import { memo } from 'react';
import { ColProps, Form, InputNumber, InputNumberProps } from "antd";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

type FormInputNumberProps = {
	controllerProps: UseControllerProps<FieldValues, any>,
	label?: string,
	labelCol?: ColProps | undefined,
	inputNumberProps?: InputNumberProps,
}
function FormInputNumber({ controllerProps, label, labelCol = { span: 24 }, inputNumberProps }: FormInputNumberProps) {

	const { field, fieldState } = useController(controllerProps)

	const { error } = fieldState;

	const { onChange, value } = field;

	return (
		<Form.Item
			labelCol={labelCol}
			label={label}
			validateStatus={error && "error"}
			help={error && error.message}
		>
			<InputNumber
				onChange={onChange}
				value={value}
				{...inputNumberProps}
				autoComplete='off'
				aria-autocomplete='none'
			/>
		</Form.Item>
	)
}

FormInputNumber.displayName = 'FormInputNumber'
export const MzFormInputNumber = memo(FormInputNumber);

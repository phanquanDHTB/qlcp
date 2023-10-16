import { memo } from 'react';
import { ColProps, Form, Input as AntInput, InputProps } from "antd";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

type FormPasswordProps = {
	controllerProps: UseControllerProps<FieldValues, any>,
	label?: string,
	labelCol?: ColProps | undefined,
	inputProps?: InputProps,
}

function FormPassword({ controllerProps, label, labelCol = { span: 24 }, inputProps }: FormPasswordProps) {

	const { field, fieldState } = useController(controllerProps)

	const { error } = fieldState;

	const { onBlur, onChange, value } = field;

	return (
		<Form.Item
			labelCol={labelCol}
			label={label}
			validateStatus={error && "error"}
			help={error && error.message}
		>
			<AntInput.Password
				onChange={onChange}
				onBlur={onBlur}
				value={value}
				{...inputProps}
			/>
		</Form.Item>
	)
}

FormPassword.displayName = 'FormPassword'
export const MzFormPassword = memo(FormPassword);

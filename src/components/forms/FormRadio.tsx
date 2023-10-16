import {memo} from 'react';
import {ColProps, Form, Radio, RadioGroupProps} from "antd";
import {FieldValues, useController, UseControllerProps} from "react-hook-form";

type FormRadioProps = {
	controllerProps: UseControllerProps<FieldValues, any>,
	label?: string,
	labelCol?: ColProps | undefined,
	radioProps?: RadioGroupProps,
}
function FormRadio ({controllerProps, label, labelCol = {span: 24}, radioProps}: FormRadioProps) {

	const {field, fieldState} = useController(controllerProps)

	const {error} = fieldState;

	const { onChange, value } = field;

	return (
		<Form.Item
			labelCol={labelCol}
			label={label}
			validateStatus={error && "error"}
			help={error && error.message}
		>
			<Radio.Group
				onChange={onChange}
				value={value}
				{...radioProps}
			/>
		</Form.Item>
	)
}

FormRadio.displayName = 'FormRadio'
export const MzFormRadio = memo(FormRadio);

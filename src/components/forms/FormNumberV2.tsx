import { memo, useEffect } from 'react';
import { ColProps, Form, Input, InputNumber, InputNumberProps } from "antd";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";
import formatNumber from '@utils/formatNumber';

type FormInputNumberProps = {
	controllerProps: UseControllerProps<FieldValues, any>,
	label?: string,
	labelCol?: ColProps | undefined,
	inputNumberProps?: InputNumberProps,
}
function FormInputNumber({ controllerProps, label, labelCol = { span: 24 }, inputNumberProps }: FormInputNumberProps) {

	const { field, fieldState } = useController(controllerProps)

	const { error } = fieldState;

	const { onChange, value, onBlur } = field;

	const onChangeValue = (e) => {
		const { value } = e.target;
		const reg = /^-?[\d.]+(?:e-?\d+)?$/;
		if (reg.test(value) || value === "" || value === "-") {
			onChange(value ? formatNumber(value) : "0");
		}
	};

	const onBlurChange = () => {
		onChange(value ? formatNumber(value) : "0");
		onBlur();
	};

	const onFocus = () => {
		onChange(value.toString().replaceAll(".", ""));
	};

	useEffect(() => {
		if (!value && isNaN(value)) {
			onChange("0");
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [value]);


	return (
		<Form.Item
			labelCol={labelCol}
			label={label}
			validateStatus={error && "error"}
			help={error && error.message}
		>
			<Input
				//@ts-ignore
				onChange={onChangeValue}
				onBlur={onBlurChange}
				onFocus={onFocus}
				value={value}
				{...inputNumberProps}
				autoComplete='off'
				aria-autocomplete='none'
			/>
		</Form.Item>
	)
}

FormInputNumber.displayName = 'FormInputNumber'
export const MzFormInputNumberV2 = memo(FormInputNumber);

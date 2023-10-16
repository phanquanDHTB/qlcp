import { memo } from 'react';
import { Checkbox, CheckboxProps, ColProps, Form } from "antd";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";

type FormCheckboxProps = {
    controllerProps: UseControllerProps<FieldValues, any>,
    label?: string,
    labelCol?: ColProps | undefined,
    checkboxProps?: CheckboxProps,
    callback?: (e: any) => void
}
function FormCheckbox({ controllerProps, label, labelCol = { span: 24 }, checkboxProps, callback }: FormCheckboxProps) {

    const { field, fieldState } = useController(controllerProps)

    const { error } = fieldState;

    const { onChange, value } = field;

    return (
        <Form.Item
            labelCol={labelCol}
            validateStatus={error && "error"}
            help={error && error.message}
        >
            <Checkbox
                onChange={(e) => {
                    onChange(e.target.checked)
                   callback && callback(e.target.checked)
                }}
                checked={value}
                {...checkboxProps}
            >
                {label}
            </Checkbox>
        </Form.Item>
    )
}

FormCheckbox.displayName = 'FormCheckbox'
export const MzFormCheckbox = memo(FormCheckbox);

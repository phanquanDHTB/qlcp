import React from 'react';
import {useController} from "react-hook-form";
import {Checkbox} from "antd";

const FormCheckBoxGroup = ({name, control, rules, ...props}: any) => {
	const {field} = useController({name, control, rules});
	return <Checkbox.Group {...props} onBlur={field.onBlur} onChange={field.onChange} value={field.value}/>
};

export default FormCheckBoxGroup;
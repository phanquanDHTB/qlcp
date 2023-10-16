import React from 'react';
import {useController} from "react-hook-form";
import {Input} from 'antd'
import { toast } from 'react-toastify';

const FormInput = ({name, control, rules, isToast = false, ...props}: any) => {
    const {field, fieldState} = useController({name, control, rules});
    const blurForm = () => {
        field.onBlur()
        if(isToast){
           fieldState.error && toast(fieldState.error.message, { type: 'error' })
        }
    }
    return <Input {...props} onBlur={() => blurForm()} onChange={field.onChange} value={field.value}/>
};

export default FormInput;
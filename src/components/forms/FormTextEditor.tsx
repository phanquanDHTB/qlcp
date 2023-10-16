import {memo} from 'react';
import {FieldValues, useController, UseControllerProps} from "react-hook-form";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css';

type FormTextEditorProps = {
	controllerProps: UseControllerProps<FieldValues, any>,
}
function FormTextEditor ({controllerProps}: FormTextEditorProps) {

	const {field, fieldState} = useController(controllerProps)

	const {error} = fieldState;

	const { onChange, value } = field;

	return (
		<>
			<ReactQuill
				onChange={onChange}
				value={value}
				theme="snow"
				className={'h-full'}
				style={{
					width: 878
				}}
				formats={[
					'header',
					'bold', 'italic', 'underline', 'strike', 'blockquote',
					'list', 'bullet', 'indent',
					'link', 'image'
				]}
				modules={
					{
						toolbar: [
							['bold', 'italic', 'underline', 'strike'],        // toggled buttons
							['blockquote', 'code-block'],

							[{ 'header': 1 }, { 'header': 2 }],               // custom button values
							[{ 'list': 'ordered'}, { 'list': 'bullet' }],
							[{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
							[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
							[{ 'direction': 'rtl' }],                         // text direction

							[{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
							[{ 'header': [1, 2, 3, 4, 5, 6, false] }],

							[{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
							[{ 'font': [] }],
							[{ 'align': [] }],

							['clean']
						],
					}
				}
			/>
			{error && error.message}
		</>
	)
}

FormTextEditor.displayName = 'FormTextEditor'
export const MzFormTextEditor = memo(FormTextEditor);

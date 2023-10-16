import { memo, useEffect, useRef, useState } from 'react';
import { Form, Select, SelectProps, Spin } from "antd";
import { FieldValues, useController, UseControllerProps } from "react-hook-form";
import { useDebounce } from 'usehooks-ts';
import { call } from '../../apis/baseRequest';
import { removeDuplicates } from '@utils/removeDuplicatesArr';


type FormSelectProps = {
    controllerProps: UseControllerProps<FieldValues, any>,
    selectProps?: SelectProps,
    uri?: string,
    uriSearch?: string,
    labelObj?: string[],
    valueObj?: string,
    defaultOption?: any,
    onChangeValue?: (value: any) => void;
    isFormItem?: boolean,
    label?: string,
    displayLoading?: boolean
}
function FormSelect({
    controllerProps,
    selectProps,
    uri = '',
    uriSearch = '',
    labelObj = ['name'],
    valueObj = 'id',
    defaultOption = {},
    onChangeValue = () => null,
    isFormItem = false,
    label = '',
    displayLoading = false
}: FormSelectProps) {

    const { field, fieldState } = useController(controllerProps)
    const [loading, setLoading] = useState(false)

    const { onBlur, onChange, value } = field;
    const { error } = fieldState;

    const page = useRef(0)
    let height = 0

    const [search, setSearch] = useState<string>('')
    const [listOption, setListOption] = useState<any>([])

    useEffect(() => {
        setListOption(removeDuplicates([defaultOption, ...listOption], valueObj))
    }, [defaultOption?.value])

    const getListOptions = async (page) => {
        try {
            setLoading(true)
            const res = await call({
                uri,
                hasToken: true,
                method: 'GET',
                configRequest: {
                    params: {
                        pageIndex: page,
                        pageSize: 20
                    }
                }
            }) as any

            const options = [...listOption, ...res.content?.map((i: any) => {
                i.label = labelObj.map((item: any) => i[item]).join(' - '),
                    i.value = i[valueObj]
                return i
            })]
            setListOption(options)
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }


    const getListOptionsNewUri = async () => {
        page.current = 0
        try {
            const res = await call({
                uri: uri,
                hasToken: true,
                method: 'GET',
                configRequest: {
                    params: {
                        pageIndex: 0,
                        pageSize: 20
                    }
                }
            }) as any
            const options = res.content?.map((i: any) => {
                i.label = labelObj.map((item: any) => i[item]).join(' - ')
                i.value = i[valueObj]
                return i
            })
            setListOption(options)
        } catch (e) {
        }
    }

    useEffect(() => {
        if (!uri.includes('undefined') && !uri.includes('null')) {
            getListOptionsNewUri()
        }
    }, [uri])

    const debounceSearch = useDebounce(search, 500)

    const getListOptionsSearch = async () => {
        try {
            setLoading(true)
            const res = await call({
                uri: uri + `&${uriSearch}` + `&keyWord=${encodeURIComponent(debounceSearch)}`,
                hasToken: true,
                method: 'GET',
                configRequest: {
                    params: {
                        pageIndex: 0,
                        pageSize: 30
                    }
                }
            }) as any
            const options = res.content?.map((i: any) => {
                i.label = labelObj.map((item: any) => i[item]).join(' - ')
                i.value = i[valueObj]
                return i
            })
            setListOption(options)
        } catch (e) {
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (debounceSearch.length !== 0) {
            getListOptionsSearch()
        }
    }, [debounceSearch])

    const onScroll = (e: any) => {
        const scrollHeight = e.target.scrollHeight
        const scrollTop = e.target.scrollTop
        const clientHeight = e.target.clientHeight
        if ((scrollHeight === scrollTop + clientHeight) && debounceSearch.length === 0) {
            getListOptions(page.current)
            if (scrollHeight > height) {
                height = scrollHeight
                page.current++
            }
        }
    }

    const onChangeSelect = (e) => {
        const objSelected = listOption.find((i: any) => i.value === e)
        onChangeValue(objSelected)
        onChange(e)
    }

    return (isFormItem ?
        <Form.Item
            labelCol={{ span: 24 }}
            label={label}
            validateStatus={error && "error"}
            help={error && error.message}
        >
            <Select
                onChange={onChangeSelect}
                onBlur={onBlur}
                value={value}
                {...selectProps}
                options={listOption}
                onPopupScroll={onScroll}
                showSearch
                onSearch={(e) => {
                    setSearch(e)
                    if (e.length === 0) {
                        setListOption([])
                        getListOptions(0)
                    }
                }}
                onClear={() => {
                    page.current = 0
                    getListOptions(0)
                }}
                onFocus={() => {
                    if (!uri.includes('undefined')) {
                        getListOptions(page.current)
                    }
                }}
                notFoundContent={loading && displayLoading ? <Spin size="small" /> : null}
            />
        </Form.Item> :
        <Select
            onChange={onChangeSelect}
            onBlur={onBlur}
            value={value}
            {...selectProps}
            options={loading && page.current === 0 ? [] :listOption}
            onPopupScroll={onScroll}
            showSearch
            onSearch={(e) => {
                setSearch(e)
                if (e.length === 0) {
                    setListOption([])
                    getListOptions(0)
                }
            }}
            onClear={() => {
                page.current = 0
                getListOptions(0)
            }}
            onFocus={() => {
                if (!uri.includes('undefined')) {
                    getListOptions(page.current)
                }
            }}
            notFoundContent={loading && displayLoading ? <Spin size="small" /> : null}
        />
    )
}

FormSelect.displayName = 'FormSelect'
export const FormSelectKeyWordSearch = memo(FormSelect);

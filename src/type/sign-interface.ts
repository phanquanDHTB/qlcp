export interface IFiles {
    index: string
}   

export interface IFilesList {
        file_id: string,
        file_name: string,
        file_size: number,
        file_type: string,
        id: number,
        mime_type: string,
        path: string,
        position: string,
        voffice_path: string,
}

export interface IUsersSignDTOS {
    departmentRole?:{
        full_name: string,
        is_default: string,
        label: string,
        org_id: string,
        org_name: string,
        path_id_org: string,
        position: string,
        role_code: string,
        role_name: string,
        sys_role_id: string,
        sys_user_id: string,
        user_role_id: number,
        value: string,
    }
    departmentSignId: string,
    display_name: string,
    email: string,
    employee_code: string,
    employee_id: number,
    fullName: string,
    isDisplay: number,
    label: string,
    mobile_phone: string,
    org_name: string,
    path_name: string,
    position: string,
    sysUserId: string,
    sys_organization_id: string,
    value: number
    _id?: string
    role_key: number | null
    code: string,
}

export interface IData {
    description?: string,
    documentTypeId?: number,
    domainId?: number,
    files?: IFiles[],
    isAutoPromulgate?: boolean,
    password?: string,
    planId?: number,
    priorityId?: number,
    title?: string,
    type?: number,
    username?: string,
    usersSignDTOS?: IUsersSignDTOS[]
    reSign?: number
}
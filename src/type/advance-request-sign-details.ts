import { IDepartment, IPlan, IPosition, IUser, IplanRequired, IplanUserId } from 'type'
import dayjs from "dayjs"

export interface IDomain {
    active?: boolean,
    code?: string,
    description?: string,
    id?: number,
    insDate?: string,
    insertId?: number,
    name?: string,
    updDate?: string,
    updateId?: number,
}

export interface IDocumentUserList {
    active?: boolean,
    code?: string,
    department?: string,
    description?: string,
    document_id?: number,
    email?: string,
    full_name?: string,
    id?: number,
    is_active?: boolean,
    is_display?: number,
    name?: string,
    position?: string
}

export interface IDocumentFileList {
    active?: boolean,
    description?: string,
    document_id?: number,
    file_id?: string,
    file_name?: string,
    file_size?: number,
    file_type?: string,
    id?: number,
    is_active?: boolean,
    mime_type?: string,
    path?: string,
    position?: number,
    voffice_path?: string,
}

export interface IDocumentType {
    active?: boolean,
    code?: string,
    description?: string,
    id?: number,
    ins_date?: string,
    ins_id?: number,
    is_active?: boolean,
    name?: string,
    upd_date?: string,
    upd_id?: number,
}

export interface IDocumentContent {
    content: IDocument[],
    empty: boolean,
    first: boolean,
    last: boolean,
    number: number,
    pageable: {
        offset: number,
        pageNumber: number
        pageSize: number,
        paged: boolean,
        sort: {
            empty: boolean,
            sorted: boolean,
            unsorted: boolean,
        }
    }
    sort: {
        empty: boolean,
        sorted: boolean,
        unsorted: boolean,
    }
    numberOfElements: number,
    totalElements: number,
    totalPages: number
}

export interface IDocument {
    description?: string,
    document_file_list?: IDocumentFileList[],
    document_type?: IDocumentType,
    document_user_list?: IDocumentUserList[],
    domain?: IDomain,
    id?: number,
    isAutoPromulgate?: boolean,
    plan_dto?: string,
    priority_id?: number | undefined,
    status?: number | undefined,
    title?: string
}

export interface IPlanUserContent{
    content: IplanUserId[],
    empty: boolean,
    first: boolean,
    last: boolean,
    number: number,
    pageable: {
        offset: number,
        pageNumber: number
        pageSize: number,
        paged: boolean,
        sort: {
            empty: boolean,
            sorted: boolean,
            unsorted: boolean,
        }
    }
    sort: {
        empty: boolean,
        sorted: boolean,
        unsorted: boolean,
    }
    numberOfElements: number,
    totalElements: number,
    totalPages: number
}

export interface IPlanRequiredContent{
    content: IplanRequired[],
    empty: boolean,
    first: boolean,
    last: boolean,
    number: number,
    pageable: {
        offset: number,
        pageNumber: number
        pageSize: number,
        paged: boolean,
        sort: {
            empty: boolean,
            sorted: boolean,
            unsorted: boolean,
        }
    }
    sort: {
        empty: boolean,
        sorted: boolean,
        unsorted: boolean,
    }
    numberOfElements: number,
    totalElements: number,
    totalPages: number
}

export interface IStaff {
    account_number: string,
    amount?: number,
    bank?: string,
    code?: string,
    department: IDepartment,
    department_name?: string,
    description?: string,
    email?: string,
    end_time?: string | dayjs.Dayjs,
    gender: string,
    id: number,
    ins_date: string,
    ins_id: number,
    is_active?:boolean,
    name: string,
    phone_number: number,
    plan: IPlan,
    position: string,
    position_group?: IPosition,
    start_time?: string | dayjs.Dayjs,
    type: number,
    upd_date?: string,
    upd_id?: number,
    user: IUser,
    user_name: string
}

export interface IStaffContent{
    content: IStaff[],
    empty: boolean,
    first: boolean,
    last: boolean,
    number: number,
    pageable: {
        offset: number,
        pageNumber: number
        pageSize: number,
        paged: boolean,
        sort: {
            empty: boolean,
            sorted: boolean,
            unsorted: boolean,
        }
    }
    sort: {
        empty: boolean,
        sorted: boolean,
        unsorted: boolean,
    }
    numberOfElements: number,
    totalElements: number,
    totalPages: number
}
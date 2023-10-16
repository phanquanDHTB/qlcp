import dayjs from "dayjs"

export interface ICountry {
    id?: number,
    description?: string,
    code?: string,
    ins_date?: string,
    is_active?: boolean,
    name?: string
}

export interface IProvince {
    area?: {
        id?: number,
        name?: string,
        description?: string,
        code?: string
    },
    code?: string,
    country?: ICountry,
    end_time?: string,
    is_active?: boolean,
    name: string,
    type?: number,
    id?: number
}

export interface IDistrict {
    code?: string,
    country?: ICountry,
    description?: string,
    end_time?: string | dayjs.Dayjs,
    id?: number,
    ins_date?: string,
    ins_id?: number,
    is_active?: boolean,
    name?: string,
    province?: IProvince,
    start_time?: string
    type?: number
    upd_date?: string | dayjs.Dayjs,
    upd_id?: number
}
export interface IDepartment {
    address?: string,
    code?: string,
    country?: ICountry,
    province?: IProvince,
    district?: IDistrict,
    description?: string,
    id?: number,
    is_active?: boolean,
    name?: string,
    parent_id?: number,
    phone?: number,
    value?: number,
    label?: string
}

export interface IPosition {
    id: number,
    code?: string,
    description?: string,
    end_time?: string,
    is_active?: boolean,
    name?: string,
    start_time?: string
}

export interface IUser {
    avatar_id?: string,
    bank?: string,
    bank_account_number?: number,
    bank_code?: string,
    bank_location?: string,
    bank_name?: string,
    branch?: string,
    code?: string,
    email?: string,
    entity_id?: number,
    fullName?: string,
    gender?: string,
    id: number,
    is_active?: boolean,
    note?: string,
    phone_number?: number,
    username?: string,
    position?: IPosition
}

export interface IPurpose {
    code?: string,
    cost_id?: number,
    description?: string,
    end_time?: string,
    id?: number,
    is_active?: boolean,
    name?: string,
    purpose_service_group: any,
    start_time?: string
}

export interface IPlan {
    accounting_date?: string,
    code?: string,
    department_process: IDepartment,
    department_require?: IDepartment,
    description?: string,
    end_time?: string | dayjs.Dayjs,
    expire_time?: string,
    id?: number,
    is_accounting?: number,
    is_add?: boolean,
    max_amount?: number,
    parent?: IPlan,
    name?: string,
    note?: string
    purpose: IPurpose,
    required_amount?: number,
    start_time?: string | dayjs.Dayjs,
    status: number,
    type?: number,
    user_process: IUser,
    user_require?: IUser,
    ins_date?: string,
    ins_id?: number,
    upd_date?: string,
    upd_id?: number
}

export type Vehicle = {
    code?: string,
    name?: string,
    id: number,
    is_air: boolean,
}

export interface RouteInfor {
    description?: string,
    distance?: number,
    end_time: string | dayjs.Dayjs,
    start_time: string | dayjs.Dayjs,
    from_address?: string,
    from_country: ICountry,
    from_department?: IDepartment,
    from_department_name?: string,
    from_district?: IDistrict,
    from_province: IProvince,
    to_address?: string,
    to_country: ICountry,
    to_department?: IDepartment,
    to_department_name?: string,
    to_district?: IDistrict,
    to_province: IProvince,
    id: number,
    is_active?: boolean,
    is_from_internal?: boolean,
    is_land?: boolean,
    is_moving_route?: boolean,
    is_over_night?: boolean,
    is_sea?: boolean,
    is_to_internal?: boolean,
    name?: string,
    night_quantity?: number,
    plan?: IPlan,
    plan_route_user_dto_list: any,
    vehicle: Vehicle,
    select_user?: any
}

export interface IUploadFileResponse {
    file_id?: string,
    file_name?: string,
    file_size?: number,
    file_type?: string,
    id?: number,
    position?: number,
    voffice_path?: string
}
export interface IPlanCost {
    amount?: number,
    estimate_amount?: number,
    estimate_quantity?: number,
    limit_amount?: number,
    name_of_plan_route?: string,
    name_of_plan_route_user?: string,
    name_of_service?: string,
    name_of_service_group?: string,
    plan_id?: number,
    plan_route_id?: number,
    plan_route_user_id?: number,
    quantity?: number,
    service_group_id?: number,
    service_id?: number,
    total_amount?: number,
    total_estimate_amount?: number,
    user_id?: number,
}
export interface IPlanRoute {
    description?: string,
    distance?: number,
    end_time?: string | dayjs.Dayjs,
    from_address?: string,
    from_country?: {
        code?: string,
        description?: string,
        id?: number,
        ins_date?: string,
        ins_id?: number,
        is_active?: boolean,
        name?: string,
        upd_date?: string | dayjs.Dayjs,
        upd_id?: number
    },
    from_department?: IDepartment,
    from_department_name?: string,
    from_district?: IDistrict,
    from_province?: IProvince,
    id?: number,
    is_active?: boolean,
    is_confirm?: number,
    is_from_internal?: boolean,
    is_island?: boolean,
    is_moving_route?: boolean,
    is_over_night?: boolean,
    is_sea?: boolean,
    is_to_internal?: boolean,
    island?: boolean,
    movingRoute?: boolean,
    name?: string,
    night_quantity?: number,
}
export interface IplanUserId {
    account_number?: string,
    amount: number,
    bank?: string,
    code?: string,
    department?: IDepartment,
    department_name?: string,
    description?: string,
    email?: string,
    end_time?: string | dayjs.Dayjs,
    id?: number,
    ins_date?: string | dayjs.Dayjs,
    ins_id?: number,
    is_active?: boolean,
    phone_number?: string,
    plan?: IPlan,
    position?: string,
    position_group?: IPosition,
    start_time?: string | dayjs.Dayjs,
    type?: number,
    upd_date?: string | dayjs.Dayjs,
    upd_id?: number,
    user?: IUser,
    user_name?: string,
}

export interface IplanRequiredUser {
    amount?: number,
    code?: string,
    description?: string,
    end_time?: string | dayjs.Dayjs,
    id?: number,
    is_active?: boolean,
    name?: string,
    plan_required_id: IplanRequired,
    plan_user_id: IplanUserId
    gender?: string,
}

export interface IplanRequired {
    approve_date?: string | dayjs.Dayjs,
    code?: string,
    description?: string,
    end_time?: string | dayjs.Dayjs,
    expired_time?: string | dayjs.Dayjs,
    id?: number,
    ins_date?: string | dayjs.Dayjs,
    ins_id?: number,
    is_active?: boolean,
    name?: string,
    payment_name?: string,
    plan?: IPlan,
    plan_required_user?: IplanRequiredUser,
    reason?: string,
    start_time?: string | dayjs.Dayjs,
    status?: number,
    is_status?: number
    type?: number,
    upd_date?: string | dayjs.Dayjs,
    upd_id?: number,
    user_require?: IUser
}

export interface IDistrict {
    code?: string,
    country?: ICountry,
    description?: string,
    end_time?: string | dayjs.Dayjs,
    id?: number,
    ins_date?: string,
    ins_id?: number,
    is_active?: boolean,
    name?: string,
    province?: IProvince,
    start_time?: string
    type?: number
    upd_date?: string | dayjs.Dayjs,
    upd_id?: number
}

export interface IPlanRoute {
    description?: string,
    distance?: number,
    end_time?: string | dayjs.Dayjs,
    from_address?: string,
    from_country?: {
        code?: string,
        description?: string,
        id?: number,
        ins_date?: string,
        ins_id?: number,
        is_active?: boolean,
        name?: string,
        upd_date?: string | dayjs.Dayjs,
        upd_id?: number
    },
    from_department?: IDepartment,
    from_department_name?: string,
    from_district?: IDistrict,
    from_province?: IProvince,
    id?: number,
    is_active?: boolean,
    is_confirm?: number,
    is_from_internal?: boolean,
    is_island?: boolean,
    is_moving_route?: boolean,
    is_over_night?: boolean,
    is_sea?: boolean,
    is_to_internal?: boolean,
    island?: boolean,
    movingRoute?: boolean,
    name?: string,
    night_quantity?: number,
}

export interface IPlanCost {
    amount?: number,
    estimate_amount?: number,
    estimate_quantity?: number,
    limit_amount?: number,
    name_of_plan_route?: string,
    name_of_plan_route_user?: string,
    name_of_service?: string,
    name_of_service_group?: string,
    plan_id?: number,
    plan_route_id?: number,
    plan_route_user_id?: number,
    quantity?: number,
    service_group_id?: number,
    service_id?: number,
    total_amount?: number,
    total_estimate_amount?: number,
    user_id?: number,
}

export interface ICostHasBill {
    address?: string,
    code?: string,
    description?: string,
    file_id?: number,
    id: number,
    invoice_date?: string,
    provider?: string,
    payment_type?: string,
    type?: number,
    symbol?: string,
    tax_code?: string,
    total_amount?: number,
    total_fee?: number,
    total_final_amount: number,
    total_vat_amount?: number
}

export interface IDefaulOption {
    value?: number,
    label?: string,
    id?: number
}
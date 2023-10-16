import { IPlanRoute, IplanUserId } from 'type'

export interface ISelectedUser{
    approve_user_id?: number,
    code?: string,
    description?: string,
    end_time?: string,
    end_time_reality?: string,
    id?: number,
    is_active?: boolean,
    is_end?: boolean,
    is_start?: boolean,
    name?: string,
    plan_id?: number,
    plan_route: IPlanRoute,
    plan_user: IplanUserId,
    start_time: string,
    start_time_reality: string,
    status: number,
    user_id: number,
}
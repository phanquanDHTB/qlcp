import {create} from 'zustand'

export type RoleStoreType = {
	id: number,
	name: string
}

interface RoleState {
	roles: RoleStoreType[],
	setRoles: (roles: RoleStoreType[]) => void
}

export const useRoleStore = create<RoleState>()((set) => ({
	roles: [],
	setRoles: (roles) => set(() => ({roles: roles}))
}))
import { create } from 'zustand'


interface UserState {
    user?: any,
    setUser: (user: any) => void
}

export const useUserInfor = create<UserState>()((set) => ({
    user: undefined,
    setUser: (user) => set(() => ({ user: user }))
}))
import { create } from "zustand";

export type UserStoreType = {
    id: number;
    username: string;
    email?: string;
    department?: any;
    full_name?: any;
    departments?: any;
};

export type permType = {
    name: string;
};

interface UserState {
    user?: UserStoreType;
    permission?: any[];
    setUser: (user: UserStoreType) => void;
    setPermission: (perm: any[]) => void;
}

export const useUserStore = create<UserState>()((set) => ({
    user: undefined,
    permission: [],
    setUser: (user) => set(() => ({ user: user })),
    setPermission: (perm: permType[]) => set(() => ({ permission: perm })),
}));

import { create } from 'zustand';import { persist } from 'zustand/middleware';import type { User } from '@/types';
type AuthState={user?:User;login:(u:User)=>void;logout:()=>void};export const useAuthStore=create<AuthState>()(persist(set=>({user:undefined,login:user=>set({user}),logout:()=>set({user:undefined})}),{name:'telehealth-au-session'}));

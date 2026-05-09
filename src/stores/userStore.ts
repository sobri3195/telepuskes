import { create } from 'zustand';import { persist } from 'zustand/middleware';import { users } from '@/data/mockData';import type { User } from '@/types';
type S={profile:User;update:(u:Partial<User>)=>void};export const useUserStore=create<S>()(persist(set=>({profile:users[0],update:u=>set(s=>({profile:{...s.profile,...u}}))}),{name:'telehealth-au-profile'}));

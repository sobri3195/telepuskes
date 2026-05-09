import { create } from 'zustand';import { persist } from 'zustand/middleware';import type { NeedSubmission } from '@/types';
type S={needs:NeedSubmission[];addNeed:(n:NeedSubmission)=>void};export const usePatientNeedStore=create<S>()(persist(set=>({needs:[],addNeed:n=>set(s=>({needs:[n,...s.needs]}))}),{name:'telehealth-au-needs'}));

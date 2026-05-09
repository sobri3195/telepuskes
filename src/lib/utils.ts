import { clsx, type ClassValue } from 'clsx';import { twMerge } from 'tailwind-merge';export const cn=(...inputs:ClassValue[])=>twMerge(clsx(inputs));
export const formatTime=(iso:string)=>new Intl.DateTimeFormat('id-ID',{hour:'2-digit',minute:'2-digit',day:'2-digit',month:'short'}).format(new Date(iso));
export const csvEscape=(v:unknown)=>`"${String(v??'').replaceAll('"','""')}"`;

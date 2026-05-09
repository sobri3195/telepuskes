# Telehealth AU

Telehealth AU adalah prototype web app/browser-based SPA untuk simulasi layanan telehealth lingkungan TNI Angkatan Udara. Aplikasi berjalan sepenuhnya di frontend tanpa backend, API server, database, Redis, Prisma, S3/MinIO, atau NestJS.

## Fitur

- Login frontend-only dengan akun dummy pasien, dokter, dan admin.
- Dashboard pasien responsive dengan sidebar desktop dan bottom navigation mobile.
- Interaksi kebutuhan pasien: pilihan kebutuhan, pertanyaan adaptif, upload dokumen simulasi, triase frontend-only, rekomendasi layanan, dan pembukaan konsultasi/chat simulasi.
- Logika triase merah/kuning/hijau berbasis mock rules.
- Chat simulasi pasien-dokter/admin dengan message bubble, timestamp, status, typing indicator, auto reply, attachment dummy, dan persist localStorage.
- Direktori jajaran/faskes TNI AU dari mock data TypeScript hierarkis.
- Dashboard dokter dengan antrean, triase, catatan SOAP, resep, dan rujukan simulasi.
- Dashboard admin dengan statistik, master data, dan export CSV dummy frontend-only.

## Akun Dummy

- Pasien: `pasien@telehealthau.test` / `password`
- Dokter: `dokter@telehealthau.test` / `password`
- Admin: `admin@telehealthau.test` / `password`

## Menjalankan

```bash
npm install
npm run dev
```

Build produksi:

```bash
npm run build
```

## Stack

React, Vite, TypeScript, Tailwind CSS, komponen bergaya shadcn/ui lokal, React Router, TanStack Query, React Hook Form, Zod, Zustand, localStorage, dan mock service Promise dengan delay.

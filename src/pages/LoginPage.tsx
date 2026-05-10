import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getRoleHome } from '@/lib/navigation';
import { authService } from '@/services/mockServices';
import { useAuthStore } from '@/stores/authStore';
import type { User } from '@/types';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });
type Form = z.infer<typeof schema>;

const quickAccounts = [
  { label: 'Login cepat pasien', email: 'pasien@telehealthau.test' },
  { label: 'Login cepat dokter', email: 'dokter@telehealthau.test' },
  { label: 'Login cepat admin', email: 'admin@telehealthau.test' },
];

export function LoginPage() {
  const [err, setErr] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const nav = useNavigate();
  const login = useAuthStore((s) => s.login);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema), defaultValues: { email: 'pasien@telehealthau.test', password: 'password' } });

  function completeLogin(user: User) {
    login(user);
    nav(getRoleHome(user.role), { replace: true });
  }

  async function submit(v: Form) {
    setIsLoading(true);
    setErr('');
    try {
      const user = await authService.login(v.email, v.password);
      completeLogin(user);
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function quick(email: string) {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password', { shouldValidate: true });
    await submit({ email, password: 'password' });
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-sky-900 to-slate-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Telehealth AU</CardTitle>
          <p className="text-sm text-muted-foreground">Login dummy frontend-only dengan routing sesuai peran.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submit)} className="space-y-3">
            <Input placeholder="Email" aria-invalid={Boolean(errors.email)} {...register('email')} />
            {errors.email && <p className="text-xs text-red-600">Masukkan format email yang valid.</p>}
            <Input type="password" placeholder="Password" aria-invalid={Boolean(errors.password)} {...register('password')} />
            {err && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{err}</p>}
            <Button className="w-full" disabled={isLoading}>{isLoading ? 'Memproses...' : 'Masuk'}</Button>
          </form>
          <div className="mt-4 grid gap-2">
            {quickAccounts.map((account) => (
              <Button key={account.email} variant="outline" onClick={() => void quick(account.email)} disabled={isLoading}>{account.label}</Button>
            ))}
          </div>
          <Link className="mt-4 block text-center text-sm text-primary" to="/register">Registrasi dummy</Link>
        </CardContent>
      </Card>
    </div>
  );
}

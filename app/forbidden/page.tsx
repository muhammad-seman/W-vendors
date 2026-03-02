import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { Button } from '@/app/_components/ui/button';

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-6">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-rose-50">
          <ShieldX className="h-8 w-8 text-rose-500" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Akses Ditolak</h1>
        <p className="text-slate-500 mb-6">
          Kamu nggak punya izin buat akses halaman ini. Kalau rasa ini kekeliruan, hubungi admin ya.
        </p>
        <Button asChild>
          <Link href="/">Kembali ke Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}

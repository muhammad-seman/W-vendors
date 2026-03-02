'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

import { Button } from '@/app/_components/ui/button';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/app/_components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/_components/ui/alert-dialog';
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from '../actions';

type Category = { id: string; name: string; slug: string; icon?: string | null; created_at?: Date | null };

const ICON_OPTIONS = ['heart','utensils','palette','camera','building','music','sparkles','tag','star','gift'];

export function CategoriesTable({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [createOpen, setCreateOpen] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [deleteCat, setDeleteCat] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: 'tag' });

  const handleCreate = () => {
    if (!form.name) return;
    startTransition(async () => {
      await createCategoryAction({ name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '_'), icon: form.icon });
      setCreateOpen(false);
      setForm({ name: '', slug: '', icon: 'tag' });
      router.refresh();
    });
  };

  const handleEdit = () => {
    if (!editCat) return;
    startTransition(async () => {
      await updateCategoryAction(editCat.id, form);
      setEditCat(null);
      router.refresh();
    });
  };

  const handleDelete = () => {
    if (!deleteCat) return;
    startTransition(async () => {
      await deleteCategoryAction(deleteCat.id);
      setDeleteCat(null);
      router.refresh();
    });
  };

  function CategoryForm() {
    return (
      <div className="grid gap-3 py-2">
        <div className="space-y-1.5">
          <Label>Nama Kategori *</Label>
          <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="cth. Wedding Organizer" />
        </div>
        <div className="space-y-1.5">
          <Label>Slug</Label>
          <Input value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="wedding_organizer (opsional)" />
          <p className="text-[11px] text-slate-400">Diisi otomatis jika dikosongkan</p>
        </div>
        <div className="space-y-1.5">
          <Label>Ikon</Label>
          <div className="flex flex-wrap gap-2">
            {ICON_OPTIONS.map((icon) => (
              <button key={icon} type="button"
                className={`px-2.5 py-1 rounded-md text-xs border transition-colors ${form.icon === icon ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500' : 'border-border text-muted-foreground hover:bg-accent'}`}
                onClick={() => setForm((p) => ({ ...p, icon }))}>
                {icon}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b bg-muted/30">
        <p className="text-xs text-muted-foreground/70">Total <span className="font-semibold text-card-foreground">{categories.length}</span> kategori</p>
        <Button size="sm" onClick={() => { setForm({ name: '', slug: '', icon: 'tag' }); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />Tambah Kategori
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left w-10 text-muted-foreground/70 font-medium">#</th>
              <th className="px-4 py-3 text-left text-muted-foreground/80 font-medium">Nama</th>
              <th className="px-4 py-3 text-left text-muted-foreground/80 font-medium">Slug</th>
              <th className="px-4 py-3 text-left text-muted-foreground/80 font-medium">Ikon</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground/70">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {categories.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-16 text-center text-muted-foreground/60 text-sm">Belum ada kategori.</td></tr>
            ) : (
              categories.map((cat, idx) => (
                <tr key={cat.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground/60 text-xs">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{cat.name}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground/70 font-mono">{cat.slug}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground/70">{cat.icon ?? '—'}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="icon" className="h-7 w-7 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-md"
                        onClick={() => { setEditCat(cat); setForm({ name: cat.name, slug: cat.slug, icon: cat.icon ?? 'tag' }); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" className="h-7 w-7 bg-rose-500 hover:bg-rose-600 text-white rounded-md"
                        onClick={() => setDeleteCat(cat)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Dialogs */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Tambah Kategori</DialogTitle></DialogHeader>
          <CategoryForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={isPending}>{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editCat} onOpenChange={(o) => !o && setEditCat(null)}>
        <DialogContent className="max-w-md"><DialogHeader><DialogTitle>Edit Kategori</DialogTitle></DialogHeader>
          <CategoryForm />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditCat(null)}>Batal</Button>
            <Button onClick={handleEdit} disabled={isPending}>{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteCat} onOpenChange={(o) => !o && setDeleteCat(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Kategori</AlertDialogTitle>
            <AlertDialogDescription>Yakin mau hapus kategori <strong>{deleteCat?.name}</strong>? Ini bisa berpengaruh ke produk yang pakai kategori ini.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-500 hover:bg-rose-600" onClick={handleDelete}>{isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

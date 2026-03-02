'use client';

import { useState, useTransition, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Loader2, Pencil, Trash2, Eye, ArrowUp, ArrowDown, ArrowUpDown, Filter, X, ChevronDown, ImageOff, Layers } from 'lucide-react';
import { toast } from 'sonner';

import type { Product, ProductPhoto } from '@/src/entities/models/product';
import { ProductDetailSheet } from './product-detail-sheet';
import { Button } from '@/app/_components/ui/button';
import { Badge } from '@/app/_components/ui/badge';
import { Input } from '@/app/_components/ui/input';
import { Label } from '@/app/_components/ui/label';
import { Checkbox } from '@/app/_components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/app/_components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/app/_components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/app/_components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuTrigger,
} from '@/app/_components/ui/dropdown-menu';
import { cn } from '@/app/_components/utils';
import { Textarea } from '@/app/_components/ui/textarea';

// ── Types ─────────────────────────────────────────────────
type Category = { id: string; name: string; slug: string; icon?: string | null };
type EnrichedProduct = Product & { photos: ProductPhoto[]; category: Category };

// ── Helpers ───────────────────────────────────────────────
function fmt(num: number | null | undefined) {
  if (!num) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

// ── Sort header ───────────────────────────────────────────
function SortHeader({ label, col, sortCol, sortDir, onSort }: { label: string; col: string; sortCol: string; sortDir: string; onSort: (c: string) => void }) {
  const active = sortCol === col;
  return (
    <button onClick={() => onSort(col)} className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground group">
      {label}
      <span className={cn('opacity-40 group-hover:opacity-80', active && 'opacity-100 text-indigo-500')}>
        {active ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3" />}
      </span>
    </button>
  );
}

// ── Category filter ───────────────────────────────────────
function CategoryFilter({ categories, selected, onChange }: { categories: Category[]; selected: string[]; onChange: (v: string[]) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn('inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors', selected.length > 0 ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500' : 'border-border bg-card text-muted-foreground hover:bg-accent')}>
          <Filter className="h-3 w-3" />Kategori
          {selected.length > 0 && <span className="rounded-full bg-indigo-500 text-white px-1.5 text-[10px]">{selected.length}</span>}
          <ChevronDown className="h-3 w-3 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-2 min-w-[180px]">
        {categories.map((cat) => (
          <label key={cat.id} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-50 cursor-pointer">
            <Checkbox checked={selected.includes(cat.id)} onCheckedChange={(c) => onChange(c ? [...selected, cat.id] : selected.filter((s) => s !== cat.id))} />
            <span className="text-sm text-card-foreground">{cat.name}</span>
          </label>
        ))}
        {selected.length > 0 && <button onClick={() => onChange([])} className="mt-2 w-full text-xs text-red-400 hover:text-red-600 flex items-center gap-1 justify-center"><X className="h-3 w-3" />Bersihkan</button>}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── Product form ──────────────────────────────────────────
function ProductForm({
  data, onChange, categories, vendors, isCreate, canReadAll,
}: {
  data: Record<string, any>;
  onChange: (f: string, v: any) => void;
  categories: Category[];
  vendors: any[];
  isCreate: boolean;
  canReadAll: boolean;
}) {
  const handleFileChange = async (index: number, file: File | null) => {
    if (!file) return;

    try {
      // Show loading or something? For now just do it
      const resizedBase64 = await resizeImage(file);
      
      const photos = [...(data.photos ?? [{},{},{},{},{}])];
      photos[index] = { ...(photos[index] ?? {}), url: resizedBase64, order_idx: index, _isNew: true };
      onChange('photos', photos);
    } catch (err) {
      console.error('Failed to process image:', err);
      toast.error('Gagal memproses gambar. Silakan coba file lain.');
    }
  };

  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        {canReadAll && (
          <div className="col-span-2 space-y-1.5 bg-indigo-500/5 p-3 rounded-lg border border-indigo-500/10">
            <Label className="text-indigo-600 font-semibold flex items-center gap-2">
              <Plus className="h-4 w-4" />Pilih Vendor (Admin Only)
            </Label>
            <Select value={data.vendor_id ?? ''} onValueChange={(v) => onChange('vendor_id', v)}>
              <SelectTrigger className="border-indigo-500/20 focus:ring-indigo-500/30">
                <SelectValue placeholder="Pilih vendor untuk produk ini" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((v) => (
                  <SelectItem key={v.id} value={v.id}>{v.username} ({v.email ?? 'tanpa email'})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <div className="col-span-2 space-y-1.5">
          <Label>Nama Produk *</Label>
          <Input value={data.name ?? ''} onChange={(e) => onChange('name', e.target.value)} placeholder="cth. Paket Pernikahan Premium" />
        </div>
        <div className="space-y-1.5">
          <Label>Kategori *</Label>
          <Select value={data.category_id ?? ''} onValueChange={(v) => onChange('category_id', v)}>
            <SelectTrigger><SelectValue placeholder="Pilih kategori" /></SelectTrigger>
            <SelectContent>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Slot Bersamaan</Label>
          <Input type="number" min={1} value={data.concurrent_slots ?? 1} onChange={(e) => onChange('concurrent_slots', Number(e.target.value))} placeholder="cth. 2" />
          <p className="text-[11px] text-muted-foreground/60">Berapa acara yang bisa ditangani di waktu bersamaan</p>
        </div>
        <div className="space-y-1.5">
          <Label>Harga Minimum (IDR)</Label>
          <Input type="number" min={0} value={data.price_min ?? 0} onChange={(e) => onChange('price_min', Number(e.target.value))} placeholder="0" />
        </div>
        <div className="space-y-1.5">
          <Label>Harga Maksimum (IDR)</Label>
          <Input type="number" min={0} value={data.price_max ?? 0} onChange={(e) => onChange('price_max', Number(e.target.value))} placeholder="0" />
        </div>
        <div className="col-span-2 space-y-1.5">
          <Label>Deskripsi</Label>
          <Textarea value={data.description ?? ''} onChange={(e) => onChange('description', e.target.value)} placeholder="Ceritain produk atau layanan ini..." rows={3} />
        </div>
        {/* Photos — File inputs */}
        <div className="col-span-2 space-y-2">
          <Label>Foto (maks. 5 File)</Label>
          <div className="grid grid-cols-5 gap-2">
            {[0,1,2,3,4].map((i) => {
              const photo = (data.photos ?? [])[i];
              return (
                <div key={i} className="group relative aspect-square rounded-md border-2 border-dashed border-muted-foreground/20 hover:border-indigo-500/50 transition-colors bg-muted/30 overflow-hidden flex flex-col items-center justify-center cursor-pointer">
                  {photo?.url ? (
                    <>
                      <img src={photo.url} alt="" className="h-full w-full object-cover" />
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          const photos = [...(data.photos ?? [])];
                          photos[i] = { ...photos[i], url: '' };
                          onChange('photos', photos);
                        }}
                        className="absolute top-1 right-1 h-5 w-5 bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Plus className="h-5 w-5 text-muted-foreground/40 group-hover:text-indigo-500/60" />
                      <span className="text-[10px] text-muted-foreground/40 font-medium">Upload</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => handleFileChange(i, e.target.files?.[0] ?? null)}
                  />
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground/50 italic">* Foto akan disimpan di server (maks 5 file). Pastikan ukuran file tidak terlalu besar.</p>
        </div>
        {!isCreate && (
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={data.is_active ? 'active' : 'inactive'} onValueChange={(v) => onChange('is_active', v === 'active')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Table Component ──────────────────────────────────
const resizeImage = (file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.8): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width *= maxHeight / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
};

export function ProductsTable({
  products, total, categories, vendors, limit, offset, sortCol, sortDir, activeFilters,
  currentUserId, currentUserRole, canReadAll,
}: {
  products: EnrichedProduct[];
  total: number;
  categories: Category[];
  vendors: any[];
  limit: number;
  offset: number;
  sortCol: string;
  sortDir: string;
  activeFilters: { category_id?: string[] };
  currentUserId: string;
  currentUserRole: string;
  canReadAll: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [createOpen, setCreateOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<EnrichedProduct | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<EnrichedProduct | null>(null);
  const [detailProduct, setDetailProduct] = useState<EnrichedProduct | null>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  const [localFilters, setLocalFilters] = useState({ category_id: activeFilters.category_id ?? [] });

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  const buildParams = useCallback((updates: Record<string, string | string[] | undefined>) => {
    const p = new URLSearchParams();
    searchParams.forEach((v, k) => { if (!['category_id', 'offset'].includes(k)) p.set(k, v); });
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined) { p.delete(k); return; }
      if (Array.isArray(v)) { p.delete(k); v.forEach((val) => p.append(k, val)); }
      else p.set(k, v);
    });
    return p.toString();
  }, [searchParams]);

  function handleSort(col: string) {
    router.push(`/products?${buildParams({ sort: col, dir: sortCol === col && sortDir === 'asc' ? 'desc' : 'asc', offset: '0' })}`);
  }

  function handleCategoryFilter(vals: string[]) {
    setLocalFilters({ category_id: vals });
    router.push(`/products?${buildParams({ category_id: vals, offset: '0' })}`);
  }

  function navigatePage(newOffset: number) { router.push(`/products?${buildParams({ offset: String(newOffset) })}`); }
  function changeLimit(val: string) { router.push(`/products?${buildParams({ limit: val, offset: '0' })}`); }

  const sortProps = { sortCol, sortDir, onSort: handleSort };

  return (
    <div className="flex flex-col flex-1 bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-medium text-muted-foreground/60">Filter:</span>
          <CategoryFilter categories={categories} selected={localFilters.category_id} onChange={handleCategoryFilter} />
          {localFilters.category_id.length > 0 && (
            <button onClick={() => handleCategoryFilter([])} className="text-xs text-rose-500 flex items-center gap-1">
              <X className="h-3 w-3" />Hapus filter
            </button>
          )}
        </div>
        <Button size="sm" onClick={() => { setForm({}); setCreateOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" />Tambah Produk
        </Button>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left w-10 text-muted-foreground/70 font-medium">#</th>
              <th className="px-4 py-3 text-left"><SortHeader label="Nama"         col="name"             {...sortProps} /></th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Kategori</th>
              <th className="px-4 py-3 text-left"><SortHeader label="Kisaran Harga"  col="price_min"        {...sortProps} /></th>
              <th className="px-4 py-3 text-left"><SortHeader label="Slot"           col="concurrent_slots" {...sortProps} /></th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Foto</th>
              <th className="px-4 py-3 text-left font-medium text-slate-600">Status</th>
              <th className="px-4 py-3 text-right font-medium text-slate-500">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-16 text-center text-muted-foreground/60 text-sm">Belum ada produk.</td></tr>
            ) : (
              products.map((p, idx) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground/60 text-xs">{offset + idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-foreground">{p.name}</div>
                    {p.description && <div className="text-[11px] text-muted-foreground/60 truncate max-w-[200px]">{p.description}</div>}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs bg-muted text-muted-foreground/80 px-2 py-0.5 rounded-full">{p.category?.name ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground/80">
                    {p.price_min || p.price_max ? `${fmt(p.price_min)}${p.price_max ? ` – ${fmt(p.price_max)}` : ''}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground/80">
                      <Layers className="h-3 w-3 text-muted-foreground/60" />{p.concurrent_slots ?? 1}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex -space-x-1">
                      {p.photos.length > 0
                        ? p.photos.slice(0, 3).map((ph, i) => (
                          <div key={ph.id} className="h-7 w-7 rounded-md border-2 border-background bg-muted overflow-hidden" style={{ zIndex: 3 - i }}>
                            <img src={ph.url} alt="" className="h-full w-full object-cover" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                          </div>
                        ))
                        : <span className="text-xs text-muted-foreground/60 flex items-center gap-1"><ImageOff className="h-3 w-3" />tidak ada</span>
                      }
                      {p.photos.length > 3 && <span className="text-[10px] text-muted-foreground/60 ml-1.5 self-center">+{p.photos.length - 3}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={p.is_active ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[11px]' : 'bg-muted text-muted-foreground/60 border-border/50 text-[11px]'}>
                      {p.is_active ? 'Aktif' : 'Nonaktif'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="icon" className="h-7 w-7 bg-indigo-500 hover:bg-indigo-500 text-white rounded-md"
                        onClick={() => setDetailProduct(p)}>
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" className="h-7 w-7 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-md"
                        onClick={() => { setEditProduct(p); setForm({ ...p, photos: p.photos }); }}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="icon" className="h-7 w-7 bg-rose-500 hover:bg-rose-600 text-white rounded-md"
                        onClick={() => setDeleteProduct(p)}>
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

      {/* Pagination */}
      <div className="flex items-center justify-between border-t px-5 py-3 bg-muted/20">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <span>Baris:</span>
            <Select value={String(limit)} onValueChange={changeLimit}>
              <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{[25, 50, 100].map((l) => <SelectItem key={l} value={String(l)}>{l}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-muted-foreground/60">
            Menampilkan <span className="font-medium text-slate-600">{total === 0 ? 0 : offset + 1}–{Math.min(offset + limit, total)}</span> dari <span className="font-medium text-slate-600">{total}</span> produk
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" disabled={offset === 0} onClick={() => navigatePage(Math.max(0, offset - limit))}>← Sebelumnya</Button>
          <span className="text-xs text-muted-foreground/70 px-2">Hal {currentPage} / {totalPages || 1}</span>
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" disabled={offset + limit >= total} onClick={() => navigatePage(offset + limit)}>Berikutnya →</Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Tambah Produk Baru</DialogTitle></DialogHeader>
          <ProductForm 
            data={form} 
            onChange={(f, v) => setForm((p) => ({ ...p, [f]: v }))} 
            categories={categories} 
            vendors={vendors}
            isCreate={true} 
            canReadAll={canReadAll}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button disabled={isPending} onClick={() => {
              if (!form.name || !form.category_id) return;
              startTransition(async () => {
                const { createProductAction } = await import('@/app/(dashboard)/products/actions');
                // Use selected vendor_id for admin, or default to current user
                const vendor_id = canReadAll ? (form.vendor_id || currentUserId) : currentUserId;
                await createProductAction({ ...form, vendor_id });
                setCreateOpen(false);
                setForm({});
                router.refresh();
              });
            }}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Simpan Produk
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editProduct} onOpenChange={(o) => !o && setEditProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Edit Produk</DialogTitle></DialogHeader>
          <ProductForm 
            data={form} 
            onChange={(f, v) => setForm((p) => ({ ...p, [f]: v }))} 
            categories={categories} 
            vendors={vendors}
            isCreate={false} 
            canReadAll={canReadAll}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProduct(null)}>Batal</Button>
            <Button disabled={isPending} onClick={() => {
              if (!editProduct) return;
              startTransition(async () => {
                const { updateProductAction } = await import('@/app/(dashboard)/products/actions');
                await updateProductAction(editProduct.id, form);
                setEditProduct(null);
                router.refresh();
              });
            }}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteProduct} onOpenChange={(o) => !o && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Produk</AlertDialogTitle>
            <AlertDialogDescription>Yakin mau hapus <strong>{deleteProduct?.name}</strong>? Semua foto terkait juga akan dihapus. Tidak bisa dibatalkan.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction className="bg-rose-500 hover:bg-rose-600" onClick={() => {
              if (!deleteProduct) return;
              startTransition(async () => {
                const { deleteProductAction } = await import('@/app/(dashboard)/products/actions');
                await deleteProductAction(deleteProduct.id);
                setDeleteProduct(null);
                router.refresh();
              });
            }}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Product Detail Sheet */}
      <ProductDetailSheet
        product={detailProduct}
        open={!!detailProduct}
        onClose={() => setDetailProduct(null)}
      />
    </div>
  );
}

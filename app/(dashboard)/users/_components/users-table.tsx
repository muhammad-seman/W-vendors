'use client';

import { useState, useTransition, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Pencil, Trash2, Plus, Loader2,
  ArrowUp, ArrowDown, ArrowUpDown,
  Filter, X, ChevronDown, Search,
} from 'lucide-react';

import {
  User, UpdateUser, CreateUser,
  subscriptionPlanEnum, userRoleEnum, userStatusEnum,
} from '@/src/entities/models/user';
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
import { createUserAction, updateUserAction, deleteUserAction } from '../actions';
import { cn } from '@/app/_components/utils';

// ── Labels ───────────────────────────────────────────────
const PLAN_BADGE: Record<string, string> = {
  basic: 'bg-muted text-muted-foreground border-border/50',
  pro: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  enterprise: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
};
const PLAN_LABELS: Record<string, string> = {
  basic: 'Dasar',
  pro: 'Profesional',
  enterprise: 'Bisnis',
};
const STATUS_BADGE: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  suspended: 'bg-red-500/10 text-red-500 border-red-500/20',
};
const STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
  suspended: 'Ditangguhkan',
};
const ROLE_LABELS: Record<string, string> = {
  dev: 'Pengembang', admin: 'Administrator', vendor: 'Vendor',
};

// ── Column sort header ────────────────────────────────────
function SortHeader({
  label, col, sortCol, sortDir, onSort,
}: {
  label: string;
  col: string;
  sortCol: string;
  sortDir: string;
  onSort: (col: string) => void;
}) {
  const active = sortCol === col;
  return (
    <button
      onClick={() => onSort(col)}
      className="flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground group"
    >
      {label}
      <span className={cn('opacity-40 group-hover:opacity-80', active && 'opacity-100 text-indigo-500')}>
        {active
          ? (sortDir === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />)
          : <ArrowUpDown className="h-3 w-3" />
        }
      </span>
    </button>
  );
}

// ── Checkbox group filter ─────────────────────────────────
function CheckboxFilter({
  label, options, selected, onChange, renderLabel,
}: {
  label: string;
  options: readonly string[];
  selected: string[];
  onChange: (val: string[]) => void;
  renderLabel: (v: string) => string;
}) {
  const hasActive = selected.length > 0;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={cn(
          'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-colors',
          hasActive
            ? 'border-indigo-500/30 bg-indigo-500/10 text-indigo-500'
            : 'border-border bg-card text-muted-foreground hover:bg-accent'
        )}>
          <Filter className="h-3 w-3" />
          {label}
          {hasActive && (
            <span className="rounded-full bg-indigo-500 text-white px-1.5 py-0.5 text-[10px] ml-0.5">
              {selected.length}
            </span>
          )}
          <ChevronDown className="h-3 w-3 ml-0.5 opacity-60" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="p-2 min-w-[160px]">
        <div className="space-y-1">
          {options.map((opt) => (
            <label key={opt} className="flex items-center gap-2 px-1 py-1 rounded hover:bg-slate-50 cursor-pointer">
              <Checkbox
                checked={selected.includes(opt)}
                onCheckedChange={(checked) =>
                  onChange(checked ? [...selected, opt] : selected.filter((s) => s !== opt))
                }
              />
              <span className="text-sm text-card-foreground">{renderLabel(opt)}</span>
            </label>
          ))}
        </div>
        {hasActive && (
          <button
            onClick={() => onChange([])}
            className="mt-2 w-full text-xs text-muted-foreground/60 hover:text-destructive flex items-center gap-1 justify-center"
          >
            <X className="h-3 w-3" /> Bersihkan
          </button>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ── User form fields ──────────────────────────────────────
function UserFormFields({
  data, onChange, isCreate,
}: {
  data: Record<string, string | null | undefined>;
  onChange: (field: string, value: string) => void;
  isCreate: boolean;
}) {
  const isVendor = data.role === 'vendor';
  return (
    <div className="grid gap-4 py-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="username">Username *</Label>
          <Input id="username" value={data.username ?? ''} onChange={(e) => onChange('username', e.target.value)} placeholder="cth. vendor_jakarta" />
        </div>
        {isCreate && (
          <div className="space-y-1.5">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" value={(data as any).password ?? ''} onChange={(e) => onChange('password', e.target.value)} placeholder="Min. 6 karakter" />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={data.email ?? ''} onChange={(e) => onChange('email', e.target.value)} placeholder="vendor@example.com" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="phone">Telepon</Label>
          <Input id="phone" value={data.phone ?? ''} onChange={(e) => onChange('phone', e.target.value)} placeholder="+62..." />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Role</Label>
          <Select value={(data.role as string) ?? 'vendor'} onValueChange={(v) => onChange('role', v)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {userRoleEnum.options.map((r) => (
                <SelectItem key={r} value={r}>{ROLE_LABELS[r] ?? r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isVendor && (
          <div className="space-y-1.5">
            <Label>Paket Langganan</Label>
            <Select value={(data.subscription_plan as string) ?? 'basic'} onValueChange={(v) => onChange('subscription_plan', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {subscriptionPlanEnum.options.map((p) => (
                  <SelectItem key={p} value={p}>{PLAN_LABELS[p] ?? p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {!isCreate && (
          <div className="space-y-1.5">
            <Label>Status</Label>
            <Select value={(data.status as string) ?? 'active'} onValueChange={(v) => onChange('status', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {userStatusEnum.options.map((s) => (
                  <SelectItem key={s} value={s}>{STATUS_LABELS[s] ?? s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main table component ──────────────────────────────────
type FilterState = { role: string[]; subscription_plan: string[]; status: string[] };

export function UsersTable({
  users, total, limit, offset, sortCol, sortDir, activeFilters, search,
}: {
  users: User[];
  total: number;
  limit: number;
  offset: number;
  sortCol: string;
  sortDir: string;
  search: string;
  activeFilters: { role?: string[]; subscription_plan?: string[]; status?: string[] };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  const [createOpen, setCreateOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);
  const [createForm, setCreateForm] = useState<Partial<CreateUser>>({ role: 'vendor', subscription_plan: 'basic' });
  const [editForm, setEditForm] = useState<Record<string, string | null | undefined>>({});

  const [localFilters, setLocalFilters] = useState<FilterState>({
    role:              activeFilters.role              ?? [],
    subscription_plan: activeFilters.subscription_plan ?? [],
    status:            activeFilters.status            ?? [],
  });

  // Debounced username search (300ms) updates URL
  function handleSearchChange(val: string) {
    setSearchInput(val);
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      router.push(`/users?${buildParams({ search: val.trim() || undefined, offset: '0' })}`);
    }, 300);
  }

  const totalPages = Math.ceil(total / limit);
  const currentPage = Math.floor(offset / limit) + 1;

  // ── URL helpers ─────────────────────────────────────────
  const buildParams = useCallback((updates: Record<string, string | string[] | undefined>) => {
    const p = new URLSearchParams();
    // Start from current params, excluding arrays we'll rebuild
    searchParams.forEach((v, k) => {
      if (!['role', 'subscription_plan', 'status', 'offset'].includes(k)) {
        p.set(k, v);
      }
    });
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') { p.delete(k); return; }
      if (Array.isArray(v)) { p.delete(k); v.forEach((val) => p.append(k, val)); }
      else p.set(k, v);
    });
    return p.toString();
  }, [searchParams]);

  function applyFilters(filters: FilterState) {
    router.push(`/users?${buildParams({
      role:              filters.role,
      subscription_plan: filters.subscription_plan,
      status:            filters.status,
      offset:            '0',
    })}`);
  }

  function handleFilterChange(key: keyof FilterState, values: string[]) {
    const next = { ...localFilters, [key]: values };
    setLocalFilters(next);
    applyFilters(next);
  }

  function handleSort(col: string) {
    const newDir = sortCol === col && sortDir === 'asc' ? 'desc' : 'asc';
    router.push(`/users?${buildParams({ sort: col, dir: newDir, offset: '0' })}`);
  }

  function navigatePage(newOffset: number) {
    router.push(`/users?${buildParams({ offset: String(newOffset) })}`);
  }

  function changeLimit(val: string) {
    router.push(`/users?${buildParams({ limit: val, offset: '0' })}`);
  }

  const clearAllFilters = () => {
    const empty: FilterState = { role: [], subscription_plan: [], status: [] };
    setLocalFilters(empty);
    applyFilters(empty);
  };

  const hasActiveFilters = Object.values(localFilters).some((v) => v.length > 0);

  async function handleCreate() {
    if (!createForm.username || !(createForm as any).password) return;
    startTransition(async () => {
      await createUserAction(createForm as Omit<CreateUser, 'id'>);
      setCreateOpen(false);
      setCreateForm({ role: 'vendor', subscription_plan: 'basic' });
    });
  }

  async function handleEdit() {
    if (!editUser) return;
    startTransition(async () => {
      await updateUserAction(editUser.id, editForm as UpdateUser);
      setEditUser(null);
      setEditForm({});
    });
  }

  async function handleDelete() {
    if (!deleteUser) return;
    startTransition(async () => {
      await deleteUserAction(deleteUser.id);
      setDeleteUser(null);
    });
  }

  const sortProps = { sortCol, sortDir, onSort: handleSort };

  return (
    <div className="flex flex-col flex-1 bg-card rounded-lg border shadow-sm overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center justify-between gap-3 px-5 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Username search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <input
              type="search"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Cari username..."
              className="pl-8 pr-3 py-1 h-8 text-xs rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 w-44"
            />
          </div>
          <div className="h-5 w-px bg-border" />
          <span className="text-xs font-medium text-slate-400">Filter:</span>
          <CheckboxFilter
            label="Role" options={userRoleEnum.options} selected={localFilters.role}
            onChange={(v) => handleFilterChange('role', v)}
            renderLabel={(v) => ROLE_LABELS[v] ?? v}
          />
          <CheckboxFilter
            label="Paket" options={subscriptionPlanEnum.options} selected={localFilters.subscription_plan}
            onChange={(v) => handleFilterChange('subscription_plan', v)}
            renderLabel={(v) => PLAN_LABELS[v] ?? v}
          />
          <CheckboxFilter
            label="Status" options={userStatusEnum.options} selected={localFilters.status}
            onChange={(v) => handleFilterChange('status', v)}
            renderLabel={(v) => STATUS_LABELS[v] ?? v}
          />
          {hasActiveFilters && (
            <button onClick={clearAllFilters} className="text-xs text-rose-500 hover:text-rose-700 flex items-center gap-1 ml-1">
              <X className="h-3 w-3" /> Hapus semua
            </button>
          )}
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} className="flex-shrink-0">
          <Plus className="h-4 w-4 mr-1" /> Tambah Pengguna
        </Button>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 text-left w-10 text-muted-foreground/70 font-medium">#</th>
              <th className="px-4 py-3 text-left"><SortHeader label="Username"      col="username"          {...sortProps} /></th>
              <th className="px-4 py-3 text-left"><SortHeader label="Email"         col="email"             {...sortProps} /></th>
              <th className="px-4 py-3 text-left"><SortHeader label="Role"          col="role"              {...sortProps} /></th>
              <th className="px-4 py-3 text-left"><SortHeader label="Paket"         col="subscription_plan" {...sortProps} /></th>
              <th className="px-4 py-3 text-left"><SortHeader label="Status"        col="status"            {...sortProps} /></th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground/70">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center text-slate-400 text-sm">
                  Pengguna tidak ditemukan.
                </td>
              </tr>
            ) : (
              users.map((user, idx) => (
                <tr key={user.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground/60 text-xs">{offset + idx + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{user.username}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{user.email ?? '—'}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-medium capitalize text-muted-foreground/80">{ROLE_LABELS[user.role] ?? user.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user.subscription_plan ? (
                      <Badge variant="outline" className={`text-[11px] px-2 ${PLAN_BADGE[user.subscription_plan] ?? ''}`}>
                        {PLAN_LABELS[user.subscription_plan] ?? user.subscription_plan}
                      </Badge>
                    ) : <span className="text-muted-foreground/60 text-xs">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`text-[11px] px-2 ${STATUS_BADGE[user.status ?? 'active'] ?? ''}`}>
                      {STATUS_LABELS[user.status ?? 'active'] ?? (user.status ?? 'Aktif')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="icon"
                        className="h-7 w-7 bg-foreground/10 hover:bg-foreground/20 text-foreground rounded-md"
                        onClick={() => {
                          setEditUser(user);
                          setEditForm({
                            username: user.username,
                            email: user.email ?? undefined,
                            phone: user.phone ?? undefined,
                            role: user.role,
                            subscription_plan: user.subscription_plan ?? undefined,
                            status: user.status,
                          });
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        className="h-7 w-7 bg-rose-500 hover:bg-rose-600 text-white rounded-md"
                        onClick={() => setDeleteUser(user)}
                      >
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

      {/* ── Pagination footer ── */}
      <div className="flex items-center justify-between border-t px-5 py-3 bg-muted/20">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
            <span>Baris:</span>
            <Select value={String(limit)} onValueChange={changeLimit}>
              <SelectTrigger className="h-7 w-16 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[25, 50, 100].map((l) => <SelectItem key={l} value={String(l)}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[11px] text-slate-400">
            Menampilkan <span className="font-medium text-slate-600">{total === 0 ? 0 : offset + 1}–{Math.min(offset + limit, total)}</span> dari <span className="font-medium text-slate-600">{total}</span> pengguna
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" disabled={offset === 0} onClick={() => navigatePage(Math.max(0, offset - limit))}>← Sebelumnya</Button>
          <span className="text-xs text-slate-500 px-2">Hal {currentPage} / {totalPages || 1}</span>
          <Button variant="outline" size="sm" className="h-7 px-3 text-xs" disabled={offset + limit >= total} onClick={() => navigatePage(offset + limit)}>Berikutnya →</Button>
        </div>
      </div>

      {/* ── Dialogs ── */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Tambah Pengguna Baru</DialogTitle></DialogHeader>
          <UserFormFields data={createForm as any} onChange={(f, v) => setCreateForm((p) => ({ ...p, [f]: v }))} isCreate />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Batal</Button>
            <Button onClick={handleCreate} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Buat Pengguna
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editUser} onOpenChange={(open) => !open && setEditUser(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Edit Pengguna</DialogTitle></DialogHeader>
          <UserFormFields data={editForm} onChange={(f, v) => setEditForm((p) => ({ ...p, [f]: v }))} isCreate={false} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>Batal</Button>
            <Button onClick={handleEdit} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
            <AlertDialogDescription>
              Yakin mau hapus <strong>{deleteUser?.username}</strong>? Tindakan ini tidak bisa dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-rose-500 hover:bg-rose-600">
              {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

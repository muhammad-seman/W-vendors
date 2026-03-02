'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Layers, Tag, ImageOff, BadgeCheck, BadgeX } from 'lucide-react';
import { cn } from '@/app/_components/utils';

type Photo = { id: string; url: string; order_idx: number };
type Category = { id: string; name: string; slug: string; icon?: string | null };
type Product = {
  id: string;
  name: string;
  description?: string | null;
  price_min?: number | null;
  price_max?: number | null;
  concurrent_slots?: number | null;
  is_active?: boolean | null;
  photos: Photo[];
  category?: Category | null;
};

function fmt(num: number | null | undefined) {
  if (!num) return null;
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

export function ProductDetailSheet({
  product,
  open,
  onClose,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}) {
  const [activeIdx, setActiveIdx] = useState(0);

  if (!product) return null;
  const photos = product.photos.sort((a, b) => a.order_idx - b.order_idx);
  const hasPhotos = photos.length > 0;

  // Reset active index when product changes
  const photoCount = photos.length;

  function prev() { setActiveIdx((i) => (i - 1 + photoCount) % photoCount); }
  function next() { setActiveIdx((i) => (i + 1) % photoCount); }

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300',
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-xl bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b">
          <div className="flex-1 min-w-0 pr-4">
            <h2 className="text-lg font-bold text-slate-900 leading-snug">{product.name}</h2>
            {product.category && (
              <div className="flex items-center gap-1.5 mt-1">
                <Tag className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs text-indigo-600 font-medium">{product.category.name}</span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-slate-100 transition-colors flex-shrink-0"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">

          {/* Photo gallery */}
          <div className="relative bg-slate-900">
            {hasPhotos ? (
              <>
                {/* Main photo */}
                <div className="relative w-full aspect-video overflow-hidden">
                  <img
                    src={photos[Math.min(activeIdx, photos.length - 1)]?.url}
                    alt={`Foto ${activeIdx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="225" fill="%231e293b"><text y="50%" x="50%" dominant-baseline="middle" text-anchor="middle" fill="%23475569" font-size="14">Gambar tidak tersedia</text></svg>'; }}
                  />
                  {/* Nav arrows */}
                  {photos.length > 1 && (
                    <>
                      <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors">
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </>
                  )}
                  {/* Counter badge */}
                  <div className="absolute bottom-2 right-3 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                    {activeIdx + 1} / {photos.length}
                  </div>
                </div>

                {/* Thumbnails */}
                {photos.length > 1 && (
                  <div className="flex gap-1.5 px-4 py-2.5 overflow-x-auto">
                    {photos.map((ph, i) => (
                      <button
                        key={ph.id}
                        onClick={() => setActiveIdx(i)}
                        className={cn(
                          'flex-shrink-0 h-14 w-20 rounded overflow-hidden border-2 transition-all',
                          i === activeIdx ? 'border-indigo-500 opacity-100' : 'border-transparent opacity-50 hover:opacity-80'
                        )}
                      >
                        <img src={ph.url} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="w-full aspect-video flex flex-col items-center justify-center bg-slate-800 gap-2">
                <ImageOff className="h-10 w-10 text-slate-600" />
                <span className="text-xs text-slate-500">Belum ada foto</span>
              </div>
            )}
          </div>

          {/* Info section */}
          <div className="px-6 py-5 space-y-5">

            {/* Status banner */}
            <div className={cn(
              'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium',
              product.is_active
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-500 border border-slate-200'
            )}>
              {product.is_active
                ? <><BadgeCheck className="h-4 w-4" /> Produk Aktif</>
                : <><BadgeX className="h-4 w-4" /> Produk Nonaktif</>
              }
            </div>

            {/* Price + Slots grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 rounded-lg p-4 border">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">Kisaran Harga</p>
                {product.price_min || product.price_max ? (
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{fmt(product.price_min) ?? '—'}</p>
                    {product.price_max && product.price_max !== product.price_min && (
                      <p className="text-xs text-slate-500 mt-0.5">s/d {fmt(product.price_max)}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Belum diset</p>
                )}
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border">
                <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-1">Slot Bersamaan</p>
                <div className="flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-500" />
                  <span className="text-sm font-semibold text-slate-800">{product.concurrent_slots ?? 1} acara</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">dapat ditangani bersamaan</p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-2">Deskripsi</p>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </div>
            )}

            {/* Photo list */}
            {hasPhotos && (
              <div>
                <p className="text-[11px] text-slate-400 uppercase tracking-wide font-medium mb-2">Semua Foto ({photos.length})</p>
                <div className="grid grid-cols-3 gap-2">
                  {photos.map((ph, i) => (
                    <button
                      key={ph.id}
                      onClick={() => setActiveIdx(i)}
                      className={cn('rounded-lg overflow-hidden border-2 aspect-square transition-all', i === activeIdx ? 'border-indigo-500' : 'border-slate-200 hover:border-slate-300')}
                    >
                      <img src={ph.url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

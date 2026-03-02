import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';
import { generateIdFromEntropySize } from 'lucia';

import { db } from '@/drizzle';
import { products, product_photos, categories } from '@/drizzle/schema';
import { IProductsRepository, GetProductsOpts } from '@/src/application/repositories/products.repository.interface';
import type { Product, CreateProduct, UpdateProduct, PaginatedProducts, ProductPhoto, CreatePhotoInput } from '@/src/entities/models/product';
import type { IInstrumentationService } from '@/src/application/services/instrumentation.service.interface';
import type { ICrashReporterService } from '@/src/application/services/crash-reporter.service.interface';

const SORT_COLS = {
  name:             products.name,
  price_min:        products.price_min,
  created_at:       products.created_at,
  concurrent_slots: products.concurrent_slots,
} as const;

export class ProductsRepository implements IProductsRepository {
  constructor(
    private readonly instrumentationService: IInstrumentationService,
    private readonly crashReporterService: ICrashReporterService
  ) {}

  async getProducts({ limit, offset, filters, sort }: GetProductsOpts): Promise<PaginatedProducts> {
    return this.instrumentationService.startSpan({ name: 'ProductsRepository > getProducts' }, async () => {
      try {
        const conditions = [];
        if (filters?.vendor_id)           conditions.push(eq(products.vendor_id, filters.vendor_id));
        if (filters?.category_id?.length) conditions.push(inArray(products.category_id, filters.category_id));
        if (filters?.is_active !== undefined) conditions.push(eq(products.is_active, filters.is_active));

        const where = conditions.length > 0 ? and(...conditions) : undefined;
        const sortCol = SORT_COLS[sort?.column ?? 'created_at'];
        const orderBy = sort?.direction === 'asc' ? asc(sortCol) : desc(sortCol);

        const [rows, countResult] = await Promise.all([
          db.select({
            product:  products,
            category: categories,
          })
            .from(products)
            .leftJoin(categories, eq(products.category_id, categories.id))
            .where(where)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset),
          db.select({ count: sql<number>`count(*)` }).from(products).where(where),
        ]);

        // Batch-fetch photos for all returned products in ONE query (no N+1)
        const productIds = rows.map((r: any) => r.product.id);
        const allPhotos = productIds.length > 0
          ? await db.select().from(product_photos).where(inArray(product_photos.product_id, productIds))
          : [];

        const photosByProduct: Record<string, any[]> = {};
        allPhotos.forEach((p: any) => {
          if (!photosByProduct[p.product_id]) photosByProduct[p.product_id] = [];
          photosByProduct[p.product_id].push(p);
        });

        const enriched = rows.map((r: any) => ({
          ...r.product,
          category: r.category!,
          photos:   (photosByProduct[r.product.id] ?? []).sort((a: any, b: any) => (a.order_idx ?? 0) - (b.order_idx ?? 0)),
        }));

        return {
          products: enriched as any,
          total:    Number(countResult[0]?.count ?? 0),
          limit,
          offset,
        };
      } catch (err) {
        this.crashReporterService.report(err);
        throw err;
      }
    });
  }

  async getProduct(id: string) {
    return this.instrumentationService.startSpan({ name: 'ProductsRepository > getProduct' }, async () => {
      try {
        const [row] = await db.select({ product: products, category: categories })
          .from(products)
          .leftJoin(categories, eq(products.category_id, categories.id))
          .where(eq(products.id, id))
          .limit(1);
        if (!row) return undefined;
        const photos = await db.select().from(product_photos).where(eq(product_photos.product_id, id));
        return { ...row.product, category: row.category!, photos } as any;
      } catch (err) {
        this.crashReporterService.report(err);
        throw err;
      }
    });
  }

  async createProduct(input: CreateProduct & { id: string }): Promise<Product> {
    return this.instrumentationService.startSpan({ name: 'ProductsRepository > createProduct' }, async () => {
      try {
        await db.insert(products).values({
          id:               input.id,
          vendor_id:        input.vendor_id,
          category_id:      input.category_id,
          name:             input.name,
          description:      input.description ?? null,
          price_min:        input.price_min ?? 0,
          price_max:        input.price_max ?? 0,
          concurrent_slots: input.concurrent_slots ?? 1,
          is_active:        input.is_active ?? true,
        });
        const created = await db.query.products.findFirst({ where: eq(products.id, input.id) });
        return created as Product;
      } catch (err) {
        this.crashReporterService.report(err);
        throw err;
      }
    });
  }

  async updateProduct(id: string, input: UpdateProduct): Promise<Product | undefined> {
    return this.instrumentationService.startSpan({ name: 'ProductsRepository > updateProduct' }, async () => {
      try {
        await db.update(products).set(input as any).where(eq(products.id, id));
        return await db.query.products.findFirst({ where: eq(products.id, id) }) as Product;
      } catch (err) {
        this.crashReporterService.report(err);
        throw err;
      }
    });
  }

  async deleteProduct(id: string): Promise<void> {
    return this.instrumentationService.startSpan({ name: 'ProductsRepository > deleteProduct' }, async () => {
      try {
        await db.delete(products).where(eq(products.id, id));
      } catch (err) {
        this.crashReporterService.report(err);
        throw err;
      }
    });
  }

  async addPhoto(input: CreatePhotoInput & { id: string }): Promise<ProductPhoto> {
    return this.instrumentationService.startSpan({ name: 'ProductsRepository > addPhoto' }, async () => {
      try {
        await db.insert(product_photos).values({
          id:         input.id,
          product_id: input.product_id,
          url:        input.url,
          order_idx:  input.order_idx ?? 0,
        });
        const photo = await db.query.product_photos.findFirst({ where: eq(product_photos.id, input.id) });
        return photo as ProductPhoto;
      } catch (err) {
        this.crashReporterService.report(err);
        throw err;
      }
    });
  }

  async deletePhoto(id: string): Promise<void> {
    return this.instrumentationService.startSpan({ name: 'ProductsRepository > deletePhoto' }, async () => {
      try {
        await db.delete(product_photos).where(eq(product_photos.id, id));
      } catch (err) {
        this.crashReporterService.report(err);
        throw err;
      }
    });
  }

  async updatePhoto(id: string, input: { order_idx: number }): Promise<void> {
    return this.instrumentationService.startSpan({ name: 'ProductsRepository > updatePhoto' }, async () => {
      try {
        await db.update(product_photos).set(input).where(eq(product_photos.id, id));
      } catch (err) {
        this.crashReporterService.report(err);
        throw err;
      }
    });
  }

  async getPhotoCount(product_id: string): Promise<number> {
    const [r] = await db.select({ c: sql<number>`count(*)` }).from(product_photos)
      .where(eq(product_photos.product_id, product_id));
    return Number(r?.c ?? 0);
  }
}

'use server';

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { generateIdFromEntropySize } from 'lucia';

import { getInjection } from '@/di/container';
import { SESSION_COOKIE } from '@/config';
import { ForbiddenError, hasPermission } from '@/src/infrastructure/services/rbac.service';

import fs from 'fs';
import path from 'path';

async function getAuthenticatedUser() {
  const sessionId = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!sessionId) throw new Error('Unauthenticated');
  const authService = getInjection('IAuthenticationService');
  const { user } = await authService.validateSession(sessionId);
  return user;
}

async function saveBase64Image(base64Data: string, productId: string, index: number): Promise<string> {
  // If it's already a URL (not base64), just return it
  if (!base64Data.startsWith('data:image/')) return base64Data;

  const match = base64Data.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
  if (!match) throw new Error('Invalid base64 data');

  const ext = match[1];
  const data = match[2];
  const buffer = Buffer.from(data, 'base64');
  
  // Validate file size (max 5MB)
  const MAX_SIZE = 5 * 1024 * 1024;
  if (buffer.length > MAX_SIZE) {
    throw new Error('Ukuran file terlalu besar. Maksimum 5MB.');
  }

  const fileName = `${productId}_${index}_${Date.now()}.${ext}`;
  const uploadDir = path.join(process.cwd(), 'public/uploads/products');
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filePath = path.join(uploadDir, fileName);
  await fs.promises.writeFile(filePath, new Uint8Array(buffer));
  
  return `/uploads/products/${fileName}`;
}

async function deleteProductPhotoFile(url: string) {
  if (!url.startsWith('/uploads/products/')) return;
  const filePath = path.join(process.cwd(), 'public', url);
  if (fs.existsSync(filePath)) {
    try {
      await fs.promises.unlink(filePath);
    } catch (err) {
      console.error(`Failed to delete file: ${filePath}`, err);
    }
  }
}

export async function createProductAction(data: Record<string, any>) {
  const user = await getAuthenticatedUser();
  const isAdmin = hasPermission(user, 'products:read_all');

  // Security: If not admin, vendor_id MUST be current user's id
  const targetVendorId = isAdmin ? (data.vendor_id ?? user.id) : user.id;

  const createProduct = getInjection('ICreateProductUseCase');
  const addPhoto      = getInjection('IAddProductPhotoUseCase');

  const productId = generateIdFromEntropySize(10);
  await createProduct({
    id:               productId,
    vendor_id:        targetVendorId,
    category_id:      data.category_id,
    name:             data.name,
    description:      data.description ?? null,
    price_min:        Number(data.price_min ?? 0),
    price_max:        Number(data.price_max ?? 0),
    concurrent_slots: Number(data.concurrent_slots ?? 1),
    is_active:        data.is_active ?? true,
  });

  // Add photos (max 5, skip empty URLs)
  const photosData = (data.photos ?? [])
    .filter((p: any) => p?.url?.trim())
    .slice(0, 5);

  for (let i = 0; i < photosData.length; i++) {
    const photo = photosData[i];
    const savedUrl = await saveBase64Image(photo.url, productId, i);
    await addPhoto({ 
      id: generateIdFromEntropySize(10), 
      product_id: productId, 
      url: savedUrl, 
      order_idx: photo.order_idx ?? i 
    });
  }

  revalidatePath('/products');
  return { success: true };
}

export async function updateProductAction(id: string, data: Record<string, any>) {
  const user = await getAuthenticatedUser();
  const isAdmin = hasPermission(user, 'products:read_all');

  const getProductUseCase = getInjection('IGetProductUseCase');
  const product = await getProductUseCase(id);
  
  // Security: If not admin, must own the product
  if (!isAdmin && product?.vendor_id !== user.id) {
    throw new Error('You can only update your own products');
  }

  const updateProductUseCase = getInjection('IUpdateProductUseCase');
  const addPhoto      = getInjection('IAddProductPhotoUseCase');
  const deletePhoto   = getInjection('IDeleteProductPhotoUseCase');
  const updatePhoto   = getInjection('IUpdateProductPhotoUseCase');

  await updateProductUseCase(id, {
    category_id:      data.category_id,
    name:             data.name,
    description:      data.description ?? null,
    price_min:        Number(data.price_min ?? 0),
    price_max:        Number(data.price_max ?? 0),
    concurrent_slots: Number(data.concurrent_slots ?? 1),
    is_active:        data.is_active,
  });

  // Granular Photo Management
  if (Array.isArray(data.photos)) {
    const existingPhotos = product?.photos ?? [];
    const incomingPhotos = (data.photos as any[]).slice(0, 5);

    // 1. Identify and Delete photos that are no longer present
    const incomingUrls = incomingPhotos.map(p => p?.url).filter(Boolean);
    for (const ph of existingPhotos) {
      if (!incomingUrls.includes(ph.url)) {
        await deleteProductPhotoFile(ph.url);
        await deletePhoto(ph.id);
      }
    }

    // 2. Add or Update remaining photos
    for (let i = 0; i < incomingPhotos.length; i++) {
      const p = incomingPhotos[i];
      if (!p?.url?.trim()) continue;

      if (p.url.startsWith('data:image/')) {
        // This is a new photo
        const savedUrl = await saveBase64Image(p.url, id, i);
        await addPhoto({ 
          id: generateIdFromEntropySize(10), 
          product_id: id, 
          url: savedUrl, 
          order_idx: i 
        });
      } else {
        // This is an existing photo, check if it needs position update
        const existing = existingPhotos.find(ex => ex.url === p.url);
        if (existing && existing.order_idx !== i) {
          await updatePhoto(existing.id, { order_idx: i });
        }
      }
    }
  }

  revalidatePath('/products');
  return { success: true };
}

export async function deleteProductAction(id: string) {
  const user = await getAuthenticatedUser();
  const isAdmin = hasPermission(user, 'products:read_all');

  const getProductUseCase = getInjection('IGetProductUseCase');
  const product = await getProductUseCase(id);

  // Security: If not admin, must own the product
  if (!isAdmin && product?.vendor_id !== user.id) {
    throw new Error('You can only delete your own products');
  }

  // Delete files
  if (product?.photos) {
    for (const ph of product.photos) {
      await deleteProductPhotoFile(ph.url);
    }
  }

  const deleteProduct = getInjection('IDeleteProductUseCase');
  await deleteProduct(id);
  revalidatePath('/products');
  return { success: true };
}

import fs from 'fs/promises';
import path from 'path';
import { AppError } from '../utils/appError';

export interface StoredFile {
  storage_key: string;
  file_size: number;
}

export interface StorageDriver {
  upload(key: string, content: Buffer, mimeType: string): Promise<StoredFile>;
  download(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

class LocalStorageDriver implements StorageDriver {
  constructor(private root: string) {}

  private resolve(key: string): string {
    const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
    const full = path.join(this.root, normalized);
    if (!full.startsWith(path.resolve(this.root))) {
      throw new AppError('Invalid storage key', 400);
    }
    return full;
  }

  async upload(key: string, content: Buffer, _mimeType: string): Promise<StoredFile> {
    const full = this.resolve(key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, content);
    return { storage_key: key, file_size: content.length };
  }

  async download(key: string): Promise<Buffer> {
    const full = this.resolve(key);
    try {
      return await fs.readFile(full);
    } catch {
      throw new AppError('File not found in storage', 404);
    }
  }

  async delete(key: string): Promise<void> {
    const full = this.resolve(key);
    await fs.rm(full, { force: true });
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolve(key));
      return true;
    } catch {
      return false;
    }
  }
}

class S3CompatibleStorageDriver implements StorageDriver {
  async upload(): Promise<StoredFile> {
    throw new AppError('S3 storage is not configured. Set STORAGE_DRIVER=local in development.', 501);
  }
  async download(): Promise<Buffer> {
    throw new AppError('S3 storage is not configured', 501);
  }
  async delete(): Promise<void> {
    throw new AppError('S3 storage is not configured', 501);
  }
  async exists(): Promise<boolean> {
    return false;
  }
}

export class StorageService {
  private driver: StorageDriver;

  constructor() {
    const driverName = (process.env.STORAGE_DRIVER || 'local').toLowerCase();
    if (driverName === 's3') {
      this.driver = new S3CompatibleStorageDriver();
    } else {
      const root = process.env.STORAGE_LOCAL_ROOT || path.join(process.cwd(), 'uploads');
      this.driver = new LocalStorageDriver(root);
    }
  }

  upload(key: string, content: Buffer, mimeType: string) {
    return this.driver.upload(key, content, mimeType);
  }

  download(key: string) {
    return this.driver.download(key);
  }

  delete(key: string) {
    return this.driver.delete(key);
  }

  exists(key: string) {
    return this.driver.exists(key);
  }
}

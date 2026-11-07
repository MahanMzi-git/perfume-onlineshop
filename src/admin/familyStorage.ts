import { familyImageUrl, noteImageUrl } from '../data/fragranceImages';
import type { AdminRecord } from './model';

async function openRecordStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('aroma-seller', 2);
    request.onupgradeneeded = () => {
      for (const store of ['families', 'notes']) {
        if (!request.result.objectStoreNames.contains(store)) request.result.createObjectStore(store, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSavedRecords(section: 'families' | 'notes'): Promise<AdminRecord[]> {
  const db = await openRecordStorage();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction(section).objectStore(section).getAll();
      request.onsuccess = () => {
        const records: AdminRecord[] = request.result;
        const prefix = import.meta.env.BASE_URL + (section === 'notes' ? 'images/seller-notes/' : 'images/seller-families/');
        const imageUrl = section === 'notes' ? noteImageUrl : familyImageUrl;
        resolve(records.map(record => {
          if (!record.logo?.startsWith(prefix)) return record;
          const slug = record.logo.slice(prefix.length).match(/^([a-z0-9-]+)\.png$/)?.[1];
          return slug ? { ...record, logo: imageUrl(slug) } : record;
        }));
      };
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function saveRecord(section: 'families' | 'notes', record: AdminRecord): Promise<void> {
  const db = await openRecordStorage();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(section, 'readwrite');
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
      transaction.objectStore(section).put(record);
    });
  } finally {
    db.close();
  }
}

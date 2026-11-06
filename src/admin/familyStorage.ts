import type { AdminRecord } from './model';

async function openFamilyStorage(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('aroma-seller', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('families', { keyPath: 'id' });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function loadSavedFamilies(): Promise<AdminRecord[]> {
  const db = await openFamilyStorage();
  try {
    return await new Promise((resolve, reject) => {
      const request = db.transaction('families').objectStore('families').getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    db.close();
  }
}

export async function saveFamily(record: AdminRecord): Promise<void> {
  const db = await openFamilyStorage();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('families', 'readwrite');
      transaction.oncomplete = () => resolve();
      transaction.onabort = () => reject(transaction.error);
      transaction.objectStore('families').put(record);
    });
  } finally {
    db.close();
  }
}

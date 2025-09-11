import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BrowserStorageService {

  browserStorageAvailable: BehaviorSubject<BrowserStorageAvailable>;
  constructor() {
    this.browserStorageAvailable = new BehaviorSubject<BrowserStorageAvailable>(undefined);
  }


  detectAppStorageOptions(): Observable<BrowserStorageAvailable> {
    return from(this.isIndexedDBAvailable()).pipe(
      map(indexedDBResult => ({
        localStorage: this.isLocalStorageAvailable(),
        indexedDB: indexedDBResult,
        cookies: {
          navigatorEnabled: navigator.cookieEnabled,
          successfulWrite: this.canWriteCookie()
        }
      }))
    );
  }

  isLocalStorageAvailable() {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  isIndexedDBAvailable(): Promise<{ success: boolean; failType: string }> {
    return new Promise((resolve) => {
      if (!window.indexedDB) {
        resolve({ success: false, failType: 'not_supported' });
        return;
      }

      let dbOperationsResolved = false;

      try {
        const request = indexedDB.open('__test_db__', 1);

        request.onerror = () => {
          dbOperationsResolved = true;
          resolve({ success: false, failType: 'open_error' });
        };

        request.onblocked = () => {
          dbOperationsResolved = true;
          resolve({ success: false, failType: 'blocked' });
        };

        request.onsuccess = () => {
          dbOperationsResolved = true;
          try {
            const db = request.result;
            db.close();
            const deleteRequest = indexedDB.deleteDatabase('__test_db__');
            deleteRequest.onsuccess = () => {
              resolve({ success: true, failType: '' });
            };
            deleteRequest.onerror = () => {
              resolve({ success: true, failType: '' });
            };
          } catch (e) {
            resolve({ success: false, failType: 'close_or_delete_error' });
          }
        };

        // * Firefox/Safari/Edge may not throw exception on open, nor execute callbacks immediately
        setTimeout(() => {
          if (!dbOperationsResolved) {
            const userAgent = navigator.userAgent;
            resolve({ success: false, failType: `timeout_${userAgent}` });
          }
        }, 10000);
      } catch (e) {
        resolve({ success: false, failType: 'exception' });
      }
    });
  }

  // * navigatorEnabled not well documented or reliable, so test writes also
  canWriteCookie() {
    try {
      const testValue = 'test_' + Date.now();
      const testName = '__cookie_test__';

      document.cookie = `${testName}=${testValue}; SameSite=Strict; path=/`;
      const cookies = document.cookie.split(';');
      const testCookie = cookies.find(cookie =>
        cookie.trim().startsWith(`${testName}=`)
      );
      const successfulWrite = testCookie && testCookie.includes(testValue);
      if (successfulWrite) {
        document.cookie = `${testName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
      }

      return successfulWrite;
    } catch (e) {
      return false;
    }
  }

}

export interface BrowserStorageAvailable {
  localStorage: boolean;
  indexedDB: {
    success: boolean;
    failType: string;
  };
  cookies: {
    navigatorEnabled: boolean;
    successfulWrite: boolean;
  };
}
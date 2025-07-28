import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BrowserStorageService {

  // browserStorageAvailable: BehaviorSubject<BrowserStorageAvailable>;
  constructor() { }


  detectAppStorageOptions(): Observable<BrowserStorageAvailable> {
  return from(this.isIndexedDBAvailable()).pipe(
    map(indexedDB => ({
      localStorage: this.isLocalStorageAvailable(),
      indexedDB,
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
  
  isIndexedDBAvailable(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!window.indexedDB) {
      resolve(false);
      return;
    }

    let dbOperationsResolved = false;

    try {
      const request = indexedDB.open('__test_db__', 1);

      request.onerror = () => {
        dbOperationsResolved = true;
        resolve(false);
      };

      request.onblocked = () => {
        dbOperationsResolved = true;
        resolve(false);
      };

      request.onsuccess = () => {
        dbOperationsResolved = true;
        try {
          const db = request.result;
          db.close();
          const deleteRequest = indexedDB.deleteDatabase('__test_db__');
          deleteRequest.onsuccess = () => resolve(true);
          deleteRequest.onerror = () => resolve(true); 
        } catch (e) {
          resolve(false);
        }
      };

      // * Firefox/SAfari may not throw exception on open, nor execute callbacks immediately
      setTimeout(() => {
        if (!dbOperationsResolved) {
          const userAgent = navigator.userAgent;
          const isFirefox = userAgent.includes('Firefox');
          if (isFirefox) {
            console.log('Firefox detected, IndexedDB fail');
            resolve(false);
          }
        }
      }, 1000);
    } catch (e) {
      resolve(false);
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
  indexedDB: boolean;
  cookies: {
    navigatorEnabled: boolean;
    successfulWrite: boolean;
  };
}
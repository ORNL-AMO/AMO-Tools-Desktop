import { Injectable } from "@angular/core";

/**
 * Read/Write local Storage
 * NOTE: NGX-WebStorage's LocalStorageService could be subbed in (same API),
 * but must be added to module providersdynamically or errors will be thrown on app startup if the user has disallowed site data privileges
 */
@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {

  retrieve(key: string): any {
    try {
      const value = localStorage.getItem(key);
      if (!value) { 
        return null; 
      } else {
        return JSON.parse(value);
      }
    } catch (e) {
      console.error('Error retrieving from localStorage', e);
      return null;
    }
  }

  store(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { 
      console.error('Error storing to localStorage', e);
    } 
  }
}

import { Injectable } from "@angular/core";
import { LocalStorageKey } from "./models/app";

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
      return value ? JSON.parse(value) : null;
    } catch (e) {
      console.error(`Error retrieving from localStorage for key: ${key}`, e);
      return null;
    }
  }

  store(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) { 
      console.error(`Error storing to localStorage for key: ${key}`, e);
    } 
  }

  clearUserControlledKey(key: LocalStorageKey): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error clearing user-controlled localStorage for key: ${key}`, e);
    }
  }

}

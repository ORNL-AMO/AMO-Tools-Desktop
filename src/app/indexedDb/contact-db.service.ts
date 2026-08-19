import { Injectable } from '@angular/core';
import { NgxIndexedDBService } from 'ngx-indexed-db';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Contact } from '../shared/models/settings';
import { ContactStoreMeta } from './dbConfig';

export interface SavedContact extends Contact {
  id?: number;
}

@Injectable()
export class ContactDbService {
  storeName: string = ContactStoreMeta.store;
  allContacts: Array<SavedContact> = [];
  dbContacts: BehaviorSubject<Array<SavedContact>>;

  constructor(private dbService: NgxIndexedDBService) {
    this.dbContacts = new BehaviorSubject<Array<SavedContact>>([]);
  }

  async setAll(contacts?: Array<SavedContact>) {
    this.allContacts = contacts ?? await firstValueFrom(this.getAllContacts());
    this.dbContacts.next(this.allContacts);
  }

  getAllContacts(): Observable<Array<SavedContact>> {
    return this.dbService.getAll(this.storeName);
  }

  addWithObservable(contact: SavedContact): Observable<SavedContact> {
    return this.dbService.add(this.storeName, contact);
  }

  deleteByIdWithObservable(contactId: number): Observable<any> {
    return this.dbService.delete(this.storeName, contactId);
  }

  updateWithObservable(contact: SavedContact): Observable<SavedContact> {
    return this.dbService.update(this.storeName, contact);
  }

  contactsMatch(existing: Contact, newContact: Contact): boolean {
    const existingEmail = existing.email?.trim().toLowerCase() ?? '';
    const newEmail = newContact.email?.trim().toLowerCase() ?? '';

    if (existingEmail && newEmail) {
      return existingEmail === newEmail;
    }

    const existingName = existing.contactName?.trim().toLowerCase() ?? '';
    const newName = newContact.contactName?.trim().toLowerCase() ?? '';
    if (!existingName && !newName && !existingEmail && !newEmail) return false;

    return existingName === newName &&
      (existing.phoneNumber ?? null) === (newContact.phoneNumber ?? null) &&
      existingEmail === newEmail;
  }

  async saveIfNew(newContact: Contact): Promise<void> {
    if (!newContact?.contactName?.trim() && !newContact?.email?.trim()) return;
    if (this.allContacts.some(existing => this.contactsMatch(existing, newContact))) return;

    await firstValueFrom(this.addWithObservable({ ...newContact }));
    await this.setAll();
  }
}

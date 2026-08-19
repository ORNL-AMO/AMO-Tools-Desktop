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

  contactsMatch(a: Contact, b: Contact): boolean {
    const aName = a?.contactName?.trim().toLowerCase() ?? '';
    const bName = b?.contactName?.trim().toLowerCase() ?? '';
    const aEmail = a?.email?.trim().toLowerCase() ?? '';
    const bEmail = b?.email?.trim().toLowerCase() ?? '';
    if (!aName && !bName && !aEmail && !bEmail) return false;
    return aName === bName &&
      (a?.phoneNumber ?? null) === (b?.phoneNumber ?? null) &&
      aEmail === bEmail;
  }

  async saveIfNew(contact: Contact): Promise<void> {
    if (!contact?.contactName?.trim() && !contact?.email?.trim()) return;
    if (this.allContacts.some(existing => this.contactsMatch(existing, contact))) return;

    await firstValueFrom(this.addWithObservable({ ...contact }));
    await this.setAll();
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PwaService {

  displayUpdateToast: BehaviorSubject<boolean>;
  constructor() {
    this.displayUpdateToast = new BehaviorSubject<boolean>(undefined)
   }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';

@Injectable()
export class FsatService {


  mainTab:BehaviorSubject<string>

  constructor() { 
    this.mainTab = new BehaviorSubject<string>('system-setup');
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable()
export class HelpPanelService {

  currentField: BehaviorSubject<string>;
  constructor() { 
    this.currentField = new BehaviorSubject<string>('default');
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ModifyConditionsService {
  modifyConditionsTab: BehaviorSubject<string>;
  constructor() {
    this.modifyConditionsTab = new BehaviorSubject<string>('fan-field-data')
   }

}

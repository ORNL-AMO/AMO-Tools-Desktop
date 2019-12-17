import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class ToolsService {

  showAddDataSet: BehaviorSubject<boolean>;
  constructor() { 
    this.showAddDataSet = new BehaviorSubject<boolean>(false);
  }
}

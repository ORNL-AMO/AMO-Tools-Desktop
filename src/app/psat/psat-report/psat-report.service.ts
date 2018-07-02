import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class PsatReportService {

  showPrint: BehaviorSubject<boolean>;

  constructor() {
    this.showPrint = new BehaviorSubject<boolean>(false);
  }

}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from '../../../../node_modules/rxjs';

@Injectable()
export class FsatReportService {

  showPrint: BehaviorSubject<boolean>;

  constructor() {
    this.showPrint = new BehaviorSubject<boolean>(false);
  }

}

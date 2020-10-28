import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class WasteWaterAnalysisService {

  analysisTab: BehaviorSubject<string>;

  constructor() { 
    this.analysisTab = new BehaviorSubject<string>('graphs');
  }
}
